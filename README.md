# 🌾 Crop Detector — AI-Powered Crop Health & Disease Detection Platform

Welcome to the **Crop Detector** repository. This is a mobile-first PWA designed to help farmers photograph their crops and instantly receive crop health analysis, disease detection, and detailed treatment reports in regional languages.

---

## 📂 Documentation

All design, architectural, and requirement documents are located in the [Docs/](file:///Users/soumyachakraborty/Documents/D/Crop%20Detector/Docs) directory:

- 📋 [01_PRD.md](file:///Users/soumyachakraborty/Documents/D/Crop%20Detector/Docs/01_PRD.md) — Product Requirements Document (goals, features, audience)
- 🛠️ [02_TRD.md](file:///Users/soumyachakraborty/Documents/D/Crop%20Detector/Docs/02_TRD.md) — Technical Requirements Document (architecture, APIs, infrastructure)
- 🗄️ [03_Backend_Schema.md](file:///Users/soumyachakraborty/Documents/D/Crop%20Detector/Docs/03_Backend_Schema.md) — Database schema (Prisma), Redis, data retention
- 🤖 [04_AI_Instructions.md](file:///Users/soumyachakraborty/Documents/D/Crop%20Detector/Docs/04_AI_Instructions.md) — Vision model pipeline, LLM prompts, inference logic
- 🔄 [05_App_Flow.md](file:///Users/soumyachakraborty/Documents/D/Crop%20Detector/Docs/05_App_Flow.md) — User flows, state machines, page navigation
- 📂 [06_File_Structure.md](file:///Users/soumyachakraborty/Documents/D/Crop%20Detector/Docs/06_File_Structure.md) — Monorepo directory structure, env configuration
- 🎨 [07_UIUX.md](file:///Users/soumyachakraborty/Documents/D/Crop%20Detector/Docs/07_UIUX.md) — Design system, color tokens, typography, UI wireframes

---

## 🧠 Key Features

- **Crop & Disease Identification**: AI model identifies the crop and detects potential diseases.
- **Heatmap Visualization**: GradCAM highlight overlay on the uploaded image to explain AI model attention points.
- **AI Treatment Reports**: Dynamic reports containing organic and chemical treatment advice.
- **Multilingual Support**: Supports English and 6 regional Indian languages.
- **Historical Analysis**: Tracks scans and regional disease outbreaks.
- **Weather Advisory**: Connects current weather context with disease patterns.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, Zustand, React Query
- **Backend API**: Node.js + Express, Prisma ORM, PostgreSQL, Redis, BullMQ
- **AI Service**: FastAPI, EfficientNetV2-B3 (PyTorch/ONNX), GradCAM
- **LLM Engine**: Claude Sonnet via Anthropic API for report generation
- **Infrastructure**: Docker, AWS (S3, CloudFront, ECS Fargate), GitHub Actions

---

*Crop Detector v1.0.0 — Created June 2026*