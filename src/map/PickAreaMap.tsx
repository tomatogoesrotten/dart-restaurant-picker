import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Bounds, Filters } from "../types";
import { DEFAULT_FILTERS } from "../types";
import { restaurantSource } from "../data/proxySource";
import { useGame } from "../state/store";
import { FiltersPanel } from "./Filters";

// Keyless OSM raster style. crossOrigin on tiles keeps the canvas readable so
// we can snapshot it as the board texture (no Static Maps API, no Google key).
const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

/** Capture the current map frame as a PNG data URL; "" if the canvas is tainted. */
function snapshot(map: maplibregl.Map): string {
  try {
    return map.getCanvas().toDataURL("image/png");
  } catch (err) {
    console.warn("Map snapshot failed (canvas tainted?); using fallback.", err);
    return "";
  }
}

function whenIdle(map: maplibregl.Map): Promise<void> {
  return new Promise((resolve) => {
    if (map.loaded() && !map.isMoving()) resolve();
    else map.once("idle", () => resolve());
  });
}

export default function PickAreaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const lockBounds = useGame((s) => s.lockBounds);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [121.5654, 25.033], // sensible default; user pans / geolocates
      zoom: 15,
      preserveDrawingBuffer: true, // required for canvas snapshot
      attributionControl: { compact: false },
    });
    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "bottom-right",
    );
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  async function handleLock() {
    const map = mapRef.current;
    if (!map || loading) return;
    setLoading(true);
    setError(null);
    try {
      await whenIdle(map);
      const b = map.getBounds();
      const bounds: Bounds = {
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      };
      const texture = snapshot(map);
      const restaurants = await restaurantSource.fetch(bounds, filters);
      // Empty is valid (board with no pins); the materialize/aim flow handles it.
      lockBounds({ bounds, filters }, restaurants, texture);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          width: 280,
          maxWidth: "calc(100vw - 32px)",
          background: "rgba(13,16,20,0.92)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 18,
          backdropFilter: "blur(6px)",
          display: "grid",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "var(--red)",
                boxShadow: "0 0 10px var(--red)",
              }}
            />
            DartLunch
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--ink-dim)" }}>
            Frame your lunch radius, set filters, then lock the board.
          </p>
        </div>

        <FiltersPanel value={filters} onChange={setFilters} disabled={loading} />

        <button
          onClick={handleLock}
          disabled={loading}
          style={{
            background: loading ? "var(--line)" : "var(--red)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 14px",
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}
        >
          {loading ? "Finding restaurants…" : "Lock area & throw"}
        </button>

        {error && (
          <p
            role="alert"
            style={{
              margin: 0,
              fontSize: 13,
              color: "#ffb4b4",
              borderLeft: "2px solid var(--red)",
              paddingLeft: 10,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
