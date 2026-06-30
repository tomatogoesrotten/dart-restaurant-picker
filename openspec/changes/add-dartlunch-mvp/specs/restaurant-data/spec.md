## ADDED Requirements

### Requirement: RestaurantSource interface contract
The browser SHALL access restaurant data only through a `RestaurantSource` TypeScript interface that
accepts map bounds plus filters (open now, cuisine/type, price level) and resolves to a list of
shaped restaurants. Each restaurant SHALL carry at least: name, latitude, longitude, cuisine/type,
price level, rating, and a Google Maps link. The UI SHALL depend on this interface, not on any
concrete implementation.

#### Scenario: Querying returns shaped restaurants
- **WHEN** the UI queries the `RestaurantSource` with locked bounds and filters
- **THEN** it resolves to a list of restaurants
- **AND** each restaurant includes name, latitude, longitude, cuisine/type, price level, rating, and
  a Google Maps link

### Requirement: Proxy-calling implementation is the only v1 source
The only v1 implementation of `RestaurantSource` SHALL call the app's own proxy endpoint
`GET /api/restaurants`. The browser SHALL NOT call Google directly and SHALL NOT hold a Google key.

#### Scenario: Data comes via the proxy
- **WHEN** the v1 `RestaurantSource` fetches restaurants
- **THEN** it requests `GET /api/restaurants` with the bounds and filters
- **AND** no request is made directly to Google and no Google key exists in the browser

### Requirement: Filter semantics
The `RestaurantSource` SHALL forward the open-now, cuisine/type, and price-level filters so the
returned set is already filtered, and the returned restaurants become the pins on the board.

#### Scenario: Returned set reflects filters
- **WHEN** the UI queries with open-now on, a chosen cuisine/type, and a chosen price level
- **THEN** the resolved list contains only restaurants matching all selected filters

### Requirement: Error and empty handling
The `RestaurantSource` SHALL distinguish a successful empty result from an error. An empty result
SHALL resolve to an empty list; a transport or proxy error SHALL surface as an error the UI can show
without crashing.

#### Scenario: No restaurants in bounds
- **WHEN** the proxy returns zero restaurants for the locked bounds and filters
- **THEN** the source resolves to an empty list (not an error)

#### Scenario: Proxy or network failure
- **WHEN** the proxy request fails or returns an error status
- **THEN** the source surfaces an error state
- **AND** the UI can present it without crashing

### Requirement: Swappable without UI changes
The `RestaurantSource` interface SHALL be implementable by an alternative provider (e.g. a future
`BackendSource`) and substituting that implementation SHALL require zero changes to UI components.

#### Scenario: Alternative implementation drops in
- **WHEN** the concrete `RestaurantSource` is replaced with a different implementation that satisfies
  the interface
- **THEN** the UI continues to function unchanged
