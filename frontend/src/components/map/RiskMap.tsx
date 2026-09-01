"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  getRisk,
  getExposure,
  getRiskForecast,
  getWeather,
  type Alert,
  type FieldReport,
  type RiskGridCell,
  type RiskDetail,
  type ExposureData,
  type RiskForecast,
  type WeatherData,
} from "@/lib/api";
import LocationDetail from "./LocationDetail";
import { Crosshair, RotateCcw, ZoomIn, ZoomOut, Layers, Eye } from "lucide-react";

interface RiskMapProps {
  riskGrid: RiskGridCell[];
  alerts: Alert[];
  reports: FieldReport[];
  selectedLocation: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
  onRefresh: () => void;
}

type BasemapStyle = "dark" | "satellite" | "topo";

const BASEMAP_TILES: Record<BasemapStyle, { base: string; ref?: string; name: string }> = {
  dark: {
    base: "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ref: "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    name: "Dark Canvas",
  },
  satellite: {
    base: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    name: "Satellite HD",
  },
  topo: {
    base: "https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    name: "Topographic Terrain",
  },
};

export default function RiskMap({
  riskGrid,
  alerts,
  reports,
  selectedLocation,
  onMapClick,
  onRefresh,
}: RiskMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentBasemap, setCurrentBasemap] = useState<BasemapStyle>("dark");
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const [detailData, setDetailData] = useState<{
    risk: RiskDetail;
    exposure: ExposureData;
    forecast: RiskForecast;
    weather: WeatherData;
  } | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: "LANDGUARD Base",
        sources: {
          "esri-base": {
            type: "raster",
            tiles: [BASEMAP_TILES.dark.base],
            tileSize: 256,
            attribution: "ESRI &copy; USGS, NOAA",
          },
          "esri-ref": {
            type: "raster",
            tiles: [BASEMAP_TILES.dark.ref!],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "esri-base-layer",
            type: "raster",
            source: "esri-base",
            minzoom: 0,
            maxzoom: 19,
          },
          {
            id: "esri-ref-layer",
            type: "raster",
            source: "esri-ref",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      },
      center: [91.75, 25.5],
      zoom: 7.2,
      minZoom: 5,
      maxZoom: 16,
      attributionControl: false,
    });

    m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

    m.on("load", () => {
      setMapLoaded(true);
      map.current = m;
    });

    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  const switchBasemap = (styleKey: BasemapStyle) => {
    if (!map.current || !mapLoaded) return;
    const m = map.current;
    setCurrentBasemap(styleKey);
    setShowBasemapMenu(false);

    const sourceConfig = BASEMAP_TILES[styleKey];

    if (m.getSource("esri-base")) {
      if (m.getLayer("esri-base-layer")) m.removeLayer("esri-base-layer");
      if (m.getLayer("esri-ref-layer")) m.removeLayer("esri-ref-layer");
      if (m.getSource("esri-base")) m.removeSource("esri-base");
      if (m.getSource("esri-ref")) m.removeSource("esri-ref");
    }

    m.addSource("esri-base", {
      type: "raster",
      tiles: [sourceConfig.base],
      tileSize: 256,
    });

    const firstRiskLayer = m.getLayer("risk-heatmap") ? "risk-heatmap" : undefined;
    m.addLayer(
      {
        id: "esri-base-layer",
        type: "raster",
        source: "esri-base",
      },
      firstRiskLayer
    );

    if (sourceConfig.ref) {
      m.addSource("esri-ref", {
        type: "raster",
        tiles: [sourceConfig.ref],
        tileSize: 256,
      });
      m.addLayer(
        {
          id: "esri-ref-layer",
          type: "raster",
          source: "esri-ref",
        },
        firstRiskLayer
      );
    }
  };

  useEffect(() => {
    if (!map.current || !mapLoaded || riskGrid.length === 0) return;
    const m = map.current;

    const gridGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: riskGrid.map((cell) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [cell.lng, cell.lat] },
        properties: {
          probability: cell.probability,
          risk_level: cell.risk_level,
        },
      })),
    };

    if (m.getSource("risk-grid")) {
      (m.getSource("risk-grid") as maplibregl.GeoJSONSource).setData(gridGeoJSON);
    } else {
      m.addSource("risk-grid", { type: "geojson", data: gridGeoJSON });

      m.addLayer({
        id: "risk-heatmap",
        type: "heatmap",
        source: "risk-grid",
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "probability"],
            0, 0,
            0.25, 0.2,
            0.5, 0.5,
            0.75, 0.8,
            1, 1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5, 0.6,
            12, 1.2,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0, 0, 0, 0)",
            0.1, "rgba(34, 197, 94, 0.3)",
            0.3, "rgba(245, 158, 11, 0.5)",
            0.5, "rgba(249, 115, 22, 0.6)",
            0.7, "rgba(239, 68, 68, 0.75)",
            1, "rgba(239, 68, 68, 0.95)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5, 15,
            10, 32,
            14, 55,
          ],
          "heatmap-opacity": 0.82,
        },
      });

      m.addLayer({
        id: "risk-circles",
        type: "circle",
        source: "risk-grid",
        minzoom: 8.5,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8.5, 4,
            14, 12,
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "probability"],
            0, "#22c55e",
            0.25, "#22c55e",
            0.5, "#f59e0b",
            0.75, "#f97316",
            1, "#ef4444",
          ],
          "circle-opacity": 0.75,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(255,255,255,0.3)",
        },
      });
    }

    const alertGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: alerts
        .filter((a) => a.latitude && a.longitude)
        .map((a) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [a.longitude!, a.latitude!],
          },
          properties: {
            severity: a.severity,
            district: a.district || "",
            message: a.message_en || "",
            id: a.id,
          },
        })),
    };

    if (m.getSource("alerts")) {
      (m.getSource("alerts") as maplibregl.GeoJSONSource).setData(alertGeoJSON);
    } else {
      m.addSource("alerts", { type: "geojson", data: alertGeoJSON });

      m.addLayer({
        id: "alert-markers",
        type: "circle",
        source: "alerts",
        paint: {
          "circle-radius": 11,
          "circle-color": [
            "match",
            ["get", "severity"],
            "RED", "#ef4444",
            "ORANGE", "#f97316",
            "YELLOW", "#eab308",
            "#22c55e",
          ],
          "circle-opacity": 0.9,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      m.addLayer({
        id: "alert-pulse",
        type: "circle",
        source: "alerts",
        filter: ["==", ["get", "severity"], "RED"],
        paint: {
          "circle-radius": 24,
          "circle-color": "rgba(239, 68, 68, 0.25)",
        },
      });
    }

    const reportGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: reports.map((r) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
        properties: {
          type: r.incident_type,
          severity: r.severity,
          description: r.description || "",
          id: r.id,
        },
      })),
    };

    if (m.getSource("reports")) {
      (m.getSource("reports") as maplibregl.GeoJSONSource).setData(reportGeoJSON);
    } else {
      m.addSource("reports", { type: "geojson", data: reportGeoJSON });

      m.addLayer({
        id: "report-markers",
        type: "circle",
        source: "reports",
        paint: {
          "circle-radius": 8,
          "circle-color": "#8b5cf6",
          "circle-opacity": 0.9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    m.on("click", "risk-circles", (e) => {
      if (e.features?.[0]) {
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
        onMapClick(coords[1], coords[0]);
      }
    });

    m.on("click", "alert-markers", (e) => {
      if (e.features?.[0]) {
        const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
        onMapClick(coords[1], coords[0]);
      }
    });

    for (const layer of ["risk-circles", "alert-markers", "report-markers"]) {
      m.on("mouseenter", layer, () => {
        m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", layer, () => {
        m.getCanvas().style.cursor = "";
      });
    }

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    m.on("mouseenter", "risk-circles", (e) => {
      if (!e.features?.[0]) return;
      const props = e.features[0].properties;
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
      popup
        .setLngLat(coords as [number, number])
        .setHTML(
          `<div class="text-xs font-sans">
            <div class="font-bold mb-1 text-red-400">${props.risk_level} HAZARD</div>
            <div>Probability: ${(props.probability * 100).toFixed(0)}%</div>
          </div>`
        )
        .addTo(m);
    });

    m.on("mouseleave", "risk-circles", () => {
      popup.remove();
    });

    m.on("mouseenter", "alert-markers", (e) => {
      if (!e.features?.[0]) return;
      const props = e.features[0].properties;
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
      popup
        .setLngLat(coords as [number, number])
        .setHTML(
          `<div class="text-xs font-sans">
            <div class="font-bold mb-1 text-orange-400">⚠️ ${props.severity} Alert</div>
            <div>${props.district}</div>
          </div>`
        )
        .addTo(m);
    });

    m.on("mouseleave", "alert-markers", () => {
      popup.remove();
    });

    m.on("click", (e) => {
      const features = m.queryRenderedFeatures(e.point, {
        layers: ["risk-circles", "alert-markers", "report-markers"],
      });
      if (features.length === 0) {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      }
    });
  }, [mapLoaded, riskGrid, alerts, reports, onMapClick]);

  useEffect(() => {
    if (!selectedLocation) return;

    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const [risk, exposure, forecast, weather] = await Promise.all([
          getRisk(selectedLocation.lat, selectedLocation.lng),
          getExposure(selectedLocation.lat, selectedLocation.lng),
          getRiskForecast(selectedLocation.lat, selectedLocation.lng),
          getWeather(selectedLocation.lat, selectedLocation.lng),
        ]);
        setDetailData({ risk, exposure, forecast, weather });
        setShowDetail(true);
      } catch (err) {
        console.error("Failed to fetch location detail:", err);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();

    if (map.current) {
      map.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: Math.max(map.current.getZoom(), 10),
        duration: 1200,
      });
    }
  }, [selectedLocation]);

  const handleRecenter = () => {
    map.current?.flyTo({ center: [91.75, 25.5], zoom: 7.2, duration: 1200 });
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <div className="relative">
          <button
            onClick={() => setShowBasemapMenu(!showBasemapMenu)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              showBasemapMenu
                ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/20"
                : "bg-slate-900/90 backdrop-blur border-slate-700/80 text-slate-300 hover:bg-slate-800"
            }`}
            title="Switch Map Layers"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showBasemapMenu && (
            <div className="absolute top-0 right-11 w-44 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 z-20">
              <span className="text-[10px] text-slate-400 uppercase font-bold px-2 py-1 block">
                Basemap Layer
              </span>
              {(
                [
                  { key: "dark", label: "🌑 Dark Canvas" },
                  { key: "satellite", label: "🛰️ Satellite HD" },
                  { key: "topo", label: "⛰️ Topographic" },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  onClick={() => switchBasemap(item.key)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    currentBasemap === item.key
                      ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span>{item.label}</span>
                  {currentBasemap === item.key && (
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => map.current?.zoomIn()}
          className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/80 flex items-center justify-center hover:bg-slate-800 text-slate-300 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => map.current?.zoomOut()}
          className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/80 flex items-center justify-center hover:bg-slate-800 text-slate-300 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/80 flex items-center justify-center hover:bg-slate-800 text-slate-300 transition-colors"
          title="Center on Meghalaya"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={onRefresh}
          className="w-9 h-9 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/80 flex items-center justify-center hover:bg-slate-800 text-slate-300 transition-colors"
          title="Refresh Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-6 left-4 glass-card-static px-4 py-3 z-10">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-blue-400" /> Landslide Hazard Scale
        </p>
        <div className="flex items-center gap-3.5">
          {[
            { label: "Low (0-25%)", color: "#22c55e" },
            { label: "Moderate (26-50%)", color: "#f59e0b" },
            { label: "High (51-75%)", color: "#f97316" },
            { label: "Critical (76-100%)", color: "#ef4444" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-slate-300 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loadingDetail && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="glass-card-static px-4 py-2 flex items-center gap-2 shadow-2xl border-blue-500/40">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-200 font-medium">Analyzing terrain & exposure...</span>
          </div>
        </div>
      )}

      {showDetail && detailData && (
        <LocationDetail
          data={detailData}
          onClose={() => {
            setShowDetail(false);
            setDetailData(null);
          }}
        />
      )}
    </div>
  );
}
