## ADDED Requirements

### Requirement: Keyless interactive map
The pick-area phase SHALL render an interactive map using MapLibre GL with OpenStreetMap raster
tiles and SHALL NOT require or use any Google API key. The map SHALL display required OSM
attribution.

#### Scenario: Map renders without a Google key
- **WHEN** the pick-area phase loads
- **THEN** an interactive MapLibre map with OSM raster tiles is shown
- **AND** no Google API key is present in or required by the browser
- **AND** OSM attribution is visible

### Requirement: Pan and zoom to a lunch radius
The map SHALL support panning and zooming so the user can frame their lunch radius before locking.

#### Scenario: User pans and zooms
- **WHEN** the user drags or uses zoom controls / scroll
- **THEN** the visible map bounds update accordingly

### Requirement: Pre-throw filter controls
The pick-area phase SHALL provide filter controls for "open now" (toggle), "cuisine/type"
(selection), and "price level" (selection). It SHALL NOT provide a minimum-rating filter. The
selected filter values SHALL be captured as part of the locked selection.

#### Scenario: Filters are available and exclude minimum-rating
- **WHEN** the user views the filter controls
- **THEN** controls for open-now, cuisine/type, and price level are present
- **AND** no minimum-rating control is present

#### Scenario: Filter selections are captured at lock time
- **WHEN** the user sets filters and then locks the bounds
- **THEN** the locked selection includes the chosen open-now, cuisine/type, and price-level values

### Requirement: Square viewfinder frames the capture area
The pick-area phase SHALL overlay a centered square viewfinder that shows exactly the area that will
become the board; everything outside the square SHALL be dimmed. Map rotation SHALL be disabled so
the frame stays north-up.

#### Scenario: Viewfinder shows what will be captured
- **WHEN** the pick-area phase is shown
- **THEN** a centered square viewfinder marks the area that will become the board
- **AND** the region outside the square is dimmed
- **AND** the map cannot be rotated (it stays north-up)

### Requirement: Lock bounds to start the game
The pick-area phase SHALL provide a "lock bounds" action that captures the geographic bounds of the
viewfinder square (via `map.unproject` of the square's corners) plus the selected filters and
triggers the transition to materialization.

#### Scenario: Locking captures the viewfinder square and advances
- **WHEN** the user invokes "lock bounds"
- **THEN** the geographic bounds of the viewfinder square (not the full map viewport) and the
  selected filters are captured as the locked selection
- **AND** the app transitions to the `materialize` phase
