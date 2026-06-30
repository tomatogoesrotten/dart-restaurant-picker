## ADDED Requirements

### Requirement: Stateless restaurants endpoint
The proxy SHALL expose a single endpoint `GET /api/restaurants` that accepts map bounds and the
filters (open now, cuisine/type, price level) as request parameters, resolves restaurants
server-side from its configured data source, and returns shaped restaurant JSON. The proxy SHALL be
stateless and SHALL NOT use a database.

#### Scenario: Request returns shaped JSON
- **WHEN** a client sends `GET /api/restaurants` with valid bounds and filters
- **THEN** the proxy resolves restaurants server-side from its configured data source
- **AND** responds with a JSON array of restaurants, each including name, latitude, longitude,
  cuisine/type, price level, rating, and a Google Maps link

#### Scenario: No persistence between requests
- **WHEN** two identical requests are made
- **THEN** each is served independently with no stored state and no database read or write

### Requirement: Data source resolution order
The proxy SHALL resolve restaurants from a data source chosen in a fixed order: mock data when mock
mode is enabled, otherwise Google Places when `GOOGLE_PLACES_KEY` is configured, otherwise free
OpenStreetMap data via the Overpass API. OpenStreetMap SHALL be the default source and SHALL require
no key and incur no cost. OpenStreetMap reliably provides name, cuisine/type, and location; price
level and rating are usually null and the "open now" filter is NOT applied for OpenStreetMap (its
opening-hours data needs a full parser). Cuisine/type filtering SHALL still apply.

#### Scenario: Default source is OpenStreetMap when no Google key
- **WHEN** mock mode is off and `GOOGLE_PLACES_KEY` is not configured
- **THEN** the proxy resolves restaurants from OpenStreetMap via the Overpass API
- **AND** returns shaped restaurants carrying name, cuisine/type, and location
- **AND** price level and rating may be null and the open-now filter is not applied

#### Scenario: Google is used only when a key is configured
- **WHEN** mock mode is off and `GOOGLE_PLACES_KEY` is configured
- **THEN** the proxy resolves restaurants from Google Places server-side

### Requirement: Server-side key handling
The proxy SHALL read `GOOGLE_PLACES_KEY` from its server environment and, when set, use it only in
server-side calls to Google. The key is OPTIONAL; when it is absent the proxy uses OpenStreetMap
instead. The key SHALL NEVER appear in any response body, header, or error returned to the client.

#### Scenario: Key is never serialized to the client
- **WHEN** any response (success or error) is returned from `GET /api/restaurants`
- **THEN** the response contains no Google key in its body, headers, or error detail

#### Scenario: No key serves OpenStreetMap as a normal success
- **WHEN** `GOOGLE_PLACES_KEY` is not configured on the proxy
- **THEN** the proxy serves free OpenStreetMap data via the Overpass API and returns a normal success
  response
- **AND** it does NOT error and does NOT attempt an unauthenticated Google call

### Requirement: Error responses
The proxy SHALL return appropriate HTTP error statuses for invalid requests and upstream failures,
with a JSON error body that the client can parse, and SHALL NOT crash the process on a bad request.

#### Scenario: Invalid or missing bounds
- **WHEN** a request omits required bounds or sends malformed bounds
- **THEN** the proxy responds with a 4xx status and a JSON error body

#### Scenario: Upstream source failure
- **WHEN** the upstream data source fails or times out (the Google Places call, or all Overpass
  mirrors)
- **THEN** the proxy responds with a 5xx status and a JSON error body
- **AND** the error body contains no Google key

### Requirement: CORS
The proxy SHALL apply a CORS policy that permits the frontend origin to call `GET /api/restaurants`.

#### Scenario: Frontend origin is allowed
- **WHEN** the configured frontend origin calls `GET /api/restaurants`
- **THEN** the response carries CORS headers permitting that origin
