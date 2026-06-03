# 📋 Product Requirements Document (PRD)
## Crop Detector — AI-Powered Crop Health & Disease Analysis Platform

**Version:** 1.0.0  
**Date:** June 2026  
**Author:** Product Team  
**Status:** Draft

---

## 1. Executive Summary

Crop Detector is a mobile-first web application that lets farmers, agronomists, and agricultural students identify crop species, detect diseases, assess soil health indicators, and receive actionable treatment recommendations — all by uploading a photo of their crop or leaf. It combines computer vision AI with a knowledge base of 200+ crop diseases across major Indian and global crops.

---

## 2. Problem Statement

### Current Pain Points
- Indian farmers lose 35–40% of yield annually due to undetected or late-detected crop diseases
- Most farmers lack access to agronomists; nearest expert may be 50–100km away
- Existing solutions are either too technical (lab testing) or too generic (basic chatbots)
- Language barrier: most agri-tech apps don't support regional languages
- No single tool combines disease detection + treatment + market crop price context

### Target Audience

| Segment | Description | Priority |
|---|---|---|
| Small-scale farmers | 0–5 acres, smartphone users, rural India | P0 |
| Agronomists / KVK workers | Field experts needing quick second opinion | P1 |
| Agricultural students | Research and learning use case | P1 |
| Export-grade farmers | Higher need for precise disease grading | P2 |

---

## 3. Goals & Success Metrics

### Business Goals
- Reduce crop disease-related loss for end users by providing timely detection
- Build a trusted brand in agri-tech AI for India

### Success Metrics (OKRs)

| Metric | Target (3 months post-launch) |
|---|---|
| MAU (Monthly Active Users) | 10,000+ |
| Detection Accuracy | ≥ 88% top-1 accuracy |
| Avg. session time | ≥ 3 minutes |
| User satisfaction (CSAT) | ≥ 4.2 / 5 |
| Reports generated per day | 500+ |
| Retention (D7) | ≥ 30% |

---

## 4. Core Features

### 4.1 Crop & Disease Detection (P0)
- User uploads image of crop / leaf / plant
- AI model identifies: crop type, disease name, confidence score, severity level (mild / moderate / severe)
- Returns: visual annotated image with highlighted affected areas

### 4.2 Detailed Disease Report (P0)
- Disease name + description
- Likely cause (fungal / bacterial / viral / nutrient deficiency / pest)
- Progression risk if untreated
- Recommended organic and chemical treatment
- Preventive measures for the season

### 4.3 Crop History / Dashboard (P1)
- Timeline of all scans per user
- Crop health trend over time
- Field-level grouping (user can name their fields)

### 4.4 Offline Support (P1)
- PWA with service workers
- Last 5 scan results cached offline
- Offline detection using a lightweight on-device model (TFLite)

### 4.5 Regional Language Support (P1)
- Hindi, Bengali, Telugu, Tamil, Marathi, Kannada
- Language auto-detect from phone locale

### 4.6 Weather-Aware Advisory (P2)
- Integrates OpenWeatherMap API
- If rain forecast → warn about fungal disease risk
- Crop-season calendar integration

### 4.7 Community Feed (P2)
- Farmers can post scan results with their region
- Heatmap of disease outbreaks in district/state

### 4.8 Expert Connect (P2)
- Book a 15-minute consultation with verified agronomists
- In-app chat with scan context pre-loaded

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Detection result in ≤ 4 seconds on 4G |
| Availability | 99.5% uptime SLA |
| Scalability | Handle 10,000 concurrent scans |
| Security | No raw image stored > 24 hours; GDPR + IT Act compliant |
| Accessibility | WCAG 2.1 AA; screen reader compatible |
| Device Support | Android 9+, iOS 14+, modern browsers |

---

## 6. User Journey (Happy Path)

```
Open App → Camera/Upload Image → AI Processing (spinner) →
Detection Result Screen → View Detailed Report →
Save to History → Share Report (WhatsApp / PDF)
```

---

## 7. Out of Scope (v1.0)

- Drone-based field scanning
- Yield prediction model
- Soil nutrient lab integration
- Marketplace for pesticides/fertilizers
- IoT sensor integration

---

## 8. Assumptions & Dependencies

- User has a smartphone with camera (8MP+)
- Requires internet for cloud model inference (offline uses lite model)
- Disease knowledge base maintained by in-house agri scientists
- Image classification model pre-trained on PlantVillage + custom Indian crop dataset

---

## 9. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Low accuracy on Indian crop varieties | High | Fine-tune on desi crop dataset |
| User trust in AI diagnosis | Medium | Show confidence score + "consult expert" disclaimer |
| Poor image quality from rural cameras | High | Image quality check before inference; prompt user to retake |
| Language/literacy barrier | Medium | Voice-based output support |

---

## 10. Timeline

| Phase | Duration | Deliverable |
|---|---|---|
| Phase 1 — MVP | 8 weeks | Detection + Report + Basic Auth |
| Phase 2 — Growth | 6 weeks | Dashboard + Multilingual + PWA |
| Phase 3 — Community | 6 weeks | Community feed + Expert Connect |
