# 🎨 UI/UX Design Specification
## Crop Detector — Visual Design System, Component Guide & Interaction Patterns

**Version:** 1.0.0  
**Date:** June 2026

---

## 1. Design Philosophy

Crop Detector is built for **rural Indian farmers** who may have limited smartphone experience. The design must be:

- **Glanceable** — Critical information readable in 2 seconds
- **Trust-building** — Medical-grade clarity without clinical coldness
- **Inclusive** — Works for low literacy; icon + text always paired
- **Performant** — No heavy animations on low-end phones
- **Warm** — Feels like a knowledgeable friend, not a cold app

> Design Tone: **Earthy tech** — think field-fresh greens and soil browns elevated by clean modern type and bold data visualization.

---

## 2. Color System

```css
:root {
  /* ── Primary Palette ─────────────────────────── */
  --color-green-50:   #F0FAF0;
  --color-green-100:  #DCFCE7;
  --color-green-500:  #22C55E;    /* Primary CTA, healthy state */
  --color-green-600:  #16A34A;    /* Hover state */
  --color-green-700:  #15803D;    /* Active state */
  --color-green-900:  #14532D;    /* Text on light bg */

  /* ── Severity Colors ─────────────────────────── */
  --color-healthy:    #22C55E;    /* Green */
  --color-mild:       #FACC15;    /* Yellow */
  --color-moderate:   #F97316;    /* Orange */
  --color-severe:     #EF4444;    /* Red */
  --color-critical:   #991B1B;    /* Deep red */

  /* ── Neutral Palette ─────────────────────────── */
  --color-soil-50:    #FAFAF9;
  --color-soil-100:   #F5F5F4;
  --color-soil-200:   #E7E5E4;
  --color-soil-400:   #A8A29E;
  --color-soil-600:   #57534E;
  --color-soil-800:   #292524;
  --color-soil-900:   #1C1917;

  /* ── Accent ──────────────────────────────────── */
  --color-sky:        #0EA5E9;    /* Weather, water-related info */
  --color-amber:      #F59E0B;    /* Warnings, attention needed */

  /* ── Background / Surface ────────────────────── */
  --bg-app:           #F9FAF7;    /* Slightly warm off-white */
  --bg-card:          #FFFFFF;
  --bg-overlay:       rgba(0, 0, 0, 0.5);

  /* ── Dark Mode ───────────────────────────────── */
  --bg-app-dark:      #0F1A12;
  --bg-card-dark:     #1A2B1E;
  --text-primary-dark:#F0FAF0;
}
```

---

## 3. Typography

```css
/* Google Fonts: Sora (headings) + Noto Sans (body, multilingual) */

@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Noto+Sans:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap');

:root {
  --font-display: 'Sora', sans-serif;           /* All headings */
  --font-body:    'Noto Sans', sans-serif;       /* Body text, UI labels */
  /* Noto Sans Devanagari auto-loaded for Hindi/Marathi */
}

/* Type Scale */
--text-xs:    0.75rem;    /* 12px — captions, labels */
--text-sm:    0.875rem;   /* 14px — secondary text */
--text-base:  1rem;       /* 16px — body */
--text-lg:    1.125rem;   /* 18px — section titles */
--text-xl:    1.25rem;    /* 20px — card titles */
--text-2xl:   1.5rem;     /* 24px — screen titles */
--text-3xl:   1.875rem;   /* 30px — hero text */
--text-4xl:   2.25rem;    /* 36px — display */
```

**Usage Rules:**
- `Sora 700-800` → Disease names, crop names, hero headings
- `Sora 600` → Section headings, card titles
- `Noto Sans 400` → Body text, descriptions, report content
- `Noto Sans 500` → Labels, badge text, nav items

---

## 4. Spacing & Layout

```css
/* 4px base grid */
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;

/* Layout */
--max-width-content:  430px;    /* Mobile-first max width */
--bottom-nav-height:  64px;
--top-header-height:  56px;
--safe-area-bottom:   env(safe-area-inset-bottom);
```

**Grid System:** Single-column layout, full-width cards with 16px horizontal padding.

---

## 5. Component Design Specifications

### 5.1 Scan CTA Button (Home Screen)
```
Shape:      Circle, 120px diameter
Color:      Green-500 fill, white icon
Icon:       Camera + leaf hybrid SVG
Shadow:     0 8px 32px rgba(34, 197, 94, 0.4)
Animation:  Gentle pulse (scale 1.0 → 1.05) on idle
Tap:        Scale down to 0.95, then navigate
Label:      "Scan Crop" below in Sora 600
```

### 5.2 Detection Result Card
```
Healthy:
  Background:   Green-50
  Border:       1.5px solid Green-200
  Icon:         ✓ in Green-500 circle
  Title:        "Healthy Crop" in Sora 700 Green-700

Diseased:
  Background:   White
  Top border:   4px solid [severity color]
  Crop badge:   Small chip top-left (e.g., 🍅 Tomato)
  Disease name: Sora 800, 24px, Soil-900
  Confidence:   "94% confident" — Soil-500, small
  Severity:     Badge (see below)
```

### 5.3 Severity Badge
```
Mild:      Yellow-100 bg, Yellow-700 text, "● Mild"
Moderate:  Orange-100 bg, Orange-700 text, "● Moderate"
Severe:    Red-100 bg, Red-700 text, "● Severe"
Critical:  Red-900 bg, White text, "⚠ Critical"

Border radius: 999px (pill shape)
Padding:       4px 12px
Font:          Noto Sans 600, 13px
```

### 5.4 Treatment Accordion
```
Collapsed state:
  - Icon (leaf for organic / flask for chemical) + Treatment title
  - Chevron icon right
  - Background: Soil-50
  - Border: 1px Soil-200

Expanded state:
  - Numbered steps list
  - Each step: circle number + text
  - Highlight first step in Green-50 (most important)
  - "Buy on Amazon" deep link (future feature, stubbed)
```

### 5.5 Bottom Navigation
```
Height:   64px + safe area
Items:    Home | Scan (center, elevated) | History | Profile
Active:   Green-600 icon + label
Inactive: Soil-400 icon, no label (icon only for inactive)
Scan btn: Floating, elevated 8px, Green-500 circle 52px
Shadow:   0 -1px 12px rgba(0,0,0,0.06)
```

### 5.6 Heatmap Viewer
```
Container:   Full width, 16:9 aspect ratio
Image:       Crop photo with GradCAM overlay
Overlay:     Blue → Yellow → Red gradient heatmap at 65% opacity
Controls:    Toggle heatmap on/off (switch top-right)
Zoom:        Pinch-to-zoom + double-tap to zoom 2x
Legend:      Color scale bar at bottom ("Healthy ← → Affected")
```

### 5.7 Weather Widget (Home)
```
Design:     Horizontal pill card
Left:       Weather icon (sun/rain/cloud)
Center:     Temperature + condition
Right:      Advisory chip (e.g., "🔴 High fungal risk")
Tap:        Expands to full advisory modal
```

---

## 6. Screen Wireframes (Text-Based)

### Home Screen
```
┌─────────────────────────────────┐
│  🌿 CropDetector    [🔔] [👤]   │
├─────────────────────────────────┤
│  Good morning, Ramesh 👋        │
│  Durgapur, West Bengal          │
├─────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐ │
│  │  23   │ │  18   │ │   5   │ │
│  │ Scans │ │Healthy│ │ Found │ │
│  └───────┘ └───────┘ └───────┘ │
├─────────────────────────────────┤
│  ☁️ 31°C  Partly Cloudy         │
│  ⚠️ Rain tomorrow — watch fungal│
├─────────────────────────────────┤
│                                 │
│           ┌───────┐             │
│           │   📷  │  ← pulsing │
│           └───────┘             │
│          Scan Crop               │
│                                 │
├─────────────────────────────────┤
│  Recent Scans                   │
│  ┌──────────────────────────┐   │
│  │ 🍅 Tomato  Early Blight  │   │
│  │ 2 hours ago  ● Moderate  │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ 🥔 Potato  Healthy ✓     │   │
│  │ Yesterday                │   │
│  └──────────────────────────┘   │
├─────────────────────────────────┤
│  🏠 Home  📷 Scan  📋 History  👤│
└─────────────────────────────────┘
```

### Result Screen
```
┌─────────────────────────────────┐
│  ← Back          💾  Share      │
├─────────────────────────────────┤
│  ┌──────────────────────────┐   │
│  │                          │   │
│  │    [Crop Heatmap Image]  │   │
│  │    🔴 Heatmap: ON  ──●   │   │
│  └──────────────────────────┘   │
│                                 │
│  🍅 Tomato                       │
│  Early Blight                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  ● Moderate Severity            │
│  94% confident                  │
│                                 │
│  Early blight is a common       │
│  fungal disease caused by       │
│  Alternaria solani...           │
│                                 │
│  ┌──────────────────────────┐   │
│  │   View Full Report  →    │   │
│  └──────────────────────────┘   │
│                                 │
│  Talk to Expert    PDF Report   │
└─────────────────────────────────┘
```

### Full Report Screen
```
┌─────────────────────────────────┐
│  ← Back              Share  📤  │
│  🍅 Tomato Early Blight         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
├─────────────────────────────────┤
│  OVERVIEW                       │
│  Early blight is caused by...   │
├─────────────────────────────────┤
│  ⚗️ Cause: Fungal               │
│  Alternaria solani              │
├─────────────────────────────────┤
│  ⏱️ If Untreated                │
│  Day 1–3 → Spots spread...      │
│  Day 7–14 → Leaf drop...        │
│  Day 21+ → 60% yield loss       │
├─────────────────────────────────┤
│  🌿 Organic Treatments  ∨       │
│   1. Neem oil spray (2%)        │
│   2. Copper fungicide (organic) │
├─────────────────────────────────┤
│  🧪 Chemical Treatments  ∨      │
│   1. Mancozeb 75% WP (2g/L)    │
│   2. Chlorothalonil 75% WP      │
├─────────────────────────────────┤
│  🛡️ Prevention  ∨              │
├─────────────────────────────────┤
│  ⚠️ For severe infections,     │
│  consult your local KVK officer │
├─────────────────────────────────┤
│  🏠    📷 Scan   📋    👤       │
└─────────────────────────────────┘
```

---

## 7. Animation & Motion Guidelines

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Screen transition | Slide up | 280ms | ease-out |
| Card appear | Fade + translate Y(8px) | 200ms | ease-out |
| Processing scan | Scan line + pulse | Loop | linear |
| Result reveal | Scale from 0.95 + fade | 350ms | spring |
| Accordion open | Height expand | 220ms | ease-in-out |
| Heatmap toggle | Opacity crossfade | 300ms | ease |
| CTA idle pulse | Scale 1→1.04→1 | 2000ms | ease-in-out, loop |

**Rule:** On low-end devices (< 2GB RAM detected via navigator.deviceMemory), disable all non-essential animations.

---

## 8. Accessibility Guidelines

- All interactive elements minimum 44×44px touch target
- Color is never the only indicator — always pair with icon or text
- Severity states use pattern (icon) + color + text label
- All images have meaningful alt text in user's language
- Font size minimum 14px; body text 16px
- Contrast ratio ≥ 4.5:1 for all text (WCAG AA)
- Screen reader: ARIA labels on all icon-only buttons
- Focus rings visible for keyboard navigation (tablet users)

---

## 9. Responsive Breakpoints

Crop Detector is mobile-first. Breakpoints are:

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile (primary) | < 480px | Single column, 16px padding |
| Large mobile | 480–640px | Same, slightly more padding |
| Tablet | 640–1024px | Max-width 430px centered, side padding |
| Desktop | > 1024px | Two-column: sidebar nav + content |

---

## 10. Dark Mode

Dark mode is supported and toggleable in settings (or follows system preference).

Key dark mode token overrides:
```css
@media (prefers-color-scheme: dark) {
  --bg-app:       #0F1A12;
  --bg-card:      #1A2B1E;
  --text-primary: #F0FAF0;
  --text-secondary: #A7C4A8;
  /* Severity colors remain unchanged for clarity */
}
```

---

## 11. Loading States

| State | Component | Design |
|---|---|---|
| Image uploading | Progress bar | Linear green fill bar |
| AI inference | Scan animation | Animated line over crop photo |
| Report loading | Skeleton | Animated grey shimmer blocks |
| History loading | Skeleton list | 3 shimmer rows |
| LLM generating | Typewriter | Text appears word by word |

---

## 12. Iconography

- Icon set: **Lucide React** (consistent, clean, MIT license)
- Custom icons for: crop types (tomato, potato, wheat, rice, etc.) — SVG set
- Minimum icon size: 20×20px
- Icons always accompanied by label text (except bottom nav collapsed state)

---

## 13. Micro-copy Guidelines

| Context | Tone | Example |
|---|---|---|
| Empty state | Encouraging | "Your fields are quiet. Scan a crop to get started!" |
| Error | Calm, actionable | "Something went wrong. Let's try again." |
| Success | Warm, celebratory | "Looking good! Your crop is healthy 🌱" |
| Severe disease | Urgent but not alarming | "This needs attention soon. Here's what to do." |
| Processing | Friendly | "Reading the leaves... almost there!" |
| Disclaimer | Honest, clear | "AI analysis is a guide, not a final diagnosis." |
