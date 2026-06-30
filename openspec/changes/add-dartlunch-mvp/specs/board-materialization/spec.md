## ADDED Requirements

### Requirement: Map canvas snapshot becomes the board texture
On entering `materialize`, the app SHALL snapshot the MapLibre canvas and crop it to the viewfinder
square, then apply that square image as the texture of the 3D board. It SHALL NOT use a Static Maps
API.

#### Scenario: Board texture is the viewfinder square
- **WHEN** the user locks bounds and materialization begins
- **THEN** the MapLibre canvas is snapshotted and cropped to the viewfinder square
- **AND** the 3D board is textured with that square image
- **AND** no Static Maps API request is made

### Requirement: Web Mercator projection of pins onto the board
The app SHALL project each restaurant's latitude/longitude to normalized board (u,v) coordinates
using Web Mercator, consistent with the snapshot image (the viewfinder-square crop), so pin
positions align with the map including at the edges.

#### Scenario: Pin lands at its real map position
- **WHEN** a restaurant's lat/lng is projected to board (u,v)
- **THEN** the resulting position lies over the same point on the board texture as it does on the
  locked map, including for restaurants near the edges

#### Scenario: Projection matches the snapshot bounds
- **WHEN** the (u,v) projection is computed
- **THEN** it uses the same Web Mercator framing as the snapshot's locked bounds

### Requirement: Pin placement for filtered restaurants
The app SHALL place one pin per restaurant returned by the `RestaurantSource` (already filtered) at
its projected board position. Pins SHALL carry the data needed for the result card.

#### Scenario: Every returned restaurant gets a pin
- **WHEN** the `RestaurantSource` resolves N restaurants for the locked selection
- **THEN** exactly N pins are placed on the board, each at its projected (u,v) position

#### Scenario: Empty result places no pins
- **WHEN** the `RestaurantSource` resolves zero restaurants
- **THEN** the board has no pins

### Requirement: Brief third-person figure
During `materialize`, the app SHALL show a brief third-person shot of a simple low-poly figure
holding a dart. The figure SHALL be un-rigged and un-animated.

#### Scenario: Third-person beat plays
- **WHEN** the board has materialized
- **THEN** a brief third-person view of a low-poly figure holding a dart is shown before the
  transition to `aim`
- **AND** the figure has no rigging or skeletal animation
