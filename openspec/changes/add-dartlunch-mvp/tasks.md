## 1. Project scaffolding

- [ ] 1.1 Scaffold the frontend: Vite + React + TypeScript.
- [ ] 1.2 Add dependencies: react-three-fiber, drei, zustand, maplibre-gl.
- [ ] 1.3 Scaffold the Node proxy service (stateless, no DB) in the same repo.
- [ ] 1.4 Configure the Vite dev-proxy to forward `/api` to the local proxy process.
- [ ] 1.5 Add `npm run dev` to run frontend + proxy together for local-first development.

## 2. Places proxy (places-proxy)

- [ ] 2.1 Implement `GET /api/restaurants` accepting bounds + filters (open now, cuisine/type, price).
- [ ] 2.2 Read `GOOGLE_PLACES_KEY` from the server environment; call Google Places server-side.
- [ ] 2.3 Shape the Google response to restaurant JSON (name, lat, lng, cuisine/type, price, rating,
      Google Maps link); never serialize the key.
- [ ] 2.4 Add validation + error responses (4xx for bad bounds, 5xx for upstream failure, JSON body).
- [ ] 2.5 Fail safe when `GOOGLE_PLACES_KEY` is missing (no unauthenticated call, no secret leak).
- [ ] 2.6 Configure CORS to permit the frontend origin.

## 3. Data layer (restaurant-data)

- [ ] 3.1 Define the `RestaurantSource` TypeScript interface (bounds + filters -> shaped restaurants).
- [ ] 3.2 Implement the proxy-calling `RestaurantSource` (calls `GET /api/restaurants`).
- [ ] 3.3 Implement error vs empty handling (empty list on no results, error state on failure).
- [ ] 3.4 Add the `ResultStore` shim (in-memory, localStorage-ready, no persistence in v1).

## 4. App shell + state machine (app-shell)

- [ ] 4.1 Implement the Zustand store with the 5 phases and the defined transition edges.
- [ ] 4.2 Reject undefined transitions; expose current phase as the single source of truth.
- [ ] 4.3 Render the map view in `pick-area` and the 3D view in the other four phases.
- [ ] 4.4 Wire retry (`result/retry` -> `aim`) and reset (`result/retry` -> `pick-area`, clearing state).

## 5. Pick-area map (pick-area)

- [ ] 5.1 Render the MapLibre map with OSM raster tiles (keyless) and OSM attribution.
- [ ] 5.2 Enable pan/zoom.
- [ ] 5.3 Build filter controls: open-now toggle, cuisine/type, price level (no minimum-rating).
- [ ] 5.4 Implement "lock bounds": capture bounds + filters, query `RestaurantSource`, advance to
      `materialize`.

## 6. Board materialization (board-materialization)

- [ ] 6.1 Snapshot the MapLibre canvas to an image (request tiles with CORS so the canvas is readable).
- [ ] 6.2 Build the 3D board and apply the snapshot as its texture.
- [ ] 6.3 Implement Web Mercator lat/lng -> board (u,v) projection matching the snapshot bounds.
- [ ] 6.4 Place one pin per filtered restaurant at its projected position, carrying result-card data.
- [ ] 6.5 Add the brief third-person low-poly figure (un-rigged) holding a dart.

## 7. Dart throw (dart-throw)

- [ ] 7.1 Implement the third-person -> first-person camera transition on entering `aim`.
- [ ] 7.2 Implement the cursor-tracking reticle.
- [ ] 7.3 Implement hold-to-charge power, release to launch (power feeds initial velocity).
- [ ] 7.4 Implement analytic projectile motion + raycast against the board plane (deterministic).
- [ ] 7.5 Add the tunable hit radius as a single named constant; evaluate hit vs miss; advance to
      `result/retry`.

## 8. Result and retry (result-and-retry)

- [ ] 8.1 Build the result card (name, cuisine/type, price, rating, "Open in Google Maps" link) on hit.
- [ ] 8.2 Build the miss state with "throw again" (returns to `aim`, board/pins retained).
- [ ] 8.3 Add "pick new area" (returns to `pick-area`, clears board/pins/throw state).
- [ ] 8.4 Record results through the `ResultStore` shim.

## 9. Calibration + deployment

- [ ] 9.1 Playtest and tune the hit radius (and charge/gravity feel) for challenging-but-fair.
- [ ] 9.2 Verify pin alignment at the board edges against the locked map.
- [ ] 9.3 Configure Zeabur: static frontend service + Node proxy service, `GOOGLE_PLACES_KEY` on the
      proxy only.
- [ ] 9.4 Verify the production build: no Google key anywhere in the browser bundle or network traffic.
