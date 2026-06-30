## Context

DartLunch is greenfield. The defining constraint is security: a Google Maps JavaScript / Static
Maps key cannot be hidden in a browser bundle, and a leaked key is a billing liability. Everything
below follows from keeping any paid/keyed API out of the browser entirely. Restaurant data comes
from free OpenStreetMap (via the Overpass API) by default, with Google Places used only when a key
is configured server-side.

## Goals / Non-Goals

**Goals:**
- The browser never holds or transmits a Google key. Only our own proxy talks to a restaurant data
  source (OpenStreetMap by default, Google only when a key is set).
- A pick-area map that needs no key (OSM raster tiles via MapLibre).
- A 3D board whose texture is the real map and whose pins line up with the map at the edges.
- Deterministic, production-stable dart physics with no heavyweight engine.
- A data layer that can swap providers later with zero UI changes.
- A hit/miss game tuned by a single calibration knob.

**Non-Goals (v1):**
- Accounts, persistence/history, multiplayer, proxy caching/rate-limiting, minimum-rating filter,
  rigged-character animation. These are deliberate future doors.

## Decisions

### D1 - Keep paid/keyed APIs out of the browser; one thin proxy; OSM data by default
- **Decision:** Keyless OSM map + local canvas snapshot for the board texture. Restaurant search goes
  through a stateless Node proxy that serves free OpenStreetMap data (via the Overpass API) by
  default and calls Google Places only when `GOOGLE_PLACES_KEY` is set server-side, returning shaped
  JSON. Any key is never serialized to the client.
- **Why:** A Maps-JS/Static-Maps key embedded in a browser bundle is publicly readable and a billing
  risk. The proxy keeps any key server-side; defaulting to OSM makes the security posture even
  stronger -- with no key configured at all there is no billing liability and nothing to leak, and
  Google billing (the original blocker) is no longer required to run the app.
- **Alternatives rejected:** (a) Google Maps JS in the browser with a referrer-restricted key --
  rejected; referrer restrictions are bypassable and the key is still public. (b) Google Static Maps
  for the board image -- rejected; still needs a client-visible key. (c) A stateful backend with a
  DB -- rejected as over-built for v1; the proxy is stateless and DB-free.
- **OSM data trade-off:** OpenStreetMap reliably has name, cuisine/type, and location, but price
  level and rating are usually null and the "open now" filter is NOT applied (OSM `opening_hours`
  needs a full parser). Cuisine/type filtering still works. Google stays available as an opt-in
  richer source when a key is set.
- **Overpass reliability:** the proxy sends a descriptive `User-Agent` (Overpass returns 406 without
  one) and fails over across several public Overpass mirrors.

### D2 - Map: MapLibre GL + OSM raster tiles; board texture via canvas snapshot
- **Decision:** Use MapLibre GL with OSM raster tiles for pick-area. On lock, snapshot the MapLibre
  canvas to an image and use it as the board texture. No Static Maps API.
- **Why:** Keyless, and the snapshot is exactly what the user saw, so the texture and the projected
  pins share one coordinate frame.

### D3 - Projection: Web Mercator lat/lng -> board (u,v)
- **Decision:** Project restaurant lat/lng to normalized board (u,v) using Web Mercator, the same
  projection the raster tiles / snapshot use.
- **Why:** Consistency with the snapshot means pins line up with the map, including at the edges.
  Mixing a different projection (e.g., equirectangular) would drift, worst at the edges.

### D4 - Physics: analytic projectile + plane raycast (no physics engine)
- **Decision:** Compute initial velocity from aim direction and charge power, integrate projectile
  motion under gravity analytically, and raycast the dart path against the board plane to find the
  impact point.
- **Why:** Deterministic, debuggable, production-stable, and small. A physics engine (e.g.,
  cannon/rapier) was **considered and rejected for v1** as heavyweight and non-deterministic for a
  single thrown object against a static plane.

### D5 - Landing rule: "miss = retry", single tunable hit radius
- **Decision:** A throw is a hit only if the impact point is within a **tunable hit radius** of a
  restaurant pin (board-space distance); otherwise it is a miss and the user throws again. The hit
  radius is one named constant -- the calibration knob.
- **Why:** Real aim + projectile arc means raw pin hits would be too rare and frustrating. The radius
  makes the game challenging but fair, and being a single knob lets us tune difficulty without
  touching logic. The physical feel (charge curve, gravity, radius) needs tuning a minimal model
  can't predict, so the knob must exist.

### D6 - Filters are pre-throw and decide which pins exist
- **Decision:** Open now, cuisine/type, and price level are applied before materialization; they
  determine the set of pins on the board. No minimum-rating filter in v1.
- **Why:** Filtering after the throw would let the dart hit a pin that gets filtered away. Deciding
  the pin set up front keeps the board honest.

### D7 - Swappable data layer + persistence seam
- **Decision:** The browser depends only on a `RestaurantSource` interface; the v1 implementation
  calls the proxy. A `ResultStore` shim (in-memory, localStorage-ready) holds results.
- **Why:** These are the two future doors (different provider; history/favorites) and isolating them
  now is cheap. Both must be swappable without UI changes.

### D8 - Avatar: static low-poly figure, then first-person
- **Decision:** A simple low-poly, un-rigged figure appears for the brief 3rd-person beat in
  materialize; then the camera moves to first person (hand + dart) for aim/throw.
- **Why:** Sells the "throwing a dart" moment cheaply. Rigging/animation is out of scope for v1.

## Risks / Trade-offs

- **Snapshot/projection drift:** if the snapshot bounds and the Web Mercator projection disagree,
  pins misalign at the edges. Mitigation: derive (u,v) from the exact locked bounds used for the
  snapshot, and visually verify edge pins during calibration.
- **OSM tile usage policy:** public OSM tiles have usage limits / attribution requirements.
  Mitigation: show required attribution; tile host is swappable if limits are hit.
- **Hit radius tuning:** wrong radius is either frustrating or trivial. Mitigation: it is a single
  named constant tuned during playtest (D5).
- **Proxy is the only data touchpoint:** if the proxy is down (or all Overpass mirrors fail),
  restaurant data is unavailable. Acceptable for v1 (no caching by design); surfaced as an error
  state in `restaurant-data`.
- **Canvas snapshot tainting:** cross-origin tiles can taint the canvas and block `toDataURL`.
  Mitigation: request tiles with CORS enabled so the canvas stays readable.
