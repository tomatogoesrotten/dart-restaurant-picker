## Why

Picking a lunch spot is a daily decision-fatigue tax. DartLunch turns it into a 10-second game:
throw a dart at a 3D board built from a real map of your area and let it choose. This is the
greenfield v1 that brings the whole flow to life.

## What Changes

- Add a 5-phase game flow as a Zustand-backed state machine: pick-area -> materialize -> aim ->
  throw -> result/retry.
- Add a keyless pick-area map (MapLibre GL + OSM raster tiles) with pan/zoom, pre-throw filters
  (open now, cuisine/type, price level), and a "lock bounds" action.
- Add a swappable `RestaurantSource` data layer; the only v1 implementation calls our own proxy.
- Add a stateless Node proxy exposing `GET /api/restaurants` that serves free OpenStreetMap data
  (via the Overpass API) by default and uses Google Places only when `GOOGLE_PLACES_KEY` is set
  server-side. **No key is required by default, and any Google key is never sent to the browser.**
- Add board materialization: snapshot the MapLibre canvas to a texture, build the 3D board, project
  restaurant lat/lng to board (u,v) via Web Mercator, place pins, and show a brief 3rd-person
  low-poly figure holding a dart.
- Add the dart throw: 3rd-person -> first-person camera transition, a cursor-tracking reticle,
  hold-to-charge power, analytic projectile physics, raycast impact against the board, and a
  **tunable hit radius** that decides hit vs miss.
- Add result/retry: a result card (name, cuisine, price, rating, "Open in Google Maps") on a hit,
  a "miss -> throw again" loop, and a "pick new area" reset.
- Add a `ResultStore` shim (no persistence in v1, localStorage-ready) as the history/favorites seam.

## Capabilities

### New Capabilities
- `app-shell`: the 5-phase state machine and transitions between the map view and the 3D view.
- `pick-area`: keyless interactive map, pan/zoom, filter controls, and lock-bounds.
- `restaurant-data`: the `RestaurantSource` interface contract, the proxy-calling implementation,
  filter semantics, error/empty handling, and swappability.
- `places-proxy`: the stateless Node proxy `GET /api/restaurants` contract, OpenStreetMap/Overpass
  as the default data source (Google Places optional when a key is set), server-side key handling,
  error responses, and CORS.
- `board-materialization`: canvas snapshot -> board texture, Web Mercator lat/lng->(u,v) projection,
  pin placement, and the brief 3rd-person figure.
- `dart-throw`: first-person camera transition, aim reticle, charge/power, projectile physics,
  raycast impact, tunable hit radius, and hit vs miss.
- `result-and-retry`: result card contents with "Open in Google Maps", retry on miss, and "pick new
  area".

### Modified Capabilities
<!-- None. Greenfield project; no existing specs. -->

## Impact

- **New frontend:** React + Vite + TypeScript, react-three-fiber + drei, Zustand, MapLibre GL.
- **New proxy:** stateless Node service, one endpoint, optional `GOOGLE_PLACES_KEY` env var
  (OpenStreetMap/Overpass is used when it is unset).
- **External dependency:** OpenStreetMap Overpass API by default (no key, no cost); Google Places API
  optional, reached only from the proxy when a key is set.
- **Deployment:** Zeabur, two services (static frontend + Node proxy). No database.

## Out of Scope (v1)

- User accounts and authentication.
- Persistence / throw history (the `ResultStore` shim stays in-memory; localStorage-ready only).
- Group / multiplayer "throw-off".
- Proxy caching / rate-limiting.
- Minimum-rating filter.
- Rigged-character animation (the avatar is a static low-poly figure).
