# 🤖 AI Instructions & Model Behavior Specification
## Crop Detector — AI Service Design, Prompts & Inference Logic

**Version:** 1.0.0  
**Date:** June 2026

---

## 1. Overview

Crop Detector uses a **two-layer AI architecture**:

1. **Vision Model (EfficientNetV2)** — Classifies crop type + disease from image
2. **Language Model (Claude Sonnet via Anthropic API)** — Generates natural language disease reports, treatment plans, and advisory text

This document defines the behavior, prompts, guardrails, and decision logic for both layers.

---

## 2. Vision Model (Classification Layer)

### 2.1 Model: EfficientNetV2-B3 (ONNX)

The image classification model is a fine-tuned EfficientNetV2-B3 trained to output one of 38 classes:

```
Classes (examples):
  TOMATO_HEALTHY
  TOMATO_EARLY_BLIGHT
  TOMATO_LATE_BLIGHT
  TOMATO_LEAF_MOLD
  POTATO_HEALTHY
  POTATO_EARLY_BLIGHT
  POTATO_LATE_BLIGHT
  RICE_BLAST
  RICE_BACTERIAL_LEAF_BLIGHT
  WHEAT_RUST_YELLOW
  WHEAT_RUST_BROWN
  MAIZE_NORTHERN_LEAF_BLIGHT
  MAIZE_GRAY_LEAF_SPOT
  COTTON_LEAF_CURL
  GROUNDNUT_EARLY_LEAF_SPOT
  ... (38 total classes)
```

### 2.2 Preprocessing Pipeline

```python
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    1. Decode image
    2. Quality check (blur + resolution)
    3. Resize to 380x380
    4. Normalize with ImageNet mean/std
    5. Return NCHW tensor
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # Quality check
    gray = np.array(img.convert("L"))
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian_var < 80:
        raise ImageQualityError("Image too blurry. Please retake in better lighting.")
    
    if img.size[0] < 224 or img.size[1] < 224:
        raise ImageQualityError("Image resolution too low. Minimum 224x224 required.")
    
    # Resize & normalize
    img = img.resize((380, 380))
    img_array = np.array(img, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img_array = (img_array - mean) / std
    img_array = np.transpose(img_array, (2, 0, 1))  # HWC → CHW
    return np.expand_dims(img_array, axis=0)         # Add batch dim
```

### 2.3 Inference & Confidence Thresholds

```python
CONFIDENCE_THRESHOLDS = {
    "high":    0.85,   # Show result directly
    "medium":  0.60,   # Show with "moderate confidence" disclaimer
    "low":     0.40,   # Show top-3 candidates, prompt user to confirm
    "reject":  0.40,   # Below this → "Unable to detect, consult expert"
}

def interpret_result(predictions: dict) -> InferenceResult:
    top_class = predictions["class"]
    confidence = predictions["confidence"]
    
    if confidence < CONFIDENCE_THRESHOLDS["reject"]:
        return InferenceResult(
            status="UNCERTAIN",
            message="Detection confidence too low. Try uploading a clearer close-up photo of the affected leaf.",
            suggestions=predictions["top_3"]
        )
    elif confidence < CONFIDENCE_THRESHOLDS["medium"]:
        return InferenceResult(
            status="LOW_CONFIDENCE",
            disclaimer=True,
            ...
        )
    else:
        return InferenceResult(status="SUCCESS", ...)
```

### 2.4 GradCAM Heatmap Generation

- Class Activation Maps (GradCAM) highlight which regions of the image contributed to the classification
- Overlay is generated post-inference with 60% opacity on original image
- Color scale: Blue (healthy) → Yellow (mild) → Red (severe)

```python
def generate_gradcam(model, image_tensor, target_class_idx):
    # Register hooks on last conv layer
    # Compute gradients w.r.t. target class
    # Generate weighted activation map
    # Resize to original image dimensions
    # Return base64 encoded PNG overlay
    ...
```

---

## 3. Language Model Layer (Report Generation)

The LLM is used to generate the **human-readable disease report**, **advisory text**, and **multilingual output**.

### 3.1 Model Used

```
Provider:    Anthropic
Model:       claude-sonnet-4-20250514
Max Tokens:  1200
Temperature: 0.3   (low for factual content)
```

### 3.2 System Prompt

```
You are AgriDoc — an expert agricultural scientist and plant pathologist with deep knowledge of Indian crop diseases, integrated pest management, and organic farming practices.

Your role is to generate accurate, practical, and farmer-friendly disease analysis reports based on AI-detected crop conditions.

RULES:
1. Always write in clear, simple language. Avoid overly technical jargon unless absolutely necessary.
2. Provide BOTH organic and chemical treatment options. Always mention organic options first.
3. Include dosage/concentration recommendations where relevant.
4. Never diagnose with 100% certainty — use language like "likely", "typically", "commonly associated with".
5. Always include a safety disclaimer: "For severe infections, consult a local KVK or agricultural officer."
6. If the crop appears HEALTHY, provide general care tips for that crop and season.
7. Be encouraging and non-alarmist. Farmers are already under stress — be a calm, helpful expert.
8. Output ONLY valid JSON. No markdown, no code blocks, no extra text.
```

### 3.3 User Prompt Template

```
Generate a detailed disease report for the following detection result:

Crop: {{crop_name}}
Detected Condition: {{disease_name}}
Confidence: {{confidence}}%
Severity: {{severity}}
Is Healthy: {{is_healthy}}
Season: {{current_season}}
Location: {{user_state}} (India)
User's Preferred Language: {{language}}

Output this JSON structure:
{
  "overview": "2-3 sentence overview of the condition",
  "cause": "What causes this disease",
  "causeType": "FUNGAL | BACTERIAL | VIRAL | PEST | NUTRIENT_DEFICIENCY | ENVIRONMENTAL",
  "progressionRisk": "What happens if untreated",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "organicTreatments": ["treatment 1", "treatment 2"],
  "chemicalTreatments": ["treatment 1 (chemical name, dosage)", "treatment 2"],
  "preventiveMeasures": ["measure 1", "measure 2", "measure 3"],
  "bestPractices": ["tip 1", "tip 2"],
  "affectedCropStage": ["seedling", "vegetative", "flowering"],
  "farmerTip": "One personalized tip for {{user_state}} farmers this season",
  "urgencyLevel": "LOW | MEDIUM | HIGH | CRITICAL"
}
```

### 3.4 Report Generation Flow

```
Scan Completed (vision model result)
         ↓
Check DiseaseKB cache (does this disease_id already have a cached report?)
         ↓ (cache miss)
Build LLM prompt with detection context + weather/season data
         ↓
Call Claude Sonnet API (async, max 1200 tokens)
         ↓
Parse JSON response
         ↓
Translate to user's language (if not English) via i18n + LLM
         ↓
Save to Report table + cache in Redis (1 hour)
         ↓
Push "Scan Ready" notification to user
```

### 3.5 Multilingual Report Generation

For non-English output, a second LLM call translates the report:

```
System: You are a professional agricultural content translator. Translate the following report accurately into {{target_language}}. Keep all technical terms accurate. Use simple vocabulary appropriate for rural farmers.

User: {{english_report_json}}

Output: The same JSON structure, all string values translated to {{target_language}}.
```

Supported: Hindi (HI), Bengali (BN), Telugu (TE), Tamil (TA), Marathi (MR), Kannada (KN)

---

## 4. Fallback Logic

| Scenario | Fallback Action |
|---|---|
| Vision model confidence < 40% | Show top-3 candidates; ask user to confirm crop type manually |
| AI service unavailable | Return pre-cached report from DiseaseKB if available |
| LLM API timeout (>8s) | Return static template report from DB |
| Unknown disease class | Default to general "plant stress" report with expert referral |
| Non-crop image detected | Prompt: "This doesn't look like a crop image. Please upload a photo of your plant or leaf." |

---

## 5. Input Validation Rules

| Check | Condition | Error Message |
|---|---|---|
| File size | > 10MB | "Image too large. Please compress and retry." |
| File type | Not JPEG/PNG/WEBP | "Only JPEG, PNG, and WEBP images are supported." |
| Resolution | < 224×224 | "Image resolution too low for accurate detection." |
| Blur score | Laplacian variance < 80 | "Image appears blurry. Retake in good lighting." |
| NSFW check | Adult/violent content | "This image cannot be processed." (silent rejection) |
| Non-plant | Confidence on any crop class < 20% | "No plant detected in this image." |

---

## 6. AI Ethics & Guardrails

- **No medical/human health claims** — The app only diagnoses plants, not humans
- **Disclaimer on all reports**: "This analysis is AI-assisted. For critical decisions, consult a certified agronomist."
- **No pesticide brand promotion** — Only generic chemical names are mentioned
- **Bias monitoring**: Model accuracy is tracked per crop type and region quarterly to identify underperformance on minority crop classes
- **Audit log**: All AI predictions logged with timestamp, confidence, and model version for traceability
- **Opt-out**: Users can opt out of contributing scan data to model improvement
