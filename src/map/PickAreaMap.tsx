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

function whenIdle(map: maplibregl.Map): Promise<void> {
  return new Promise((resolve) => {
    if (map.loaded() && !map.isMoving()) resolve();
    else map.once("idle", () => resolve());
  });
}

/**
 * Capture exactly the viewfinder square: its geographic bounds (via unproject)
 * and a square crop of the map canvas as the board texture. The square framing
 * means bounds and texture share one square frame, so pins line up with the map.
 */
function captureFrame(
  map: maplibregl.Map,
  container: HTMLElement,
  viewfinder: HTMLElement,
): { bounds: Bounds; texture: string } {
  const c = container.getBoundingClientRect();
  const v = viewfinder.getBoundingClientRect();
  const x0 = v.left - c.left;
  const y0 = v.top - c.top;
  const side = v.width;

  const nw = map.unproject([x0, y0]);
  const se = map.unproject([x0 + side, y0 + side]);
  const bounds: Bounds = {
    north: Math.max(nw.lat, se.lat),
    south: Math.min(nw.lat, se.lat),
    east: Math.max(nw.lng, se.lng),
    west: Math.min(nw.lng, se.lng),
  };

  let texture = "";
  try {
    const canvas = map.getCanvas();
    const sx = (x0 / c.width) * canvas.width;
    const sy = (y0 / c.height) * canvas.height;
    const sw = (side / c.width) * canvas.width;
    const sh = (side / c.height) * canvas.height;
    const out = document.createElement("canvas");
    out.width = out.height = 1024;
    const ctx = out.getContext("2d");
    ctx?.drawImage(canvas, sx, sy, sw, sh, 0, 0, 1024, 1024);
    texture = out.toDataURL("image/png");
  } catch (err) {
    console.warn("Board snapshot failed (canvas tainted?); using fallback.", err);
  }
  return { bounds, texture };
}

export default function PickAreaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewfinderRef = useRef<HTMLDivElement>(null);
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
      center: [121.5654, 25.033],
      zoom: 15,
      preserveDrawingBuffer: true, // required for the canvas snapshot
      dragRotate: false, // keep north-up so the square frame is axis-aligned
      attributionControl: { compact: false },
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
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
    const container = containerRef.current;
    const viewfinder = viewfinderRef.current;
    if (!map || !container || !viewfinder || loading) return;
    setLoading(true);
    setError(null);
    try {
      await whenIdle(map);
      const { bounds, texture } = captureFrame(map, container, viewfinder);
      const restaurants = await restaurantSource.fetch(bounds, filters);
      lockBounds({ bounds, filters }, restaurants, texture);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />

      {/* Square viewfinder: everything outside it is dimmed; this becomes the board. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          ref={viewfinderRef}
          style={{
            width: "72vmin",
            height: "72vmin",
            position: "relative",
            border: "2px solid rgba(226,59,59,0.95)",
            borderRadius: 10,
            boxShadow: "0 0 0 100vmax rgba(13,16,20,0.45)",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -30,
              left: 0,
              fontFamily: "ui-monospace, monospace",
              fontSize: 12,
              color: "var(--ink)",
              background: "rgba(13,16,20,0.78)",
              border: "1px solid var(--line)",
              padding: "4px 9px",
              borderRadius: 7,
              whiteSpace: "nowrap",
            }}
          >
            🎯 this square becomes your board
          </span>
        </div>
      </div>

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
            Drag the map to frame your lunch area inside the box, set filters, then
            lock the board.
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
