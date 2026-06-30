# 🎯 DartLunch

Pick where to eat lunch by **throwing a dart at a 3D board built from a real map**.
Pan a map to your lunch radius, lock it, and the area becomes a board with a
restaurant pin at every spot. Step into first person, charge your throw, and let
it fly — stick a pin and that's lunch.

## How it works

Five phases: **pick-area → materialize → aim → throw → result/retry**.

- **Keyless in the browser.** The pick-area map is MapLibre + OpenStreetMap
  tiles (no key). The 3D board texture is a snapshot of that map canvas (no
  Static Maps API). The browser never holds a Google key.
- **Free data, no key.** Restaurant data comes from **OpenStreetMap** (Overpass
  API) through a stateless proxy (`/api/restaurants`) — no API key, no cost.
  Optionally set a Google Places key for richer data (ratings/price/open-now);
  when present the proxy uses Google instead, server-side only.
- **Deterministic throw.** Analytic projectile physics + a raycast against the
  board plane; a tunable hit radius decides hit vs miss. No physics engine.

## Run locally

```bash
npm install
npm run dev        # starts the Vite frontend (5173) + the proxy (8787) together
```

Open http://localhost:5173. **It just works — free OpenStreetMap data, no key
needed.**

- **Offline / sample data:** `DARTLUNCH_MOCK=1 npm run dev`
  (PowerShell: `$env:DARTLUNCH_MOCK="1"; npm run dev`).
- **Richer data (optional):** copy `.env.example` → `.env`, set
  `GOOGLE_PLACES_KEY` (enable *Places API (New)* + billing). The proxy then uses
  Google instead of OpenStreetMap, still server-side only.

## Test & build

```bash
npm test           # unit tests: projection, physics, proxy shaping/validation
npm run build      # typecheck + production bundle to dist/
```

## Deploy (Zeabur)

Single service: the proxy serves the built frontend and `/api` from one origin.

- Build command: `npm run build`
- Start command: `npm start`  (serves `dist/` + `/api`; uses `process.env.PORT`)
- Env var: `GOOGLE_PLACES_KEY` (set on the service; never exposed to the browser)

## Project layout

```
src/
  lib/          projection (Web Mercator) + physics (projectile, hit test) — pure, tested
  data/         RestaurantSource interface + proxy-calling impl + result store shim
  state/        Zustand phase machine + transient throw state
  map/          MapLibre pick-area view + filters
  three/        R3F scene: board, pins, figure, dart, thrower, camera rig
  ui/           HUD + result panel
server/         stateless Express proxy (Google Places, key server-side)
openspec/       the spec this was built from (change: add-dartlunch-mvp)
```

The data layer is an interface (`RestaurantSource`) and results go through a
`ResultStore` shim — the seams for a future backend, accounts, or history.
