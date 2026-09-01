# LANDGUARD NER

AI-Powered Real-Time Landslide Risk Monitoring & Early Warning Platform for the North Eastern Region of India.

**Smart India Hackathon 2026** · Problem Statement: **SIH26001** · Domain: **Disaster Management**

---

## Overview

LANDGUARD NER integrates rainfall accumulation, digital elevation terrain models (DEM), historical geological records (GSI/ISRO), IoT soil moisture sensors, and ground field reports to predict and communicate landslide risks in real-time.

```
Meteorological & Terrain Data -> Feature Extraction -> ML Risk Engine -> Dynamic Spatial Heatmap -> Early Warning Dispatcher
```

## Architecture

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, MapLibre GL JS, Recharts, Lucide Icons
- **Backend**: FastAPI, SQLAlchemy (Async), Uvicorn, Pydantic v2, HTTPX
- **Database & Auth**: Supabase PostgreSQL + PostGIS, Supabase Auth (RBAC)
- **Machine Learning**: XGBoost / LightGBM, SHAP Explainability Engine
- **Telemetry**: OpenWeatherMap API, IoT Soil Sensor Simulators, Geo-Tagged Field Reports

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Anubhav2qrz/SIH26001.git
cd SIH26001
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows (or source venv/bin/activate on Unix)
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Features

- **Spatial Risk Heatmap**: Dynamic gradient representation of landslide susceptibility.
- **Explainable AI (XAI)**: SHAP-based feature importance breakdown for every location.
- **Multilingual Early Warning**: Common Alerting Protocol (CAP) warnings in English, Hindi, Khasi, and Assamese.
- **Offline-First Field Reporting**: Geo-tagged ground observations with photo uploads and local queueing.
- **Historical Analysis**: Seasonal distribution and multi-year trend visualizers.
- **Role-Based Access Control**: Configured for SDMA Authorities, District Magistrates, Field Officers, and Citizens.

---

## License

MIT
