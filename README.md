<div align="center">

# 🌐 AegisMed™ Frontend Application
### Enterprise Clinical AI Diagnosis & Remote Care Web Portal

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Lucide](https://img.shields.io/badge/Lucide_Icons-0.344.0-F56565?style=for-the-badge&logo=feather&logoColor=white)](https://lucide.dev/)

<p align="center">
  A state-of-the-art, high-performance medical triage web application engineered in pure React JS (.jsx). Features zero-latency NLP symptom auto-extraction, interactive geospatial healthcare facility mapping, calibrated ML differential diagnosis cards, and printable clinical PDF reports.
</p>

</div>

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [Component Architecture](#-component-architecture)
- [Directory Structure](#-directory-structure)
- [Core UI Modules & Workflows](#-core-ui-modules--workflows)
- [Interactive Geospatial Map Features](#-interactive-geospatial-map-features)
- [Official Printable Clinical PDF Report](#-official-printable-clinical-pdf-report)
- [Design Aesthetics & Theme System](#-design-aesthetics--theme-system)
- [Getting Started & Installation](#-getting-started--installation)

---

## 🌟 Executive Overview

AegisMed Frontend delivers a multi-million-dollar commercial user experience designed for both patients and healthcare providers. It provides:
1. **Smart NLP Input with Typo Tolerance**: Allows patients to describe symptoms in free text (English, Roman Urdu, or Urdu script), extracting age, gender, duration, severity, and symptoms via database fuzzy matching.
2. **131-Symptom Dynamic Clinical Intake Wizard**: A 3-step structured questionnaire with category filters, live search, and safety alert screening.
3. **Calibrated Diagnostic Triage Dashboard**: Displays top 3 differential diagnoses, calibrated match percentages, physician specialty recommendations, and 4-tier urgency ratings.
4. **Printable Official Medical PDF Summary**: A one-click printable report with clinical layout, barcode simulation, physician stamp line, and demographic snapshot.
5. **Real-Time Healthcare Facility Locator Map**: Live GPS radar locator, dynamic search radius circle, turn-by-turn driving directions to Google Maps, and hospital/clinic filter tabs.
6. **Patient Baseline Profile & Dynamic Age-Band Mapping**: Auto-converts exact ages (e.g. `21`) to epidemiological age bands (`20-29`) and saves them to the backend database.

---

## 🏛️ Component Architecture

```
[ App.jsx (Root State & Modals) ]
   ├── [ Navbar.jsx ] (Tab Navigation, System Status, User Profile Trigger, Logout)
   ├── [ EnterpriseMetricsBar.jsx ] (Commercial KPI Ticker: Accuracy, Biomarkers, HIPAA)
   │
   ├── TAB 1: [ IntakeWizard.jsx ]
   │    ├── [ SmartInputMode.jsx ] (Multilingual Free-Text Parser Modal)
   │    ├── Step 1: 131 Symptom Search & Category Chips
   │    ├── Step 2: Duration Slider & Demographic Selectors
   │    └── Step 3: Red-Flag Safety Screening & Confirm
   │
   ├── TAB 2: [ TriageResults.jsx ]
   │    ├── Urgency Level Banner (Emergency, 24h, Soon, Self-Care)
   │    ├── Top 3 Calibrated Differential Diagnosis Cards
   │    ├── Actionable Precautions & Care Measures Checklist
   │    ├── Telehealth Virtual Doctor Bridge Banner
   │    └── [ ClinicalReportModal.jsx ] (Printable Doctor Hand-off PDF)
   │
   ├── TAB 3: [ NearbyCareMap.jsx ]
   │    ├── Leaflet Map Container & TileLayer (Dark Theme CartoDB)
   │    ├── Live GPS Locate Target Button (🎯)
   │    ├── Cyan Radius Perimeter Circle & Dynamic Facility Badge
   │    ├── (You) Blue Pin (👤) + Red Healthcare Facility Markers (🏥/🩺)
   │    └── Route Polyline & Deep-Link Directions to Google Maps
   │
   ├── TAB 4: [ PrivacyCenter.jsx ]
   │    ├── Zero-Knowledge PHI Architecture Details
   │    └── GDPR Article 17 "Erase All Health Data" Action
   │
   ├── MODALS:
   │    ├── [ AuthModal.jsx ] (Login & Registration)
   │    ├── [ ProfileModal.jsx ] (Exact Age & Sex Configuration)
   │    └── [ LogoutConfirmModal.jsx ] (Sign-out Safety Confirmation)
   │
   └── [ Footer ] (ISO-27001, HIPAA & CDSS Architecture Trust Seals)
```

---

## 📁 Directory Structure

```
medical-diagnosis-assistant-frontend/
├── public/                        # Static public assets and favicons
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx          # JWT login & registration modal
│   │   ├── ClinicalReportModal.jsx # Official Printable Clinical Triage Report (PDF generator)
│   │   ├── EnterpriseMetricsBar.jsx # Commercial KPI metrics & trust stats banner
│   │   ├── IntakeWizard.jsx       # 3-step structured clinical intake wizard
│   │   ├── LogoutConfirmModal.jsx # Safety modal to prevent accidental sign-outs
│   │   ├── Navbar.jsx             # Top navigation bar with live API connection indicator
│   │   ├── NearbyCareMap.jsx      # Interactive Leaflet healthcare facility locator map
│   │   ├── PrivacyCenter.jsx      # GDPR / HIPAA data sovereignty & permanent erasure panel
│   │   ├── ProfileModal.jsx       # Patient demographic profile editor (Age & Sex)
│   │   ├── SmartInputMode.jsx     # Multilingual NLP free-text symptom extractor modal
│   │   └── TriageResults.jsx      # Diagnostic results, urgency cards & telehealth bridge
│   ├── services/
│   │   └── api.js                 # Axios/Fetch API client communicating with FastAPI backend
│   ├── App.jsx                    # Core application layout, global state, and modal management
│   ├── index.css                  # Custom CSS styles, glowing glassmorphism & printable styles
│   └── main.jsx                   # React 19 root entrypoint
├── index.html                     # HTML5 root with Google Fonts (Outfit, Inter) & Tailwind CDN
├── package.json                   # Pure React JS scripts and dependencies
├── vite.config.js                 # High-performance Vite 8 bundler configuration
└── README.md                      # Frontend technical documentation
```

---

## 🚀 Core UI Modules & Workflows

---

### 1. Multilingual Smart NLP Input Modal (`SmartInputMode.jsx`)
- **Free-Text Natural Input**: Patients can write in natural conversational language.
- **Multilingual Support**: Supports English, Roman Urdu (`khasi aur bukhar 3 din se`, `kasii ho gayi`), and Urdu script (`میری عمر 35 سال ہے`).
- **Anatomical Anchor Verification**: Guarantees that body-part specific symptoms (e.g. `sir dard`) strictly map to `headache` and never falsely trigger `chest_pain` or `abdominal_pain`.
- **1-Click Auto-Fill**: Automatically pre-fills the Intake Wizard form with parsed Age, Sex, Duration, and Symptoms.

---

### 2. 131-Symptom Clinical Intake Wizard (`IntakeWizard.jsx`)
- **Category Tabs**: All Symptoms, ⚠️ High Severity, 🫁 Chest & Breathing, 🍔 Digestive, 🧠 Head & Nervous, 🌿 Skin & Rashes, 🌡️ Fever & General.
- **Dynamic Quick-Picks**: Instant 1-click toggles for top clinical complaints.
- **Clinical Duration Slider**: Seamlessly sets acute (1-3 days) to chronic (14-30+ days) symptom progression.

---

### 3. Calibrated Diagnostic Dashboard (`TriageResults.jsx`)
- **4-Tier Urgency Classification**:
  - 🚨 **Emergency**: Seek immediate emergency department care / call 911/112.
  - 🟠 **See Doctor Within 24h**: Urgent outpatient clinical evaluation required.
  - 🟡 **See Doctor Soon**: Routine specialist consultation recommended.
  - 🟢 **Self-Care & Home Monitoring**: Mild symptoms manageable with home rest & hydration.
- **Condition Match Percentage**: Displays statistically calibrated confidence scores for the top 3 differential diagnoses.

---

### 4. Official Printable Clinical PDF Report (`ClinicalReportModal.jsx`)
- **Clinical Layout**: Standard medical decision support format.
- **Verification Hash**: Generated SHA-256 digital token verifying document authenticity.
- **Doctor Sign-Off Area**: Pre-formatted physician review and stamp block.
- **Print / Save as PDF**: Uses optimized print stylesheets (`@media print`) to generate clean medical summaries.

---

### 5. Healthcare Facility Locator Map (`NearbyCareMap.jsx`)
- **Live GPS Tracking**: Real-time user coordinate detection.
- **Floating Crosshair (🎯)**: Centers map on user location with smooth animation.
- **Search Radius Circle**: Cyan perimeter circle with dynamic counter badge (`🔵 X facilities within radius`).
- **Turn-by-Turn Driving Directions**: Deep-links to Google Maps for live driving navigation.

---

## 🎨 Design Aesthetics & Theme System

- **Dark Medical Glassmorphism**: Deep slate background (`#020617` / `#0f172a`) with subtle cyan and sky-blue glowing borders.
- **Typography**: Google Fonts **Outfit** for modern headings and **Inter** for clinical data readability.
- **Micro-Animations**: Pulsing radar rings on user location pins, bouncing urgency icons, and smooth tab transitions.

---

## ⚡ Getting Started & Installation

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 1. Navigate to Frontend Directory
```powershell
cd C:\Users\mq202\PycharmProjects\medical-diagnosis-assistant-frontend
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Run Development Server
```powershell
npm run dev
```
Open your browser at **`http://localhost:5173/`**.

### 4. Production Build Verification
```powershell
npm run build
```
Creates a zero-error optimized production bundle in `dist/`.

---

<div align="center">
  <sub>AegisMed™ Frontend • Engineered in Pure React JS • Medical-Grade UX/UI</sub>
</div>
