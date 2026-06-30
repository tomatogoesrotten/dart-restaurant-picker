// DartLunch proxy: stateless Express server that holds the Google Places key
// server-side and exposes a single GET /api/restaurants endpoint.
import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import {
  validateBounds,
  applyFilters,
  fetchRestaurants,
} from "./places.js";
import { MOCK_RESTAURANTS } from "./mock.js";

const PORT = process.env.PORT || 8787;
const ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

export const app = express();
app.use(cors({ origin: ORIGIN }));

app.get("/api/restaurants", async (req, res) => {
  const check = validateBounds(req.query);
  if (!check.ok) {
    res.status(400).json({ error: check.error });
    return;
  }
  const { bounds } = check;
  const filters = {
    openNow: req.query.openNow === "true",
    cuisine: req.query.cuisine || null,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : null,
  };

  const mockMode = process.env.DARTLUNCH_MOCK === "1";
  const key = process.env.GOOGLE_PLACES_KEY;

  if (mockMode) {
    const inBounds = MOCK_RESTAURANTS.filter(
      (r) =>
        r.lat <= bounds.north &&
        r.lat >= bounds.south &&
        r.lng <= bounds.east &&
        r.lng >= bounds.west,
    );
    res.status(200).json({ restaurants: applyFilters(inBounds, filters) });
    return;
  }

  if (!key) {
    res.status(500).json({ error: "Restaurant service is not configured." });
    return;
  }

  try {
    const shaped = await fetchRestaurants(bounds, filters, key);
    res.status(200).json({ restaurants: applyFilters(shaped, filters) });
  } catch {
    // ponytail: never forward the upstream error (could echo the key).
    res.status(502).json({ error: "Upstream restaurant lookup failed." });
  }
});

// Production single-service deploy: the proxy also serves the built SPA, so the
// frontend and /api share one origin (no prod CORS, key stays server-side).
// In dev this is dormant — Vite serves the frontend and only proxies /api here.
const distDir = path.resolve(process.cwd(), "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => res.sendFile(path.join(distDir, "index.html")));
}

// Start listening only when run directly (not when imported for tests).
// pathToFileURL makes this work on Windows (file:///C:/...) too.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  app.listen(PORT, () => {
    console.log(`DartLunch proxy listening on http://localhost:${PORT}`);
  });
}
