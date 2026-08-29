# 🌊 MatsyaSetu (मत्स्यसेतु)
### Smart Multilingual, Low-Bandwidth Fisheries & Ocean Safety Advisory Delivery System

> **Hackathon Prototype** | Designed for Coastal & Rural Fishermen across India

---

## 📌 Problem Statement
Fishermen in coastal and rural areas often lack timely access to fishing-zone advisories (PFZ) and severe weather alerts due to:
1. **Connectivity Dropouts**: Far at sea, high-bandwidth web apps fail completely.
2. **Language & Literacy Barriers**: Advisories issued in English or bureaucratic text fail to reach rural fishermen who rely on spoken regional languages.
3. **Delayed Action on Safety/Catch**: Missing Potential Fishing Zones leads to wasted diesel, while missing ocean weather warnings (high wave, cyclonic swell) endangers lives.

---

## 💡 Solution Overview
**MatsyaSetu** is an offline-first, multilingual, ultra-low bandwidth Progressive Web App (PWA) with:
- 🗣️ **Multilingual Voice Narration (Bhashini AI / Web Speech)**: One-tap audio readouts in **9 coastal Indian languages** (Hindi, Tamil, Telugu, Bengali, Malayalam, Gujarati, Marathi, Odia, English).
- ⚡ **2G Ultra-Low Bandwidth Mode**: High-contrast, sub-5KB plain-text interface readable in blinding sunlight with zero animation lag.
- 📱 **Compressed 2G Feature Phone SMS Simulator**: Compresses INCOIS PFZ coordinates and cyclone alerts into <140 character SMS/USSD payloads.
- 🌊 **Open-Meteo & INCOIS Marine Telemetry**: Live wave height (m), swell period (s), wind speed (knots), sea surface temperature (°C), and automated safety ratings (Safe / Caution / Cyclone Danger).
- 🗺️ **Interactive GIS PFZ & Safety Radar**: Leaflet ocean map with chlorophyll hotspots, danger perimeter circles, and GPS boat tracking.
- 🚨 **One-Tap SOS Emergency Distress Beacon**: Generates offline GPS coordinates, sounds audio siren, and connects to Coast Guard Hotline **1554**.
- 🚢 **Coastal Authority Admin Portal**: Allows fisheries officers to broadcast new advisories, issue cyclone red alerts, and monitor coastal fleets.

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance SPA with instant HMR |
| **Styling** | TailwindCSS v4, Lucide Icons | Responsive Glassmorphic ocean UI & 2G high-contrast mode |
| **Language & TTS** | Bhashini AI + Web Speech Synthesis | Free Indian voice synthesis for 9 languages |
| **Marine Weather** | Open-Meteo Marine API | Free live coastal ocean wave & wind telemetry |
| **GIS & Maps** | Leaflet + OpenStreetMap | Offline-cached interactive ocean radar |
| **Storage & PWA** | Service Worker + LocalStorage | 100% offline functionality at sea |
| **Backend (Optional)** | Supabase / Netlify Functions | Optional cloud sync & Postgres database |

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/fishery-app.git
cd fishery-app
npm install
```

### 2. Run Locally in Dev Mode
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🌐 1-Click Deployment Guide

### Deploying to Netlify (Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of MatsyaSetu Fisheries Advisory App"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fishery-app.git
   git push -u origin main
   ```
2. Go to [Netlify](https://app.netlify.com/) -> **Add new site** -> **Import an existing project** -> Select your GitHub repository.
3. Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy Site**! (Deployment takes < 1 minute).

### Deploying to Vercel
1. Go to [Vercel](https://vercel.com/) -> **New Project** -> Import GitHub Repo.
2. Framework Preset: **Vite**.
3. Click **Deploy**.

---

## 📋 Hackathon Feature Highlights

1. **Dual Role Switcher**:
   - **Fisherman App View**: Audio-first cards, GPS navigation, economic fuel calculator, 2G mode toggle.
   - **Coastal Authority Portal**: Create new advisories, view tracked vessels, send emergency mass SMS broadcasts.
2. **Economic & Fuel Savings Calculator**:
   - Computes estimated diesel savings (~₹2,500 - ₹5,000 / trip) by steering straight to satellite-identified PFZ coordinates.
3. **Emergency SOS System**:
   - Built-in Web Audio API siren generator + Coast Guard toll-free 1554 hotline + exact DMS GPS coordinate broadcast.

---

## 👥 Authors
Built for the Hackathon with ❤️ for Coastal Fishing Communities.
