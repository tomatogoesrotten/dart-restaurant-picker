# Project Context

## Purpose

DartLunch is a web app that decides where you eat lunch by letting you throw a dart at a 3D
dartboard built from a real map of your area. You pan/zoom a map to your lunch radius, lock the
bounds, the map becomes a textured 3D board with restaurant pins at their real positions, and you
aim and throw a dart in first person. Stick a restaurant pin and you get a result card; miss and
you throw again.

## Tech Stack

**Browser (no Google key, ever):**
- React + Vite + TypeScript
- react-three-fiber + drei (3D scene / board / dart)
- Zustand (game + phase state)
- MapLibre GL + OpenStreetMap raster tiles (keyless pick-area map)
- Map board texture comes from snapshotting the MapLibre canvas locally (no Static Maps API)

**Thin proxy (Node, stateless, no database):**
- Single endpoint `GET /api/restaurants` that takes map bounds + filters, calls Google Places
  server-side, and returns shaped restaurant JSON.
- Holds `GOOGLE_PLACES_KEY` server-side only. The key is never serialized to the client.

## Conventions

- **Security-first data flow:** Google is never reachable from the browser. The pick-area map is
  keyless OSM; the board texture is a local canvas snapshot; the only Google-dependent call (Places
  search) is routed through the proxy.
- **Swappable data layer:** the browser talks to a `RestaurantSource` TypeScript interface. The only
  v1 implementation calls our proxy. This interface is the seam for future providers and must be
  replaceable with zero UI changes.
- **Persistence seam:** a `ResultStore` shim with no persistence in v1 (localStorage-ready) is the
  future seam for history/favorites.
- **Projection:** restaurant lat/lng -> board (u,v) via Web Mercator, consistent with the snapshot
  image so pins line up with the map at the edges.
- **Physics:** analytic projectile motion + raycast against the board plane. No physics engine.
  Deterministic.
- **Tunable knobs live as named constants** (notably the dart hit radius), not magic numbers.
- **Phase state machine:** the app is a 5-phase machine (pick-area -> materialize -> aim -> throw ->
  result/retry), Zustand-backed.

## Deployment / Ops

- **Local-first:** `npm run dev`; Vite dev-proxy forwards `/api` to the local proxy process.
- **Deploy:** Zeabur, two services -- static frontend + the Node proxy. `GOOGLE_PLACES_KEY` is set
  on the proxy service only.
- **Production-ready** quality expected. No database in v1.
