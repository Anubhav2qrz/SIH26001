# LANDGUARD NER — Comprehensive Project Architecture & Technical Walkthrough

> **Smart India Hackathon 2026** · **Problem Statement:** SIH26001 · **Domain:** Disaster Management  
> **Project Title:** LANDGUARD NER — AI-Powered Real-Time Landslide Risk Monitoring & Early Warning Platform  
> **Target Region:** North Eastern Region (NER) of India (*Meghalaya, Assam, Mizoram, Manipur, Nagaland, Arunachal Pradesh, Sikkim, Tripura*)  
> **Live Production URL:** [https://landguard-ner.netlify.app/](https://landguard-ner.netlify.app/)  
> **Repository:** [https://github.com/Anubhav2qrz/SIH26001](https://github.com/Anubhav2qrz/SIH26001)  

---

## 1. Executive Summary & Problem Context

The North Eastern Region (NER) of India represents one of the most landslide-prone mountainous terrains in the world. Characterized by steep topographic gradients, active Himalayan-Burma tectonic boundaries, fragile sedimentary/weathered lithologies, and extreme monsoon precipitation (including world-record rainfall in Cherrapunji and Mawsynram), the region suffers recurring socio-economic devastation. Landslides regularly sever critical lifeline corridors like **NH-6** (connecting Meghalaya to Assam, Mizoram, and Tripura), **NH-40** (Guwahati–Shillong), and **NH-54** (Haflong/Aizawl), isolating entire states and cutting off medical and food supply chains.

Traditional disaster response mechanisms depend on coarse, delayed weather district warnings from meteorological bureaus. These lack hyper-local spatial resolution, do not incorporate geotechnical slope physics, and fail to translate raw data into actionable, localized warnings for ground communities.

**LANDGUARD NER** bridges this gap by unifying:
1. **Multi-temporal precipitation telemetry** (1h, 3h, 6h, 12h, 24h, 3d, 7d).
2. **Digital Elevation Models (DEM)** extracting slope, aspect, curvature, and Topographic Wetness Index (TWI).
3. **8,546 historical Geological Survey of India (GSI) landslide records**.
4. **Capacitive IoT slope moisture telemetry**.
5. **Crowdsourced, offline-capable field incident reporting with Computer Vision**.
6. **Explainable AI (XGBoost + SHAP)** and **Multimodal Generative AI (Google Gemini 1.5 Flash)**.

```
┌────────────────────────┐      ┌─────────────────────────┐      ┌────────────────────────┐
│   TELEMETRY & GIS      │      │     AI RISK ENGINE      │      │     EARLY WARNING      │
│ • OpenWeather API      │ ───► │ • XGBoost Classifier    │ ───► │ • Interactive MapLibre │
│ • IoT Soil Sensors     │      │ • SHAP Explainability   │      │ • Multilingual Alerts  │
│ • SRTM DEM (Slope/TWI) │      │ • Gemini 1.5 Vision     │      │ • Automated SITREP     │
│ • 8.5k GSI Catalog     │      │ • Gemini 1.5 Copilot    │      │ • Offline Field Report │
└────────────────────────┘      └─────────────────────────┘      └────────────────────────┘
```

---

## 2. Complete Technology Stack

| Layer | Technologies Used | Purpose & Key Responsibilities |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (Turbopack, App Router)**, **TypeScript**, **React 19** | Server-side rendering, API route proxying, reactive client dashboard, zero-hydration delay. |
| **Styling & UI Design** | **Tailwind CSS**, **Vanilla CSS**, **Lucide React** | Sleek glassmorphism, night command center aesthetic, micro-animations, accessible contrast tokens. |
| **Spatial Mapping (GIS)** | **MapLibre GL JS**, Web Workers (`maplibre-gl-worker.mjs`), GeoJSON | 60 FPS vector tile rendering, 400 dynamic AI hazard cells, 8,546 GSI points clustering, custom layer controls. |
| **Data Visualization** | **Recharts** | Historical landslide timeline visualizers, rainfall vs. risk correlation curves, seasonal distributions. |
| **Backend API** | **FastAPI (Python 3.10+)**, **Uvicorn**, **Pydantic v2** | Asynchronous REST endpoints, strict schema validation, mathematical feature calculation, OpenAPI docs. |
| **Database & ORM** | **PostgreSQL + PostGIS (Supabase)**, **SQLAlchemy 2.0 (Async)**, **SQLite** | Geospatial distance queries (`ST_DWithin`, `ST_MakePoint`), spatial indexes, persistent state. |
| **Authentication & RBAC** | **Supabase Auth (Google OAuth + Email)**, Row Level Security (RLS) | 4 granular roles: `ADMIN`, `AUTHORITY` (DDMA/SDMA), `FIELD_OFFICER` (SDRF/PWD), and `CITIZEN`. |
| **Machine Learning & AI** | **XGBoost / LightGBM**, **SHAP (XAI)**, **Google Gemini 1.5 Flash API** | Slope stability prediction, localized feature attribution, multimodal defect inspection, disaster copilot. |
| **Hosting & CI/CD** | **Netlify**, `@netlify/plugin-nextjs`, **GitHub Actions** | Automated edge deployments on push to `main` with serverless API functions. |

---

## 3. Machine Learning Architecture & Technical Formulation

The platform deploys a two-tier AI system: a **Geotechnical Predictive Engine (XGBoost + SHAP)** for quantitative spatial hazard modeling, and a **Cognitive Multimodal Engine (Gemini 1.5 Flash)** for qualitative ground image analysis and conversational triage.

```
       ┌───────────────────────────────────────────────────────────┐
       │                 MULTIVARIATE INPUT MATRIX                 │
       │                                                           │
       │  [Static Terrain Features]    [Dynamic Telemetry]         │
       │  • Slope Angle (degrees)      • 1h, 3h, 6h, 24h Rainfall  │
       │  • Topographic Wetness (TWI)  • 3-day Antecedent Rain     │
       │  • Elevation & Aspect         • IoT Soil Moisture (%)     │
       │  • GSI Historical Distance    • Curvature & Lithology     │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
                                     ▼
       ┌───────────────────────────────────────────────────────────┐
       │                XGBOOST CLASSIFIER / REGRESSOR             │
       │           Gradient Boosted Decision Trees (GBDT)          │
       │                 Model Version: v1.0-ner                   │
       └─────────────────────────────┬─────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
      ┌───────────────────────────┐     ┌───────────────────────────┐
      │  FAILURE PROBABILITY (P)  │     │   SHAP EXPLAINABILITY     │
      │  • 0.00 – 0.25: LOW       │     │   • Antecedent Rain: +40% │
      │  • 0.26 – 0.50: MODERATE  │     │   • Slope Steepness: +24% │
      │  • 0.51 – 0.75: HIGH      │     │   • Soil Saturation: +22% │
      │  • 0.76 – 1.00: CRITICAL  │     │   • GSI Proximity:   +14% │
      └───────────────────────────┘     └───────────────────────────┘
```

### 3.1. Mathematical Formulation of Landslide Susceptibility
At any geographic point $(lat, lng)$, slope stability is determined by the balance between resisting shear strength ($\tau_f$) and driving shear stress ($\tau_d$) along potential failure planes (infinite slope model):

$$FS = \frac{\tau_f}{\tau_d} = \frac{c' + (\gamma z - u_w) \cos^2 \beta \tan \phi'}{\gamma z \sin \beta \cos \beta}$$

Where:
* $c'$ = Effective cohesion of weathered residual soil.
* $\phi'$ = Effective internal friction angle.
* $\beta$ = Slope gradient angle (derived from DEM).
* $\gamma$ = Unit weight of soil.
* $z$ = Soil mantle depth.
* $u_w$ = Pore-water pressure, heavily governed by short-term rainfall accumulation ($R_{24h}$) and in-situ moisture saturation ($S_m$).

When pore-water pressure increases, the effective normal stress $(\sigma' = \sigma - u_w)$ drops towards zero, causing abrupt shear failure.

### 3.2. Machine Learning Feature Pipeline
The ML model substitutes closed-form analytical equations with a trained **XGBoost (Extreme Gradient Boosting)** model over the following feature vector:

$$\mathbf{x} = \big[ R_{1h}, R_{3h}, R_{6h}, R_{24h}, R_{3d}, R_{7d}, S_m, \beta, TWI, K_c, D_{GSI}, L_{type} \big]$$

1. **Precipitation Indices:**
   * $R_{1h}, R_{3h}, R_{6h}, R_{24h}$: Short-term rainfall intensity triggering shallow translational landslides and debris flows.
   * $R_{3d}, R_{7d}$: Long-term antecedent moisture accumulating in bedrock joints triggering deep-seated rotational slides.
2. **Topographic Parameters (SRTM DEM):**
   * $\beta$ (Slope Angle): Slopes steeper than $30^\circ$ exhibit exponentially higher gravitational shear stress.
   * **Topographic Wetness Index (TWI):**
     $$TWI = \ln\left(\frac{\alpha}{\tan \beta}\right)$$
     (where $\alpha$ is the upslope contributing drainage area). High TWI areas indicate natural groundwater convergence zones.
   * **Profile & Planform Curvature ($K_c$):** Identifies concave slope hollows that funnel runoff.
3. **IoT Capacitive Moisture Saturation ($S_m$):** Real-time telemetry from `NER-SENSOR-XXX` sensor nodes measuring volumetric water content (VWC %).
4. **Historical Geological Priors ($D_{GSI}$):** Spatial distance and density relative to 8,546 verified GSI historical landslide scars.

### 3.3. Hazard Classification & Triage Scoring
The model outputs a continuous failure probability $P \in [0, 1]$:
* **0.00 – 0.25 (LOW - Green):** Stable slope, routine monitoring.
* **0.26 – 0.50 (MODERATE - Yellow):** Elevated soil moisture; yellow advisory to PWD road maintenance.
* **0.51 – 0.75 (HIGH - Orange):** Active pore-pressure surge; orange alert, restrict heavy freight on NH-6.
* **0.76 – 1.00 (CRITICAL - Red):** Imminent slope failure; red warning, civil defense evacuation and SDRF deployment.

**Response Prioritisation Score (0–100):**
$$\text{Priority Score} = \left( P \times 50 \right) + \left( \min\left(\frac{\text{Pop Exposed}}{10,000}, 1.0\right) \times 30 \right) + \left( W_{\text{corridor}} \times 20 \right)$$
*(where $W_{\text{corridor}} = 1.0$ for National Highways like NH-6, $0.7$ for State Highways, and $0.4$ for rural roads).*

### 3.4. Explainable AI (XAI) with SHAP
To ensure transparency for District Magistrates and disaster responders, the model generates SHapley Additive exPlanations (SHAP) for every grid point:
$$\phi_i = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f(S \cup \{i\}) - f(S) \right]$$
* **24h Antecedent Rain:** Contributes $+0.40$ to the risk score during heavy storms.
* **Slope Steepness (DEM):** Contributes $+0.22$ based on physical incline.
* **Soil Saturation Index:** Contributes $+0.30$ during sensor-verified saturation.
* **Historical Landslide Frequency:** Contributes $+0.12$ based on regional susceptibility.

---

## 4. Google Gemini 1.5 Flash Integrations

LANDGUARD NER embeds three multimodal and generative AI capabilities powered by Google Gemini:

### A. Geotechnical Computer Vision Inspection
Field officers and citizens can upload photos of road cuts, slopes, or tension cracks via the dashboard:
* **Endpoint:** [`frontend/src/lib/gemini.ts`](file:///g:/SIH26001/frontend/src/lib/gemini.ts) (`analyzeGroundPhotoWithGemini`)
* **Prompt Engineering:** Specialized geotechnical prompt instructing Gemini 1.5 Flash to detect failure modes (*tension cracks, translational slides, rockfall scarps, mud movement, clogged drainage channels*).
* **Structured Output:**
  ```json
  {
    "incident_type": "CRACK",
    "severity": "HIGH",
    "hazard_score": 82,
    "geotechnical_summary": "Tension fracture detected along cut-slope shoulder with visible soil displacement and water seepage, indicating progressive slope instability.",
    "recommended_actions": [
      "Erect warning perimeter along road corridor",
      "Deploy SDRF technical inspection unit",
      "Divert heavy vehicular traffic from slope edge"
    ]
  }
  ```

### B. Automated NDMA Situation Report (SITREP)
Disaster commanders can generate formal executive briefings with a single click:
* **Function:** `generateSitrepWithGemini`
* Generates a fully formatted, executive situation report adhering to National Disaster Management Authority (NDMA) standards, detailing:
  1. Executive Summary & Threat Level
  2. Meteorological & Geotechnical Trigger Analysis
  3. Infrastructure & Settlement Exposure (NH-6 corridor, affected villages)
  4. Mandated Civil Defense & SDRF Action Protocols

### C. Conversational Disaster Copilot
* **Component:** [`DisasterCopilot.tsx`](file:///g:/SIH26001/frontend/src/components/copilot/DisasterCopilot.tsx)
* Context-aware interactive assistant that reads the current active district, rainfall values, and alerts to provide instant operational guidance on evacuation routes, road safety, and shelter status.

---

## 5. Repository File Structure

```
g:\SIH26001
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entry point, CORS, routers
│   │   ├── config.py                   # Environment settings & API keys
│   │   ├── database.py                 # Async SQLAlchemy engine & session factory
│   │   ├── models/models.py            # ORM tables: RiskPrediction, LandslideEvent, Alert, Road, Village
│   │   ├── schemas/                    # Pydantic v2 validation contracts
│   │   ├── routers/
│   │   │   ├── risk.py                 # Risk calculation, 400-point spatial grid, SHAP explanations
│   │   │   ├── alerts.py               # Multilingual CAP alerts (EN, HI, Local)
│   │   │   ├── demo.py                 # 8-step SIH Hackathon simulation controller
│   │   │   ├── reports.py              # Crowdsourced field incident reporting
│   │   │   ├── exposure.py             # Village & highway exposure metrics
│   │   │   ├── weather.py              # OpenWeatherMap ingestion & telemetry
│   │   │   └── landslides.py           # Historical GSI inventory queries
│   │   ├── services/
│   │   │   ├── seed.py                 # Seeds GSI events, roads, villages, and sensor nodes
│   │   │   └── supabase_service.py     # PostGIS & Supabase integration
│   │   └── data/
│   │       └── gsi_ner_landslides.json # 8,546 authentic GSI landslide records
│   ├── requirements.txt                # Python dependencies (FastAPI, SQLAlchemy, etc.)
│   └── supabase_schema.sql             # Production PostgreSQL schema with PostGIS & RLS
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Main single-page command dashboard
│   │   │   ├── layout.tsx              # Root HTML wrapper with fonts and metadata
│   │   │   └── api/                    # Next.js App Router API proxy routes
│   │   │       ├── risk/grid/route.ts  # Serves 400-cell spatial grid
│   │   │       ├── demo/route.ts       # Manages 8-step live demo state
│   │   │       ├── alerts/route.ts     # Serves active emergency notifications
│   │   │       └── reports/route.ts    # Field report submission & retrieval
│   │   ├── components/
│   │   │   ├── map/RiskMap.tsx         # MapLibre GL engine, 4 basemaps, layer switcher, GSI dots
│   │   │   ├── auth/
│   │   │   │   ├── AuthModal.tsx       # Supabase Google OAuth & login modal
│   │   │   │   └── RegionOnboardingModal.tsx # District selection modal on first login
│   │   │   ├── copilot/DisasterCopilot.tsx # Interactive Gemini 1.5 chat drawer
│   │   │   ├── sitrep/SitrepModal.tsx  # 1-click executive NDMA SITREP generator
│   │   │   ├── demo/DemoScenarioController.tsx # 8-step interactive hackathon timeline
│   │   │   ├── reports/ReportModal.tsx # Geo-tagged field report & photo analysis
│   │   │   └── analytics/HistoricalAnalyticsModal.tsx # Recharts landslide trends & charts
│   │   ├── data/
│   │   │   ├── nerRegions.ts           # Geo-boundaries & corridors for all 8 NER states
│   │   │   └── gsi_curated_events.json # Bundled historical records for instant client loading
│   │   └── lib/
│   │       ├── gemini.ts               # Google Gemini 1.5 SDK wrapper (Vision + Copilot + SITREP)
│   │       ├── serverStore.ts          # In-memory resilient state store for zero-delay demo
│   │       └── supabase.ts             # Supabase JS client with automatic fallback
│   ├── public/
│   │   ├── maplibre-gl-worker.mjs      # Self-hosted CSP-compliant MapLibre web worker
│   │   └── maplibre-gl-shared.mjs      # Shared worker dependencies
│   └── package.json
│
├── docs/                               # High-resolution workflow diagrams and assets
├── netlify.toml                        # Production build configuration & environment
└── README.md                           # Quickstart guide
```

---

## 6. Detailed Feature Walkthrough

### 6.1. Interactive Spatial MapLibre Engine
* **400 AI Risk Cells:** 20×20 dynamic grid across the Shillong Plateau and high-risk corridors.
* **8,546 GSI Landslide Dots:** Interactive point cluster visualization of historical ground failures with dates, triggers, and fatalities.
* **4 Watermark-Free Basemaps:**
  1. 🌑 **Cyber Dark Mode** (*Default — command center aesthetic*).
  2. 🛰️ **Satellite Hybrid HD** (*Photorealistic mountain terrain with clear highway labels*).
  3. ⛰️ **Topographic Relief** (*Contour hillshading for elevation analysis*).
  4. 🗺️ **OpenStreetMap** (*Free standard road and street view*).
* **1-Click Basemap Toggle:** Located at the top-right to instantly alternate between Satellite and Dark Canvas.

### 6.2. State & District Onboarding
* On user login, [`RegionOnboardingModal.tsx`](file:///g:/SIH26001/frontend/src/components/auth/RegionOnboardingModal.tsx) prompts users to select their state and district across all 8 NER states (*e.g., Meghalaya → East Khasi Hills*).
* Persists the selection to Supabase `user_metadata` and automatically pans/zooms the map camera to their specific jurisdiction.

### 6.3. Multilingual Early Warning & CAP Dispatch
* Implements the **Common Alerting Protocol (CAP)** standard used by NDMA and IMD.
* Emergency broadcasts are delivered simultaneously in **English**, **Hindi**, and local regional dialects (**Khasi** and **Assamese**) to ensure immediate civilian evacuation comprehension.

### 6.4. Field Ground Reporting with Computer Vision
* Ground observers, SDRF personnel, or citizens can click **"+ Report Incident"** or use the **"Pin Incident"** map crosshair.
* Uploading an image triggers the **Gemini 1.5 Flash Vision Engine** to classify crack types and recommend immediate civil defense actions.
* Supports offline caching with local queuing for low-connectivity valleys.

### 6.5. 8-Step Interactive SIH Demo Controller
Designed specifically for live jury evaluation via [`DemoScenarioController.tsx`](file:///g:/SIH26001/frontend/src/components/demo/DemoScenarioController.tsx):
* **Step 1 (Normal Conditions):** Blue baseline, 24% probability.
* **Step 2 (Rainfall Spike):** 85mm downpour, risk climbs to 51% (Yellow).
* **Step 3 (Soil Moisture Surge):** Capacitive sensors hit 83% saturation, risk jumps to 76% (Orange).
* **Step 4 (AI Critical Warning):** Model detects convergence of shear stressors, raising an 89% Critical Red warning.
* **Step 5 (Exposure Analysis):** Identifies 3 villages, NH-6 corridor, and 5,200 vulnerable civilians.
* **Step 6 (Response Prioritisation):** Automated triage rank 1 assigned to East Khasi Hills.
* **Step 7 (Field Report Received):** Field officer flags a tension crack on NH-6 km 42.
* **Step 8 (Multilingual Broadcast):** Red alert dispatched in English, Hindi, and Khasi.

---

## 7. Setup & Execution Instructions

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/Anubhav2qrz/SIH26001.git
cd SIH26001
```

#### 2. Backend (FastAPI + Python)
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # On Windows (or source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
python -m app.services.seed    # Seeds GSI events, roads, and villages into SQLite
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API documentation will be accessible at: `http://127.0.0.1:8000/docs`.*

#### 3. Frontend (Next.js + TypeScript)
```bash
cd ../frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your web browser.*

---

## 8. Summary of Competitive Differentiators (SIH Evaluation)

1. **Authentic Historical Ground Truth:** Seeded with **8,546 actual Geological Survey of India (GSI)** landslide incidents across the NER rather than synthetic placeholders.
2. **Transparent Explainable AI (XAI):** Uses SHAP values to explain *why* an alert was triggered, giving emergency authorities actionable confidence.
3. **Multimodal Edge Intelligence:** Integrates Gemini 1.5 Flash to automatically interpret field ground photos and generate NDMA SITREPs.
4. **Resilient Offline Architecture:** Offline-first incident reporting queue that syncs automatically when network reconnects.
5. **Zero-Lag Vector Cartography:** 60 FPS client rendering with custom bundled MapLibre workers and 4 watermark-free basemaps.
