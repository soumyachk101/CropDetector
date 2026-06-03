# 🗄️ Backend Schema & Database Design
## Crop Detector — Data Models, Prisma Schema & Redis Strategy

**Version:** 1.0.0  
**Date:** June 2026

---

## 1. Database: PostgreSQL 15

All data models are defined using **Prisma ORM**. Primary key strategy: `cuid()` for all tables.

---

## 2. Full Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// USER
// ─────────────────────────────────────────

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String?
  name           String
  avatarUrl      String?
  phone          String?
  role           Role      @default(FARMER)
  language       Language  @default(HINDI)
  isVerified     Boolean   @default(false)
  isPro          Boolean   @default(false)

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  lastActiveAt   DateTime?

  // Relations
  oauthAccounts  OAuthAccount[]
  scans          Scan[]
  fields         Field[]
  refreshTokens  RefreshToken[]
  notifications  Notification[]

  @@map("users")
}

enum Role {
  FARMER
  AGRONOMIST
  STUDENT
  ADMIN
}

enum Language {
  EN
  HI
  BN
  TE
  TA
  MR
  KN
}

// ─────────────────────────────────────────
// OAUTH
// ─────────────────────────────────────────

model OAuthAccount {
  id           String   @id @default(cuid())
  userId       String
  provider     String   // "google" | "facebook"
  providerAccountId String
  accessToken  String?
  refreshToken String?
  expiresAt    DateTime?

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("oauth_accounts")
}

// ─────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  isRevoked Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

// ─────────────────────────────────────────
// FIELD (Farm field / plot)
// ─────────────────────────────────────────

model Field {
  id          String   @id @default(cuid())
  userId      String
  name        String
  location    String?
  areaAcres   Float?
  cropType    String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  scans       Scan[]

  @@map("fields")
}

// ─────────────────────────────────────────
// SCAN
// ─────────────────────────────────────────

model Scan {
  id              String      @id @default(cuid())
  userId          String
  fieldId         String?

  // Image
  originalImageUrl  String
  heatmapImageUrl   String?
  imageSizeKb       Int?
  imageQualityScore Float?

  // Detection Result
  status          ScanStatus  @default(PENDING)
  cropName        String?
  diseaseName     String?
  diseaseId       String?
  confidence      Float?
  severity        Severity?
  isHealthy       Boolean?
  inferenceTimeMs Int?

  // AI raw output (top-3 predictions stored as JSON)
  predictionsJson Json?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  field           Field?      @relation(fields: [fieldId], references: [id])
  report          Report?

  @@index([userId])
  @@index([createdAt])
  @@map("scans")
}

enum ScanStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum Severity {
  HEALTHY
  MILD
  MODERATE
  SEVERE
}

// ─────────────────────────────────────────
// DISEASE REPORT
// ─────────────────────────────────────────

model Report {
  id                  String   @id @default(cuid())
  scanId              String   @unique
  diseaseId           String?

  // Report content (can be populated from DiseaseKB or AI-generated)
  overview            String?
  cause               String?
  causeType           CauseType?
  progressionRisk     String?
  symptoms            String[]
  organicTreatments   String[]
  chemicalTreatments  String[]
  preventiveMeasures  String[]
  bestPractices       String[]
  affectedCropStage   String[]

  // Shareable link
  shareToken          String?  @unique
  shareExpiresAt      DateTime?

  generatedAt         DateTime @default(now())

  scan                Scan     @relation(fields: [scanId], references: [id], onDelete: Cascade)
  diseaseKb           DiseaseKB? @relation(fields: [diseaseId], references: [id])

  @@map("reports")
}

enum CauseType {
  FUNGAL
  BACTERIAL
  VIRAL
  PEST
  NUTRIENT_DEFICIENCY
  ENVIRONMENTAL
  UNKNOWN
}

// ─────────────────────────────────────────
// DISEASE KNOWLEDGE BASE
// ─────────────────────────────────────────

model DiseaseKB {
  id                  String   @id  // e.g. "TOMATO_EARLY_BLIGHT_001"
  cropName            String
  diseaseName         String
  localNames          Json?    // { "hi": "अगेती झुलसा", "bn": "আগাম ব্লাইট" }
  causeType           CauseType
  causativeAgent      String?
  overview            String
  symptoms            String[]
  organicTreatments   String[]
  chemicalTreatments  String[]
  preventiveMeasures  String[]
  progressionInfo     String?
  referenceImageUrl   String?
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  reports             Report[]

  @@map("disease_kb")
}

// ─────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotifType
  title     String
  body      String
  isRead    Boolean  @default(false)
  metadata  Json?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

enum NotifType {
  SCAN_COMPLETE
  DISEASE_ALERT
  WEATHER_ADVISORY
  SYSTEM
}
```

---

## 3. Redis Data Strategy

| Key Pattern | Type | TTL | Purpose |
|---|---|---|---|
| `session:{userId}` | Hash | 7 days | Active session data |
| `ratelimit:{ip}` | Counter | 1 min | API rate limiting |
| `scan:pending:{scanId}` | String | 5 min | Scan status polling |
| `report:cache:{scanId}` | String (JSON) | 1 hour | Report response cache |
| `scan_limit:{userId}:{date}` | Counter | 24 hours | Daily scan quota |
| `weather:{district}` | String (JSON) | 3 hours | Weather data cache |
| `bull:scan-queue` | BullMQ Queue | — | Async scan processing |

---

## 4. Key Indexes & Queries

```sql
-- Most frequent queries and their indexes

-- Get user scan history (paginated, newest first)
CREATE INDEX idx_scans_user_created ON scans(user_id, created_at DESC);

-- Filter scans by field
CREATE INDEX idx_scans_field ON scans(field_id);

-- Report lookup by shareToken
CREATE UNIQUE INDEX idx_reports_share_token ON reports(share_token);

-- Disease KB lookup by crop
CREATE INDEX idx_disease_kb_crop ON disease_kb(crop_name);
```

---

## 5. Data Retention Policy

| Data Type | Retention Period | Action |
|---|---|---|
| Original scan images | 24 hours (free), 30 days (pro) | Auto-delete from S3 |
| Heatmap images | Same as original | Auto-delete |
| Scan metadata (DB row) | Unlimited if saved by user | Soft delete |
| Reports | Linked to scan lifecycle | Cascade delete |
| Refresh tokens | 30 days | Cron cleanup |
| Notifications | 90 days | Cron cleanup |

---

## 6. Migrations Strategy

- Use Prisma Migrate for all schema changes
- Migration files committed to Git
- Staging DB always migrated before production
- Rollback: shadow DB approach with `prisma migrate diff`

```bash
# Apply migrations
npx prisma migrate deploy

# Generate Prisma client after schema change
npx prisma generate

# Seed disease knowledge base
npx prisma db seed
```
