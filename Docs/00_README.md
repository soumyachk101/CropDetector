# 🌾 Crop Detector — Documentation Index

> AI-Powered Crop Health & Disease Detection Platform

---

## 📂 Documentation Files

| # | File | Description |
|---|---|---|
| 1 | `01_PRD.md` | Product Requirements Document — goals, features, audience, timeline |
| 2 | `02_TRD.md` | Technical Requirements Document — stack, architecture, APIs, infra |
| 3 | `03_Backend_Schema.md` | Database schema (Prisma), Redis strategy, data retention |
| 4 | `04_AI_Instructions.md` | Vision model pipeline, LLM prompts, inference logic, guardrails |
| 5 | `05_App_Flow.md` | User flows, state machines, screen-by-screen interaction |
| 6 | `06_File_Structure.md` | Full monorepo directory layout, env vars |
| 7 | `07_UIUX.md` | Design system, color tokens, typography, components, wireframes |

---

## 🧠 Project Summary

**Crop Detector** is a mobile-first PWA that allows farmers to photograph their crops and instantly receive:

- ✅ Crop type identification
- 🔬 Disease detection with GradCAM heatmap visualization
- 📋 Detailed AI-generated treatment report (organic + chemical)
- 🌍 Regional language support (6 Indian languages)
- 📊 Scan history & field health trends
- 🌤️ Weather-aware disease advisory

---

## 🛠️ Tech Stack (Summary)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TailwindCSS, Zustand, React Query |
| Backend | Node.js + Express, Prisma, PostgreSQL, Redis, BullMQ |
| AI Engine | FastAPI, EfficientNetV2-B3, ONNX Runtime, GradCAM |
| LLM | Claude Sonnet (Anthropic) for report generation |
| Storage | AWS S3 + CloudFront |
| Infra | AWS ECS Fargate, GitHub Actions CI/CD |

---

*Generated June 2026 — Crop Detector v1.0.0*
