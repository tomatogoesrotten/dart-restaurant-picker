## ADDED Requirements

### Requirement: Stateless restaurants endpoint
The proxy SHALL expose a single endpoint `GET /api/restaurants` that accepts map bounds and the
filters (open now, cuisine/type, price level) as request parameters, calls Google Places
server-side, and returns shaped restaurant JSON. The proxy SHALL be stateless and SHALL NOT use a
database.

#### Scenario: Request returns shaped JSON
- **WHEN** a client sends `GET /api/restaurants` with valid bounds and filters
- **THEN** the proxy calls Google Places server-side
- **AND** responds with a JSON array of restaurants, each including name, latitude, longitude,
  cuisine/type, price level, rating, and a Google Maps link

#### Scenario: No persistence between requests
- **WHEN** two identical requests are made
- **THEN** each is served independently with no stored state and no database read or write

### Requirement: Server-side key handling
The proxy SHALL read `GOOGLE_PLACES_KEY` from its server environment and use it only in server-side
calls to Google. The key SHALL NEVER appear in any response body, header, or error returned to the
client.

#### Scenario: Key is never serialized to the client
- **WHEN** any response (success or error) is returned from `GET /api/restaurants`
- **THEN** the response contains no Google key in its body, headers, or error detail

#### Scenario: Missing key fails safe
- **WHEN** `GOOGLE_PLACES_KEY` is not configured on the proxy
- **THEN** the proxy returns a server error without attempting an unauthenticated Google call
- **AND** the error detail does not leak configuration secrets

### Requirement: Error responses
The proxy SHALL return appropriate HTTP error statuses for invalid requests and upstream failures,
with a JSON error body that the client can parse, and SHALL NOT crash the process on a bad request.

#### Scenario: Invalid or missing bounds
- **WHEN** a request omits required bounds or sends malformed bounds
- **THEN** the proxy responds with a 4xx status and a JSON error body

#### Scenario: Upstream Google failure
- **WHEN** the Google Places call fails or times out
- **THEN** the proxy responds with a 5xx status and a JSON error body
- **AND** the error body contains no Google key

### Requirement: CORS
The proxy SHALL apply a CORS policy that permits the frontend origin to call `GET /api/restaurants`.

#### Scenario: Frontend origin is allowed
- **WHEN** the configured frontend origin calls `GET /api/restaurants`
- **THEN** the response carries CORS headers permitting that origin
