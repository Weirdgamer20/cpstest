# Chronos Arena — Ultimate Esports Performance Platform

Welcome to the definitive architectural, operational, and user onboarding guide for **Chronos Arena** (formally known as CPSTEST / Mice Arena). This document details every module, system state, training canvas, and user lifecycle flow engineered into this gaming benchmark workspace.

---

## 🚀 1. The Landing Lifecycle: When a User Visits Chronos Arena

When any user first loads Chronos Arena, the platform performs real-time telemetry checks to deliver a highly optimized responsive user journey:

### A. Core Entry Routing & Auto-Redirect
*   **Desktop Experience**: Users land immediately on the primary dashboard, displaying the fully integrated Click Arena, Duration Selector, Live Stats, and dynamic competitive indices.
*   **Mobile Experience**: On their initial mobile visit, the platform triggers an automatic client redirect to `/mobile-arena`.
    *   Saves `localStorage.mobile_intro_seen = true` to allow continuous return visits without redirect loops.
    *   Displays the high-impact banner: `🎮 Mobile Challenge Mode Activated`.
    *   Deploys custom viewport bindings suited for swift touch taps.

### B. Shared Challenge Onboarding
*   If a visitor lands via a shared challenge URL (`/challenge/{score}/{mode}` or parameterized queries), the system activates **Cooperative Head-to-Head Mode**:
    *   Renders a split screen showing their challenger's registered score.
    *   Deploys a live comparison tracker.
    *   Displays direct real-time indicators showing whether the user is successfully out-clicking their friend's speed record!

---

## ⚡ 2. Primary Benchmarking & Training Canvases

Chronos Arena hosts five dedicated performance benches, engineered for low input latency and instant physical feedback:

1.  **Standard CPS Speed Test**: Choose custom limits (from 1s, 5s, 10s up to 100s or Manual limits) to track continuous clicking thresholds.
2.  **Jitter Clicking Canvas**: Designed for testing rapid high-frequency hand vibration. Uses shaking visual animations to amplify pacing.
3.  **Kohi Minecraft Speed Bench**: Recreates server-authoritative coordinate clicks with custom target guidance rings.
4.  **Neural Reaction Time Test**: Evaluates visual stimulus-to-motor click time delay, complete with sub-millisecond precision.
5.  **Thumb Blitz Rush (Exclusive Mobile Arcade)**:
    *   Random spawn coordinates containing shrinking circular nodes.
    *   Power-ups: **Freeze Time** (slows shrink speeds for 4s), **Double Score** (doubles points for 5s), and **Mega Target**.
    *   Combo multipliers: 3 consecutive hits without misses unlock 2x, 5x, up to high-grade point multi-scalers!

---

## 🏆 3. Client Progression & Anti-Cheat Ecosystem

### A. Level Progression (XP Engine)
*   User actions (completing tests, playing minigames) award custom Experience Points (XP).
*   Levels scaling from **Rec recruit (1)** up to **Chronos Master (50)**.
*   Levels alter profile designs and unlock unique status badges in real-time.

### B. Stateful Achievement Engine
*   A pool of **50+ achievements** covering different skill branches (CPS milestones, reflex delays, typing rates, mobile blitz runs).
*   Provides animated achievement unlocking and persistent badge collections visible inside the profile dashboard.

### C. Rotating Daily Challenges
*   Generates daily rotating targets:
    *   *Reach 8.0+ CPS inside standard Click Arena*.
    *   *Log 3 visual reaction speed tests*.
    *   *Secure 1,000+ points on Thumb Blitz Rush*.
*   Completing challenges awards bonus XP, updating user profile states automatically.

### D. Verified Leaderboards
*   Separate filters for **Daily, Weekly, Monthly, and All-Time** rankings across four performance games.
*   **Anti-Cheat Validation**: Evaluates impossible scores (CPS > 25, Reaction delay < 60ms) and flags suspicious entries to preserve leaderboard integrity.

---

## 📢 4. Esports Monetization (Unobtrusive Ad Placement)
To maintain standard utility monetization without distracting competitive flow:
*   Integrates fixed sidebar-ad placeholders.
*   Features inline display units placed logically in educational reference sections.
*   **Guiding Rule**: Ads never interrupt gameplay or active timers, and popups are completely forbidden.

---

## 🗺️ 5. Global Search Optimization (SEO Library)
A built-in **Reflex Academy** containing highly informative articles (over 500 words each) covering:
*   Muscle positioning for jitter and drag clicking techniques.
*   How professional esports athletes train response times under 150ms.
*   Mechanical debates: Butterfly clicking vs. Jitter clicking.
*   FAQs complete with schema markup elements (Breadcrumb, WebApplication, and FAQ schemas).
