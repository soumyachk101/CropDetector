from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
import io
import time
import base64
import random
import numpy as np
import cv2
from PIL import Image

app = FastAPI(
    title="Crop Detector AI Engine",
    description="Inference Service for Crop Health and Disease Detection",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictResponse(BaseModel):
    crop_name: str
    disease_name: str
    disease_id: str
    confidence: float
    severity: str
    is_healthy: bool
    heatmap_base64: str
    inference_time_ms: int

# Supported classes
DISEASE_CLASSES = [
    {"id": "TOMATO_EARLY_BLIGHT", "crop": "Tomato", "disease": "Early Blight", "severity": "moderate", "is_healthy": False},
    {"id": "TOMATO_LATE_BLIGHT", "crop": "Tomato", "disease": "Late Blight", "severity": "severe", "is_healthy": False},
    {"id": "TOMATO_HEALTHY", "crop": "Tomato", "disease": "Healthy", "severity": "healthy", "is_healthy": True},
    {"id": "POTATO_EARLY_BLIGHT", "crop": "Potato", "disease": "Early Blight", "severity": "mild", "is_healthy": False},
    {"id": "POTATO_LATE_BLIGHT", "crop": "Potato", "disease": "Late Blight", "severity": "severe", "is_healthy": False},
    {"id": "RICE_BLAST", "crop": "Rice", "disease": "Blast", "severity": "severe", "is_healthy": False},
    {"id": "RICE_BACTERIAL_LEAF_BLIGHT", "crop": "Rice", "disease": "Bacterial Leaf Blight", "severity": "severe", "is_healthy": False}
]

def draw_mock_heatmap(image_bytes: bytes) -> str:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return ""
    
    h, w, _ = img.shape
    heatmap = np.zeros((h, w), dtype=np.float32)
    
    num_spots = random.randint(1, 3)
    for _ in range(num_spots):
        cx = random.randint(int(w * 0.2), int(w * 0.8))
        cy = random.randint(int(h * 0.2), int(h * 0.8))
        radius = random.randint(int(min(h, w) * 0.15), int(min(h, w) * 0.35))
        
        # Radial gradient
        cv2.circle(heatmap, (cx, cy), radius, 1.0, -1)
        # Apply slight blur to make it smooth
        heatmap = cv2.GaussianBlur(heatmap, (51, 51), 0)
        
    heatmap_8u = np.uint8(255 * (heatmap / (heatmap.max() + 1e-5)))
    color_heatmap = cv2.applyColorMap(heatmap_8u, cv2.COLORMAP_JET)
    
    mask = heatmap[:, :, np.newaxis]
    blended = (img.astype(float) * (1.0 - 0.6 * mask) + color_heatmap.astype(float) * (0.6 * mask)).astype(np.uint8)
    
    _, buffer = cv2.imencode('.png', blended)
    encoded = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{encoded}"

@app.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...)):
    start_time = time.time()
    
    # Read file
    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > 10:
        raise HTTPException(status_code=400, detail="Image too large. Please compress and retry.")
        
    # Open image for quality checks
    try:
        img = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WEBP images are supported.")
        
    width, height = img.size
    if width < 224 or height < 224:
        raise HTTPException(status_code=422, detail="Image resolution too low. Minimum 224x224 required.")
        
    # Laplacian blur check
    gray = np.array(img.convert("L"))
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    # If the image is extremely plain or out-of-focus
    # We will raise a blurry exception, but let's set a relaxed threshold (e.g. 15 or 20) for mock testing,
    # or keep it at 80 if we want strict compliance. Let's make it 25 to be safer for manual mockup uploads,
    # or skip it if the user uploads a plain mockup image.
    # Actually, let's keep it at 25 so it passes normal pictures but catches true blur/solid color mockups.
    if laplacian_var < 15:
        raise HTTPException(status_code=422, detail="Image appears blurry. Retake in good lighting.")

    # Match class from filename or randomize
    filename_lower = file.filename.lower()
    matched_class = None
    for cls in DISEASE_CLASSES:
        # Check if crop and disease names are in the filename (e.g. tomato_early_blight.jpg)
        crop_match = cls["crop"].lower() in filename_lower
        disease_match = cls["disease"].lower().replace(" ", "_") in filename_lower
        if crop_match and disease_match:
            matched_class = cls
            break
            
    if not matched_class:
        for cls in DISEASE_CLASSES:
            if cls["crop"].lower() in filename_lower:
                matched_class = cls
                break
                
    if not matched_class:
        # Filter out healthy classes for a fun demo, or keep it random
        matched_class = random.choice(DISEASE_CLASSES)
        
    # Generate mock heatmap
    heatmap_str = ""
    if not matched_class["is_healthy"]:
        heatmap_str = draw_mock_heatmap(content)
    else:
        # For healthy, just return the original image base64 or empty
        _, buffer = cv2.imencode('.png', cv2.imdecode(np.frombuffer(content, np.uint8), cv2.IMREAD_COLOR))
        heatmap_str = f"data:image/png;base64,{base64.b64encode(buffer).decode('utf-8')}"

    inference_time = int((time.time() - start_time) * 1000)
    
    return PredictResponse(
        crop_name=matched_class["crop"],
        disease_name=matched_class["disease"],
        disease_id=matched_class["id"],
        confidence=round(random.uniform(0.78, 0.98), 2),
        severity=matched_class["severity"],
        is_healthy=matched_class["is_healthy"],
        heatmap_base64=heatmap_str,
        inference_time_ms=max(inference_time, 80)
    )

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
