# 🔄 App Flow Document
## Crop Detector — User Flows, State Machines & Interaction Design

**Version:** 1.0.0  
**Date:** June 2026

---

## 1. Master User Flow

```
╔══════════════════════════════════════════════════════════════════╗
║                      CROP DETECTOR APP FLOW                     ║
╚══════════════════════════════════════════════════════════════════╝

[ONBOARDING FLOW] ──────────────────────────────────────────────
   App Launch
       │
       ├── First Time User?
       │       │
       │       ├── YES → Splash Screen → Language Select
       │       │              → Register / Login → Profile Setup
       │       │              → Permissions (Camera, Notifications)
       │       │              → Quick Tutorial → Home
       │       │
       │       └── NO  → Token Valid? → YES → Home
       │                               NO  → Login Screen

[CORE DETECTION FLOW] ──────────────────────────────────────────
   Home Screen
       │
       ├── Tap "Scan Crop" CTA
       │       │
       │       ├── Camera Mode
       │       │       → Frame crop in viewfinder
       │       │       → Auto-quality hint (blur/light meter)
       │       │       → Capture photo
       │       │
       │       └── Upload Mode
       │               → Gallery picker (JPEG/PNG)
       │               → Preview + confirm
       │
       ↓
   Image Quality Check
       │
       ├── PASS → Upload to API → Show Processing Screen
       │                               │
       │                         AI inference running
       │                         (animated scan overlay)
       │
       └── FAIL → "Retake in better light" prompt
                      → Camera re-opens

   Processing Screen
       │
       ├── ≤ 4 seconds → Result Screen
       │
       └── > 4 seconds → "Still analyzing..." message
                          → Push notification when ready

[RESULT FLOW] ──────────────────────────────────────────────────
   Detection Result Screen
       │
       ├── HEALTHY crop detected
       │       → Green card: "Your crop looks healthy! 🌿"
       │       → General care tips
       │       → "Scan another crop" CTA
       │
       ├── DISEASE detected (confidence ≥ 60%)
       │       → Crop name + Disease name
       │       → Severity badge (Mild / Moderate / Severe)
       │       → Confidence percentage
       │       → Heatmap image (tap to zoom)
       │       → "View Full Report" CTA
       │
       └── LOW CONFIDENCE (< 60%)
               → Top 3 candidates shown
               → "Which crop is this?" selector
               → User confirms → regenerate report

   Full Disease Report Screen
       │
       ├── Overview section
       ├── Cause type + causative agent
       ├── Progression risk timeline
       ├── Symptoms checklist (interactive)
       ├── Organic treatments (accordion)
       ├── Chemical treatments (accordion)
       ├── Preventive measures
       ├── Urgency level banner
       │
       └── Actions:
           ├── Save to History
           ├── Share (WhatsApp / Copy Link / PDF)
           ├── Talk to Expert (Expert Connect)
           └── "Scan Again"

[HISTORY FLOW] ─────────────────────────────────────────────────
   Dashboard / History Screen
       │
       ├── All Scans (default tab)
       │       → Paginated list; newest first
       │       → Crop thumbnail + disease name + date
       │       → Tap → Full Report
       │
       ├── By Field (tab)
       │       → Grouped by named farm field
       │       → Health trend chart per field
       │
       └── Analytics (tab) [Pro only]
               → Pie chart: disease distribution
               → Monthly scan frequency
               → Most common disease in my region

[SETTINGS & PROFILE FLOW] ──────────────────────────────────────
   Profile Screen
       │
       ├── Edit Name / Phone / Location
       ├── Language preference
       ├── Notification preferences
       ├── Manage farm fields
       ├── Subscription (Free → Pro upgrade)
       ├── Data & Privacy (export / delete data)
       └── Logout
```

---

## 2. Scan State Machine

```
                    ┌──────────┐
          upload    │          │
  ───────────────→  │ PENDING  │
                    │          │
                    └────┬─────┘
                         │ job picked up by worker
                         ▼
                    ┌──────────────┐
                    │              │
                    │  PROCESSING  │
                    │              │
                    └────┬─────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
     inference OK            inference error
              ▼                     ▼
        ┌──────────┐          ┌──────────┐
        │          │          │          │
        │ COMPLETED│          │  FAILED  │
        │          │          │          │
        └──────────┘          └──────────┘
```

---

## 3. Screen-by-Screen Interaction Design

### 3.1 Home Screen
```
Elements:
  - Header: User name + Pro badge (if applicable)
  - Hero: Animated "Scan Your Crop" CTA button (large, circular)
  - Quick Stats: Total scans | Healthy | Diseases found
  - Recent scans: Last 3 scan thumbnails
  - Weather widget: Today's advisory for user's district
  - Bottom nav: Home | Scan | History | Profile
```

### 3.2 Camera/Upload Screen
```
Elements:
  - Fullscreen camera feed
  - Crop guide overlay (rounded rectangle)
  - Real-time blur indicator (bottom status bar)
  - Flash toggle (top right)
  - Gallery upload button (bottom left)
  - Capture button (bottom center)
  - Tip text: "Hold camera 15-30cm from the leaf"
```

### 3.3 Processing Screen
```
Elements:
  - Uploaded image (blurred background)
  - Animated scan line moving across image
  - Loading text: "Analyzing your crop..."
  - Sub-text: "AI is examining leaf patterns"
  - Cancel button
  - Est. time: "~3 seconds"
```

### 3.4 Result Screen
```
Elements:
  Healthy:
    - Green gradient card
    - Crop type detected
    - Health score: 98%
    - Care tips (3 bullets)
  
  Diseased:
    - Severity color (Yellow/Orange/Red)
    - Disease name (large)
    - Confidence badge
    - Heatmap image with annotation
    - Quick summary (2 lines)
    - CTA: "View Full Report" (primary)
    - Secondary: "Save" | "Share"
```

### 3.5 Full Report Screen
```
Layout: Scrollable single-column
  - Sticky header: Disease name + severity badge
  - Section 1: Overview (collapsible)
  - Section 2: What caused this? (icon + text)
  - Section 3: What happens if untreated? (timeline UI)
  - Section 4: Organic treatments (numbered, expandable)
  - Section 5: Chemical treatments (numbered, expandable)
  - Section 6: Prevention for next season (checklist)
  - Section 7: Expert disclaimer banner
  - Floating actions: Share | PDF | Expert
```

---

## 4. Notification Flows

| Trigger | Notification | Action |
|---|---|---|
| Scan completed | "Your tomato scan is ready. Disease detected: Early Blight." | Deep link to result |
| Weather alert | "Rain forecast in your area. Fungal disease risk is HIGH this week." | Link to advisory |
| Weekly summary | "You scanned 4 crops this week. 1 disease found." | Link to history |
| Scan streak | "🔥 You've scanned your crops 7 days in a row!" | Share prompt |

---

## 5. Error States & Empty States

| Screen | Empty State | Error State |
|---|---|---|
| History | "No scans yet. Tap the camera button to detect your first crop!" | "Couldn't load history. Pull to refresh." |
| Result | — | "Detection failed. Please retake the photo." |
| Report | — | "Report generation in progress. We'll notify you shortly." |
| Dashboard | "No data yet. Start scanning your crops to see trends!" | "Couldn't load data." |

---

## 6. Offline Flow

```
Device goes offline
        │
        ├── On Scan Attempt
        │       → Show: "You're offline. Using on-device AI (basic detection)"
        │       → Run TFLite model locally
        │       → Show basic result (no heatmap, no LLM report)
        │       → Queue for full analysis when back online
        │
        └── On History Access
                → Show last 5 cached scan results
                → Greyed-out indicator: "Last synced X minutes ago"
```

---

## 7. Upgrade / Paywall Flow

```
Free user hits limit (20 scans/day)
        │
        ├── Soft gate: "You've used your 20 free scans today"
        ├── Show Pro benefits:
        │       ✓ Unlimited scans
        │       ✓ 30-day image history
        │       ✓ Detailed analytics
        │       ✓ Expert connect (2 free calls/month)
        │       ✓ PDF reports
        │       ✓ Weather-aware advisory
        │
        └── Upgrade CTA → Payment flow (Razorpay)
```
