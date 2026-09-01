import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy import select

from app.database import engine, async_session, Base
from app.models.models import (
    LandslideEvent, Location, Village, Road, SoilSensor,
    WeatherData, RiskPrediction, User, Alert, FieldReport,
    RiskLevel, AlertSeverity, RoadStatus, UserRole,
    IncidentType, SyncStatus
)

NER_LANDSLIDE_EVENTS = [
    {"lat": 25.27, "lng": 91.72, "district": "East Khasi Hills", "state": "Meghalaya", "date": "2023-06-15", "severity": "HIGH", "rainfall": 245, "road": "NH-6", "settlement": "Sohra", "fatalities": 2},
    {"lat": 25.30, "lng": 91.68, "district": "East Khasi Hills", "state": "Meghalaya", "date": "2022-07-20", "severity": "CRITICAL", "rainfall": 310, "road": "NH-6", "settlement": "Mawsynram", "fatalities": 5},
    {"lat": 25.22, "lng": 91.75, "district": "East Khasi Hills", "state": "Meghalaya", "date": "2021-08-12", "severity": "MODERATE", "rainfall": 180, "road": None, "settlement": "Laitlyngkot", "fatalities": 0},
    {"lat": 25.35, "lng": 91.88, "district": "East Khasi Hills", "state": "Meghalaya", "date": "2023-09-05", "severity": "HIGH", "rainfall": 198, "road": "SH-5", "settlement": "Shillong", "fatalities": 1},
    {"lat": 25.28, "lng": 91.70, "district": "East Khasi Hills", "state": "Meghalaya", "date": "2020-07-03", "severity": "CRITICAL", "rainfall": 352, "road": "NH-6", "settlement": "Sohra", "fatalities": 8},
    {"lat": 25.24, "lng": 91.65, "district": "East Khasi Hills", "state": "Meghalaya", "date": "2022-06-28", "severity": "HIGH", "rainfall": 220, "road": None, "settlement": "Mawphlang", "fatalities": 0},
    {"lat": 25.31, "lng": 91.80, "district": "East Khasi Hills", "state": "Meghalaya", "date": "2019-08-15", "severity": "MODERATE", "rainfall": 165, "road": "SH-5", "settlement": None, "fatalities": 0},
    {"lat": 25.45, "lng": 91.30, "district": "West Khasi Hills", "state": "Meghalaya", "date": "2023-07-10", "severity": "HIGH", "rainfall": 195, "road": "NH-106", "settlement": "Nongstoin", "fatalities": 3},
    {"lat": 25.50, "lng": 91.25, "district": "West Khasi Hills", "state": "Meghalaya", "date": "2021-06-22", "severity": "MODERATE", "rainfall": 142, "road": None, "settlement": None, "fatalities": 0},
    {"lat": 25.60, "lng": 91.90, "district": "Ri-Bhoi", "state": "Meghalaya", "date": "2022-08-14", "severity": "MODERATE", "rainfall": 130, "road": "NH-40", "settlement": "Nongpoh", "fatalities": 0},
    {"lat": 25.35, "lng": 92.20, "district": "West Jaintia Hills", "state": "Meghalaya", "date": "2023-07-25", "severity": "HIGH", "rainfall": 210, "road": "NH-44", "settlement": "Jowai", "fatalities": 2},
    {"lat": 25.68, "lng": 93.05, "district": "Dima Hasao", "state": "Assam", "date": "2022-05-14", "severity": "CRITICAL", "rainfall": 275, "road": "NH-54", "settlement": "Haflong", "fatalities": 29},
    {"lat": 25.72, "lng": 93.10, "district": "Dima Hasao", "state": "Assam", "date": "2022-05-15", "severity": "CRITICAL", "rainfall": 290, "road": "Rail Line", "settlement": None, "fatalities": 0},
    {"lat": 26.15, "lng": 93.50, "district": "Karbi Anglong", "state": "Assam", "date": "2023-06-18", "severity": "HIGH", "rainfall": 180, "road": "NH-36", "settlement": "Diphu", "fatalities": 1},
    {"lat": 26.20, "lng": 92.80, "district": "Kamrup Metropolitan", "state": "Assam", "date": "2022-06-15", "severity": "MODERATE", "rainfall": 155, "road": "NH-37", "settlement": "Guwahati", "fatalities": 0},
    {"lat": 26.10, "lng": 91.75, "district": "Kamrup", "state": "Assam", "date": "2021-07-12", "severity": "MODERATE", "rainfall": 140, "road": None, "settlement": None, "fatalities": 0},
    {"lat": 23.73, "lng": 92.72, "district": "Aizawl", "state": "Mizoram", "date": "2023-06-12", "severity": "CRITICAL", "rainfall": 268, "road": "NH-54", "settlement": "Aizawl", "fatalities": 11},
    {"lat": 23.70, "lng": 92.68, "district": "Aizawl", "state": "Mizoram", "date": "2022-07-08", "severity": "HIGH", "rainfall": 195, "road": None, "settlement": "Durtlang", "fatalities": 2},
    {"lat": 23.16, "lng": 92.94, "district": "Lunglei", "state": "Mizoram", "date": "2023-08-20", "severity": "HIGH", "rainfall": 210, "road": "NH-54A", "settlement": "Lunglei", "fatalities": 4},
    {"lat": 24.82, "lng": 93.95, "district": "Imphal West", "state": "Manipur", "date": "2022-06-30", "severity": "HIGH", "rainfall": 188, "road": "NH-2", "settlement": "Imphal", "fatalities": 3},
    {"lat": 25.10, "lng": 94.20, "district": "Senapati", "state": "Manipur", "date": "2023-07-15", "severity": "CRITICAL", "rainfall": 245, "road": "NH-2", "settlement": "Mao", "fatalities": 6},
    {"lat": 25.28, "lng": 94.12, "district": "Tamenglong", "state": "Manipur", "date": "2022-08-05", "severity": "HIGH", "rainfall": 205, "road": None, "settlement": "Tamenglong", "fatalities": 2},
    {"lat": 25.67, "lng": 94.12, "district": "Kohima", "state": "Nagaland", "date": "2023-07-22", "severity": "HIGH", "rainfall": 178, "road": "NH-29", "settlement": "Kohima", "fatalities": 1},
    {"lat": 26.35, "lng": 94.58, "district": "Mokokchung", "state": "Nagaland", "date": "2022-06-10", "severity": "MODERATE", "rainfall": 135, "road": None, "settlement": "Mokokchung", "fatalities": 0},
    {"lat": 23.84, "lng": 91.28, "district": "West Tripura", "state": "Tripura", "date": "2023-08-08", "severity": "MODERATE", "rainfall": 165, "road": "NH-44", "settlement": "Agartala", "fatalities": 1},
    {"lat": 27.10, "lng": 93.62, "district": "Papum Pare", "state": "Arunachal Pradesh", "date": "2023-06-25", "severity": "HIGH", "rainfall": 225, "road": "NH-415", "settlement": "Itanagar", "fatalities": 3},
    {"lat": 28.07, "lng": 94.22, "district": "Upper Siang", "state": "Arunachal Pradesh", "date": "2022-07-18", "severity": "CRITICAL", "rainfall": 280, "road": None, "settlement": "Yingkiong", "fatalities": 7},
    {"lat": 27.33, "lng": 92.40, "district": "West Kameng", "state": "Arunachal Pradesh", "date": "2021-08-30", "severity": "HIGH", "rainfall": 198, "road": "NH-13", "settlement": "Bomdila", "fatalities": 2},
    {"lat": 27.33, "lng": 88.62, "district": "East Sikkim", "state": "Sikkim", "date": "2023-10-04", "severity": "CRITICAL", "rainfall": 265, "road": "NH-10", "settlement": "Gangtok", "fatalities": 42},
    {"lat": 27.15, "lng": 88.50, "district": "South Sikkim", "state": "Sikkim", "date": "2022-06-14", "severity": "HIGH", "rainfall": 190, "road": None, "settlement": "Namchi", "fatalities": 3},
]

NER_VILLAGES = [
    {"name": "Sohra (Cherrapunji)", "lat": 25.27, "lng": 91.72, "district": "East Khasi Hills", "state": "Meghalaya", "pop": 11000, "hospital": True, "school": True},
    {"name": "Mawsynram", "lat": 25.30, "lng": 91.58, "district": "East Khasi Hills", "state": "Meghalaya", "pop": 7500, "hospital": False, "school": True},
    {"name": "Laitlyngkot", "lat": 25.23, "lng": 91.74, "district": "East Khasi Hills", "state": "Meghalaya", "pop": 3200, "hospital": False, "school": True},
    {"name": "Mawphlang", "lat": 25.45, "lng": 91.75, "district": "East Khasi Hills", "state": "Meghalaya", "pop": 4800, "hospital": False, "school": True},
    {"name": "Pynursla", "lat": 25.25, "lng": 91.90, "district": "East Khasi Hills", "state": "Meghalaya", "pop": 5500, "hospital": True, "school": True},
    {"name": "Shillong", "lat": 25.57, "lng": 91.88, "district": "East Khasi Hills", "state": "Meghalaya", "pop": 145000, "hospital": True, "school": True},
    {"name": "Mawkyrwat", "lat": 25.35, "lng": 91.42, "district": "West Khasi Hills", "state": "Meghalaya", "pop": 3800, "hospital": False, "school": True},
    {"name": "Nongstoin", "lat": 25.52, "lng": 91.27, "district": "West Khasi Hills", "state": "Meghalaya", "pop": 8200, "hospital": True, "school": True},
    {"name": "Jowai", "lat": 25.45, "lng": 92.20, "district": "West Jaintia Hills", "state": "Meghalaya", "pop": 34000, "hospital": True, "school": True},
    {"name": "Nongpoh", "lat": 25.90, "lng": 91.88, "district": "Ri-Bhoi", "state": "Meghalaya", "pop": 12000, "hospital": True, "school": True},
    {"name": "Tura", "lat": 25.51, "lng": 90.22, "district": "West Garo Hills", "state": "Meghalaya", "pop": 75000, "hospital": True, "school": True},
    {"name": "Haflong", "lat": 25.17, "lng": 93.02, "district": "Dima Hasao", "state": "Assam", "pop": 36000, "hospital": True, "school": True},
    {"name": "Diphu", "lat": 25.84, "lng": 93.43, "district": "Karbi Anglong", "state": "Assam", "pop": 22000, "hospital": True, "school": True},
    {"name": "Guwahati", "lat": 26.14, "lng": 91.74, "district": "Kamrup Metropolitan", "state": "Assam", "pop": 1100000, "hospital": True, "school": True},
    {"name": "Aizawl", "lat": 23.73, "lng": 92.72, "district": "Aizawl", "state": "Mizoram", "pop": 293000, "hospital": True, "school": True},
    {"name": "Lunglei", "lat": 22.88, "lng": 92.74, "district": "Lunglei", "state": "Mizoram", "pop": 57000, "hospital": True, "school": True},
    {"name": "Imphal", "lat": 24.82, "lng": 93.95, "district": "Imphal West", "state": "Manipur", "pop": 264000, "hospital": True, "school": True},
    {"name": "Mao", "lat": 25.53, "lng": 94.09, "district": "Senapati", "state": "Manipur", "pop": 8000, "hospital": False, "school": True},
    {"name": "Kohima", "lat": 25.67, "lng": 94.12, "district": "Kohima", "state": "Nagaland", "pop": 100000, "hospital": True, "school": True},
    {"name": "Itanagar", "lat": 27.10, "lng": 93.62, "district": "Papum Pare", "state": "Arunachal Pradesh", "pop": 60000, "hospital": True, "school": True},
    {"name": "Bomdila", "lat": 27.26, "lng": 92.42, "district": "West Kameng", "state": "Arunachal Pradesh", "pop": 7000, "hospital": True, "school": True},
    {"name": "Gangtok", "lat": 27.33, "lng": 88.62, "district": "East Sikkim", "state": "Sikkim", "pop": 100000, "hospital": True, "school": True},
    {"name": "Namchi", "lat": 27.17, "lng": 88.36, "district": "South Sikkim", "state": "Sikkim", "pop": 15000, "hospital": True, "school": True},
]

NER_ROADS = [
    {"name": "NH-6 (Shillong-Sohra)", "type": "NH", "start_lat": 25.57, "start_lng": 91.88, "end_lat": 25.27, "end_lng": 91.72, "district": "East Khasi Hills", "state": "Meghalaya", "villages": 6},
    {"name": "NH-40 (Guwahati-Shillong)", "type": "NH", "start_lat": 26.14, "start_lng": 91.74, "end_lat": 25.57, "end_lng": 91.88, "district": "Ri-Bhoi", "state": "Meghalaya", "villages": 8},
    {"name": "SH-5 (Shillong-Jowai)", "type": "SH", "start_lat": 25.57, "start_lng": 91.88, "end_lat": 25.45, "end_lng": 92.20, "district": "East Khasi Hills", "state": "Meghalaya", "villages": 5},
    {"name": "NH-106 (Shillong-Nongstoin)", "type": "NH", "start_lat": 25.57, "start_lng": 91.88, "end_lat": 25.52, "end_lng": 91.27, "district": "West Khasi Hills", "state": "Meghalaya", "villages": 7},
    {"name": "NH-54 (Silchar-Aizawl)", "type": "NH", "start_lat": 24.83, "start_lng": 92.80, "end_lat": 23.73, "end_lng": 92.72, "district": "Aizawl", "state": "Mizoram", "villages": 12},
    {"name": "NH-54 (Haflong Corridor)", "type": "NH", "start_lat": 25.17, "start_lng": 93.02, "end_lat": 25.68, "end_lng": 93.05, "district": "Dima Hasao", "state": "Assam", "villages": 9},
    {"name": "NH-2 (Imphal-Mao)", "type": "NH", "start_lat": 24.82, "start_lng": 93.95, "end_lat": 25.53, "end_lng": 94.09, "district": "Senapati", "state": "Manipur", "villages": 15},
    {"name": "NH-29 (Dimapur-Kohima)", "type": "NH", "start_lat": 25.90, "start_lng": 93.73, "end_lat": 25.67, "end_lng": 94.12, "district": "Kohima", "state": "Nagaland", "villages": 10},
    {"name": "NH-10 (Siliguri-Gangtok)", "type": "NH", "start_lat": 26.71, "start_lng": 88.43, "end_lat": 27.33, "end_lng": 88.62, "district": "East Sikkim", "state": "Sikkim", "villages": 8},
    {"name": "NH-415 (Itanagar Road)", "type": "NH", "start_lat": 26.87, "start_lng": 93.72, "end_lat": 27.10, "end_lng": 93.62, "district": "Papum Pare", "state": "Arunachal Pradesh", "villages": 6},
    {"name": "NH-13 (Tezpur-Bomdila)", "type": "NH", "start_lat": 26.63, "start_lng": 92.80, "end_lat": 27.26, "end_lng": 92.42, "district": "West Kameng", "state": "Arunachal Pradesh", "villages": 11},
    {"name": "NH-44 (Agartala-Shillong)", "type": "NH", "start_lat": 23.84, "start_lng": 91.28, "end_lat": 25.57, "end_lng": 91.88, "district": "West Tripura", "state": "Tripura", "villages": 14},
    {"name": "NH-36 (Nagaon-Diphu)", "type": "NH", "start_lat": 26.35, "start_lng": 92.69, "end_lat": 25.84, "end_lng": 93.43, "district": "Karbi Anglong", "state": "Assam", "villages": 7},
    {"name": "NH-37 (Guwahati-Jorhat)", "type": "NH", "start_lat": 26.14, "start_lng": 91.74, "end_lat": 26.75, "end_lng": 94.22, "district": "Kamrup", "state": "Assam", "villages": 18},
]


async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        result = await db.execute(select(LandslideEvent).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        print("[*] Seeding database...")

        for event_data in NER_LANDSLIDE_EVENTS:
            event = LandslideEvent(
                latitude=event_data["lat"],
                longitude=event_data["lng"],
                event_date=datetime.strptime(event_data["date"], "%Y-%m-%d"),
                district=event_data["district"],
                state=event_data["state"],
                severity=event_data["severity"],
                rainfall_mm=event_data["rainfall"],
                affected_road=event_data.get("road"),
                affected_settlement=event_data.get("settlement"),
                fatalities=event_data.get("fatalities", 0),
                source="GSI/ISRO Landslide Inventory",
            )
            db.add(event)

        states = ["Meghalaya", "Assam", "Mizoram", "Manipur", "Nagaland", "Tripura", "Arunachal Pradesh", "Sikkim"]
        districts_by_state = {
            "Meghalaya": [("East Khasi Hills", 25.3, 91.7), ("West Khasi Hills", 25.5, 91.3), ("Ri-Bhoi", 25.9, 91.9)],
            "Assam": [("Dima Hasao", 25.5, 93.0), ("Karbi Anglong", 26.0, 93.4), ("Kamrup", 26.2, 91.8)],
            "Mizoram": [("Aizawl", 23.7, 92.7), ("Lunglei", 22.9, 92.7)],
            "Manipur": [("Imphal West", 24.8, 93.9), ("Senapati", 25.3, 94.1)],
            "Nagaland": [("Kohima", 25.7, 94.1)],
            "Tripura": [("West Tripura", 23.8, 91.3)],
            "Arunachal Pradesh": [("Papum Pare", 27.1, 93.6), ("West Kameng", 27.3, 92.4)],
            "Sikkim": [("East Sikkim", 27.3, 88.6)],
        }

        for year in range(2015, 2024):
            for month in range(5, 10):
                num_events = random.randint(1, 4) if month in [6, 7, 8] else random.randint(0, 2)
                for _ in range(num_events):
                    state = random.choice(states)
                    dist_info = random.choice(districts_by_state[state])
                    day = random.randint(1, 28)
                    event = LandslideEvent(
                        latitude=dist_info[1] + random.uniform(-0.15, 0.15),
                        longitude=dist_info[2] + random.uniform(-0.15, 0.15),
                        event_date=datetime(year, month, day),
                        district=dist_info[0],
                        state=state,
                        severity=random.choice(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
                        rainfall_mm=random.uniform(80, 350),
                        fatalities=random.choice([0, 0, 0, 0, 1, 2, 3]),
                        source="Synthetic (based on GSI patterns)",
                    )
                    db.add(event)

        grid_points = []
        for lat_idx in range(20):
            for lng_idx in range(20):
                lat = 25.10 + lat_idx * 0.025
                lng = 91.50 + lng_idx * 0.025
                base_elevation = 800 + random.uniform(0, 1200)
                slope = random.uniform(5, 55)
                location = Location(
                    latitude=round(lat, 4),
                    longitude=round(lng, 4),
                    district="East Khasi Hills" if lat < 25.5 else "Ri-Bhoi",
                    state="Meghalaya",
                    elevation=round(base_elevation, 1),
                    slope=round(slope, 1),
                    aspect=round(random.uniform(0, 360), 1),
                    curvature=round(random.uniform(-2, 2), 2),
                    twi=round(random.uniform(2, 12), 2),
                    terrain_ruggedness=round(random.uniform(10, 300), 1),
                    soil_type=random.choice(["Laterite", "Alluvial", "Red Soil", "Forest Soil"]),
                    land_cover=random.choice(["Dense Forest", "Open Forest", "Agriculture", "Settlement", "Bare Soil"]),
                )
                db.add(location)
                grid_points.append((round(lat, 4), round(lng, 4), slope, base_elevation))

        for v in NER_VILLAGES:
            village = Village(
                name=v["name"],
                latitude=v["lat"],
                longitude=v["lng"],
                district=v["district"],
                state=v["state"],
                population=v["pop"],
                risk_level=RiskLevel.LOW,
                has_hospital=v["hospital"],
                has_school=v["school"],
            )
            db.add(village)

        for r in NER_ROADS:
            road = Road(
                road_name=r["name"],
                road_type=r["type"],
                start_lat=r["start_lat"],
                start_lng=r["start_lng"],
                end_lat=r["end_lat"],
                end_lng=r["end_lng"],
                district=r["district"],
                state=r["state"],
                status=RoadStatus.OPEN,
                risk_level=RiskLevel.LOW,
                nearby_villages=r["villages"],
                exposure_km=round(random.uniform(5, 45), 1),
            )
            db.add(road)

        sensor_locations = [
            (25.27, 91.72, "East Khasi Hills"),
            (25.30, 91.68, "East Khasi Hills"),
            (25.35, 91.75, "East Khasi Hills"),
            (25.57, 91.88, "East Khasi Hills"),
            (25.45, 91.30, "West Khasi Hills"),
            (25.45, 92.20, "West Jaintia Hills"),
            (25.68, 93.05, "Dima Hasao"),
            (23.73, 92.72, "Aizawl"),
            (24.82, 93.95, "Imphal West"),
            (27.33, 88.62, "East Sikkim"),
            (27.10, 93.62, "Papum Pare"),
            (25.67, 94.12, "Kohima"),
        ]
        for i, (slat, slng, sdist) in enumerate(sensor_locations):
            sensor = SoilSensor(
                sensor_id=f"NER-SENSOR-{i+1:03d}",
                latitude=slat,
                longitude=slng,
                timestamp=datetime.utcnow(),
                soil_moisture=round(random.uniform(30, 70), 1),
                battery_level=round(random.uniform(60, 100), 0),
                status="ONLINE" if random.random() > 0.15 else "OFFLINE",
            )
            db.add(sensor)

        weather_points = [
            (25.27, 91.72), (25.57, 91.88), (25.45, 92.20),
            (25.68, 93.05), (23.73, 92.72), (24.82, 93.95),
            (27.33, 88.62), (27.10, 93.62), (25.67, 94.12),
        ]
        for wlat, wlng in weather_points:
            weather = WeatherData(
                latitude=wlat, longitude=wlng,
                timestamp=datetime.utcnow(),
                rainfall_mm=round(random.uniform(0, 25), 1),
                rainfall_1h=round(random.uniform(0, 10), 1),
                rainfall_3h=round(random.uniform(0, 20), 1),
                rainfall_6h=round(random.uniform(5, 40), 1),
                rainfall_12h=round(random.uniform(10, 60), 1),
                rainfall_24h=round(random.uniform(15, 80), 1),
                rainfall_3d=round(random.uniform(30, 150), 1),
                rainfall_7d=round(random.uniform(60, 300), 1),
                temperature=round(random.uniform(18, 28), 1),
                humidity=round(random.uniform(65, 95), 1),
                wind_speed=round(random.uniform(5, 25), 1),
                forecast_rainfall_24h=round(random.uniform(10, 50), 1),
            )
            db.add(weather)

        for lat, lng, slope, elevation in grid_points:
            slope_factor = min(slope / 60.0, 1.0) * 0.3
            elevation_factor = min(elevation / 2000.0, 1.0) * 0.1
            random_factor = random.uniform(-0.1, 0.15)
            prob = max(0.05, min(0.95, slope_factor + elevation_factor + random_factor + 0.1))

            risk = (RiskLevel.LOW if prob <= 0.25
                    else RiskLevel.MODERATE if prob <= 0.50
                    else RiskLevel.HIGH if prob <= 0.75
                    else RiskLevel.CRITICAL)

            pred = RiskPrediction(
                location_id=1,
                latitude=lat,
                longitude=lng,
                timestamp=datetime.utcnow(),
                probability=round(prob, 3),
                risk_level=risk,
                confidence=round(random.uniform(0.6, 0.95), 2),
                model_version="v1.0",
            )
            db.add(pred)

        alert_data = [
            {"lat": 25.30, "lng": 91.68, "dist": "East Khasi Hills", "sev": AlertSeverity.ORANGE, "risk": RiskLevel.HIGH,
             "msg_en": "Elevated landslide risk near Mawsynram due to heavy rainfall. Monitor conditions closely.",
             "msg_hi": "भारी बारिश के कारण मॉसिनराम के पास भूस्खलन का खतरा बढ़ा। स्थिति पर करीबी नजर रखें।",
             "villages": 4, "roads": 2, "pop": 12000},
            {"lat": 25.68, "lng": 93.05, "dist": "Dima Hasao", "sev": AlertSeverity.YELLOW, "risk": RiskLevel.MODERATE,
             "msg_en": "Moderate risk in Haflong corridor. Railway and NH-54 may be affected if rainfall continues.",
             "msg_hi": "हाफलोंग गलियारे में मध्यम खतरा। बारिश जारी रहने पर रेलवे और NH-54 प्रभावित हो सकते हैं।",
             "villages": 6, "roads": 2, "pop": 18000},
            {"lat": 23.73, "lng": 92.72, "dist": "Aizawl", "sev": AlertSeverity.YELLOW, "risk": RiskLevel.MODERATE,
             "msg_en": "Moderate risk in Aizawl slopes. Citizens advised to avoid steep road sections.",
             "msg_hi": "आइजोल ढलानों में मध्यम खतरा। नागरिकों को खड़ी सड़क वर्गों से बचने की सलाह।",
             "villages": 3, "roads": 1, "pop": 45000},
        ]
        for a in alert_data:
            alert = Alert(
                latitude=a["lat"], longitude=a["lng"],
                district=a["dist"],
                severity=a["sev"],
                risk_level=a["risk"],
                message_en=a["msg_en"],
                message_hi=a["msg_hi"],
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 12)),
                status="ACTIVE",
                affected_villages=a["villages"],
                affected_roads=a["roads"],
                population_exposed=a["pop"],
            )
            db.add(alert)

        users = [
            User(name="SDMA Admin", email="admin@landguard.ner", role=UserRole.ADMIN, language="en"),
            User(name="DC East Khasi Hills", email="dc.ekh@nic.in", role=UserRole.AUTHORITY, language="en"),
            User(name="Field Officer Sohra", email="fo.sohra@sdma.gov.in", role=UserRole.FIELD_OFFICER, language="en", latitude=25.27, longitude=91.72),
        ]
        for u in users:
            db.add(u)

        reports = [
            FieldReport(user_id=3, latitude=25.28, longitude=91.71, incident_type=IncidentType.CRACK,
                       description="Small cracks observed on slope near NH-6 km 42.", severity=RiskLevel.MODERATE,
                       sync_status=SyncStatus.SYNCED, district="East Khasi Hills",
                       timestamp=datetime.utcnow() - timedelta(days=2)),
            FieldReport(user_id=3, latitude=25.31, longitude=91.69, incident_type=IncidentType.ROCKFALL,
                       description="Minor rockfall on road shoulder. Debris cleared.", severity=RiskLevel.LOW,
                       sync_status=SyncStatus.SYNCED, district="East Khasi Hills",
                       timestamp=datetime.utcnow() - timedelta(days=5)),
            FieldReport(user_id=3, latitude=25.25, longitude=91.73, incident_type=IncidentType.SLOPE_MOVEMENT,
                       description="Visible soil creep on hillside near Laitlyngkot. Monitoring recommended.", severity=RiskLevel.HIGH,
                       sync_status=SyncStatus.SYNCED, district="East Khasi Hills",
                       timestamp=datetime.utcnow() - timedelta(hours=8)),
        ]
        for r in reports:
            db.add(r)

        await db.commit()
        print("[OK] Database seeded successfully!")
        print(f"     {len(NER_LANDSLIDE_EVENTS) + 80}+ landslide events")
        print(f"     {len(NER_VILLAGES)} villages")
        print(f"     {len(NER_ROADS)} roads")
        print(f"     {len(sensor_locations)} soil sensors")
        print(f"     {len(grid_points)} risk grid points")


if __name__ == "__main__":
    asyncio.run(seed_database())
