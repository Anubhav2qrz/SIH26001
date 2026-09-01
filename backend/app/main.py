import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import init_db
from app.services.seed import seed_database
from app.routers import risk, weather, reports, alerts, landslides, exposure, dashboard, demo

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[*] Starting LANDGUARD NER...")
    print(f"    Version: {settings.APP_VERSION}")
    await init_db()
    print("    [OK] Database initialized")
    await seed_database()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    print("    [OK] LANDGUARD NER is ready")
    print("    API Docs: http://localhost:8000/docs")

    yield

    print("[!] Shutting down LANDGUARD NER...")


app = FastAPI(
    title="LANDGUARD NER",
    description="AI-Powered Real-Time Landslide Risk Monitoring & Early Warning Platform",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(risk.router)
app.include_router(weather.router)
app.include_router(reports.router)
app.include_router(alerts.router)
app.include_router(landslides.router)
app.include_router(exposure.router)
app.include_router(dashboard.router)
app.include_router(demo.router)


@app.get("/")
async def root():
    return {
        "name": "LANDGUARD NER",
        "version": settings.APP_VERSION,
        "status": "ACTIVE",
        "endpoints": {
            "docs": "/docs",
            "risk": "/api/risk/{lat}/{lng}",
            "forecast": "/api/risk/forecast/{lat}/{lng}",
            "grid": "/api/risk/grid",
            "weather": "/api/weather/{lat}/{lng}",
            "alerts": "/api/alerts",
            "reports": "/api/reports",
            "history": "/api/landslides/history",
            "exposure": "/api/exposure/{lat}/{lng}",
            "dashboard": "/api/dashboard/kpis",
            "analytics": "/api/dashboard/analytics",
            "demo": "/api/demo/steps",
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "LANDGUARD NER"}
