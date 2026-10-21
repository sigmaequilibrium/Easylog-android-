# EasyLogAuto (source rebuilt from APK v1.8.5)

Smart mileage & ATO logbook tracker — GPS drive tracking, car Bluetooth auto-start,
AI trip tagging, route maps and odometer photo scanning.

This project was **recovered from `EasyLogAuto-1.8.5-debug.apk`**. The APK only
contained the compiled web app, so the code here was decompiled from that build
and reorganised into a normal React project. It has been checked against the
original: every screen tested renders the same content and looks pixel-identical.

## Running it

```bash
npm install
npm run dev          # app + API on http://localhost:3000
```

For production: `npm run build && npm start`.

Set `GEMINI_API_KEY` (see `.env.example`) to enable odometer photo scanning and
AI trip tagging. In Google AI Studio this is set for you as a server-side secret.

## Project layout

```
server.js                  Express server: runs the app and the /api endpoints
index.html                 Page shell (fonts, meta tags)
src/main.jsx               Entry point
src/App.jsx                Main app: state, tracking logic, layout
src/components/            Screens and modals (TripList, TripEditor, RouteMapModal,
                           OdometerScanner, BluetoothSetupModal, SettingsModal, ...)
src/services/              Bluetooth, geocoding, notifications, calibration,
                           backups, permissions, odometer AI, trip prediction
src/utils/, src/constants/ Small helpers and localStorage keys
public/                    Icons and PWA manifest
capacitor.config.json      For rebuilding the Android app (webDir: dist)
```

Stack: React 18.3, Vite 6, Tailwind CSS 3.4, Leaflet 1.9.4, lucide-react 0.555.

## What's original and what's rebuilt

- **Front end (`src/`)** — the original app logic, decompiled. Component, file and
  top-level function names were chosen during the rebuild (the build had stripped
  them). Local variable names inside functions are still short (`e`, `t`, `s`…);
  renaming them is a good first job for AI Studio.
- **`server.js`** — new. The APK didn't include the original server, so its four
  endpoints were recreated from what the app sends and expects:
  `/api/analyze-odometer`, `/api/predict-trip-tag`, `/api/geocode`,
  `/api/reverse-geocode`. The odometer prompt is the app's own; the trip-tagging
  prompt was written fresh. If any endpoint fails, the app falls back to its
  built-in rules and public map services, as it did before.
- **Styles** — Tailwind is set up as a real build again (the APK only had the
  compiled CSS), so new Tailwind classes work.
- **Not included** — the Android-only native code (e.g. the `window.AndroidBridge`
  Bluetooth hooks). The web app doesn't need it.

## Bringing it into Google AI Studio

AI Studio's Build mode imports existing projects from GitHub: push this folder to
a GitHub repo, then in Build choose **+ → Import from GitHub**. Once imported,
check that `GEMINI_API_KEY` appears under Secrets.
