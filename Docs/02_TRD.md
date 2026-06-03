# 🔧 Technical Requirements Document (TRD)
## Crop Detector — System Architecture & Technical Specifications

**Version:** 1.0.0  
**Date:** June 2026  
**Author:** Engineering Team  
**Status:** Draft

---

## 1. System Overview

Crop Detector is a full-stack web + mobile application built on a microservices-inspired architecture. It comprises:

1. **Client** — Next.js 14 PWA (mobile-first)
2. **API Gateway** — Node.js / Express REST API
3. **AI Inference Service** — FastAPI (Python) serving a fine-tuned EfficientNetV2 model
4. **Background Worker** — BullMQ for async tasks (report generation, notifications)
5. **Storage** — PostgreSQL (primary), Redis (cache + queue), AWS S3 (image storage)

---

## 2. Technology Stack

### Frontend
| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, RSC, Image Optimization |
| Styling | TailwindCSS + shadcn/ui | Rapid UI, accessible components |
| State Management | Zustand + React Query | Lightweight; server-state separation |
| Camera API | react-camera-pro | Reliable mobile camera access |
| PWA | next-pwa (Workbox) | Offline caching, installable |
| i18n | next-intl | 6 regional languages |
| Charts | Recharts | Crop health trend visualization |

### Backend
| Layer | Technology | Reason |
|---|---|---|
| API Gateway | Node.js + Express | Familiar stack, fast REST APIs |
| Auth | JWT + Refresh Token + Google OAuth | Secure, stateless |
| Validation | Zod | Schema-first validation |
| ORM | Prisma | Type-safe DB access |
| Queue | BullMQ + Redis | Async report generation |
| File Upload | Multer → S3 | Streaming upload to S3 |

### AI / ML Service
| Layer | Technology | Reason |
|---|---|---|
| Framework | FastAPI | Async, fast, Python-native |
| Model | EfficientNetV2-B3 (fine-tuned) | High accuracy, low inference time |
| Runtime | ONNX Runtime | Hardware-agnostic inference |
| Image Processing | OpenCV + Pillow | Pre/post-processing pipeline |
| Explainability | GradCAM | Heatmap overlay on diseased areas |
| Lite Model | TFLite (MobileNetV3) | On-device offline detection |

### Infrastructure
| Component | Service |
|---|---|
| Cloud | AWS (EC2 / ECS Fargate) |
| Database | AWS RDS (PostgreSQL 15) |
| Cache | AWS ElastiCache (Redis) |
| Object Storage | AWS S3 + CloudFront CDN |
| CI/CD | GitHub Actions → ECR → ECS |
| Monitoring | Grafana + Prometheus + Sentry |
| Secrets | AWS Secrets Manager |

---

## 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (Next.js PWA)           │
│  Camera → Upload → Result UI → Dashboard         │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────┐
│              API GATEWAY (Express)               │
│  /auth  /scan  /report  /history  /user          │
└──────┬──────────────────────┬───────────────────┘
       │                      │
┌──────▼──────┐     ┌─────────▼──────────┐
│  PostgreSQL  │     │  AI Service        │
│  (Prisma)   │     │  (FastAPI + ONNX)  │
└─────────────┘     └────────────────────┘
       │                      │
┌──────▼──────┐     ┌─────────▼──────────┐
│    Redis    │     │     AWS S3          │
│  (BullMQ)  │     │  (Image Storage)    │
└─────────────┘     └────────────────────┘
```

---

## 4. API Specification

### Base URL: `https://api.cropdetector.app/v1`

#### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | Login, returns JWT + refresh token |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/google` | Google OAuth callback |
| POST | `/auth/logout` | Invalidate refresh token |

#### Scan & Detection

| Method | Endpoint | Description |
|---|---|---|
| POST | `/scan/upload` | Upload image → returns `scan_id` |
| GET | `/scan/:scanId` | Get scan result |
| GET | `/scan/:scanId/heatmap` | Get annotated heatmap image URL |
| GET | `/scan/history` | Paginated list of user's scans |
| DELETE | `/scan/:scanId` | Delete a scan |

#### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/report/:scanId` | Full detailed disease report |
| GET | `/report/:scanId/pdf` | Download report as PDF |
| POST | `/report/:scanId/share` | Generate shareable link |

#### User

| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/profile` | Get user profile |
| PATCH | `/user/profile` | Update profile + language preference |
| GET | `/user/fields` | List named farm fields |
| POST | `/user/fields` | Add new field |

---

## 5. AI Service Specification

### Inference Endpoint

```
POST /predict
Content-Type: multipart/form-data

Input:  image file (JPEG/PNG, max 10MB)
Output: JSON
{
  "crop_name": "Tomato",
  "disease_name": "Early Blight",
  "disease_id": "TOMATO_EARLY_BLIGHT_001",
  "confidence": 0.94,
  "severity": "moderate",
  "is_healthy": false,
  "heatmap_base64": "<base64 GradCAM image>",
  "inference_time_ms": 312
}
```

### Model Pipeline
```
Input Image
    ↓
Quality Check (blur detection, min resolution 224x224)
    ↓
Preprocessing (resize 380x380, normalize ImageNet stats)
    ↓
EfficientNetV2-B3 ONNX Inference
    ↓
Softmax → Top-3 Predictions
    ↓
GradCAM Heatmap Generation
    ↓
Disease DB Lookup (disease_id → report data)
    ↓
JSON Response
```

### Model Details
- **Base Architecture:** EfficientNetV2-B3
- **Dataset:** PlantVillage (54,305 images) + Custom Indian Crop Dataset (12,000 images)
- **Classes:** 38 disease classes across 14 crop types
- **Input Size:** 380 × 380 × 3
- **Top-1 Accuracy:** 91.3% (validation set)
- **Avg. Inference Time:** 280–350ms (CPU), 80–120ms (GPU)

---

## 6. Security Requirements

- All API endpoints require Bearer JWT (except `/auth/*`)
- Rate limiting: 100 req/min per IP; 20 scans/day per free user
- Image uploads scanned for malware via ClamAV before processing
- Images auto-deleted from S3 after 24h (unless user saves to history)
- Passwords hashed with bcrypt (cost factor 12)
- HTTPS enforced everywhere; HSTS headers set
- CORS whitelist: only production frontend domain

---

## 7. Performance Requirements

| Operation | SLA Target |
|---|---|
| Image upload (< 5MB on 4G) | ≤ 3 seconds |
| AI inference | ≤ 4 seconds end-to-end |
| Report page load | ≤ 1.5 seconds (LCP) |
| History list (50 items) | ≤ 500ms |
| PDF report generation | ≤ 8 seconds async |

---

## 8. Error Handling Strategy

| Error Code | Scenario | Response |
|---|---|---|
| 400 | Invalid image format / size | "Please upload a clear JPEG or PNG under 10MB" |
| 422 | Low quality image (blurry) | "Image too blurry — retake in better light" |
| 429 | Rate limit exceeded | "Daily scan limit reached. Upgrade to Pro." |
| 500 | Model inference failure | Fallback to manual crop selection flow |
| 503 | AI service down | Queue request; notify user via push when ready |

---

## 9. Testing Strategy

| Layer | Tools | Coverage Target |
|---|---|---|
| Unit Tests | Jest (FE), Pytest (AI) | ≥ 80% |
| Integration Tests | Supertest | All API endpoints |
| E2E Tests | Playwright | Core user flows |
| Load Testing | k6 | 1000 concurrent users |
| Model Evaluation | Custom eval script | Accuracy, precision, recall per class |
