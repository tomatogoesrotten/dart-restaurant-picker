## ADDED Requirements

### Requirement: Result card on a hit
On a hit, the `result/retry` phase SHALL show a result card for the selected restaurant containing
its name, cuisine/type, price level, rating, and an "Open in Google Maps" link.

#### Scenario: Hit shows the restaurant
- **WHEN** the phase becomes `result/retry` after a hit
- **THEN** a result card displays the selected restaurant's name, cuisine/type, price level, and
  rating
- **AND** an "Open in Google Maps" link to that restaurant is present

#### Scenario: Google Maps link opens the restaurant
- **WHEN** the user activates the "Open in Google Maps" link
- **THEN** it opens Google Maps for the selected restaurant

### Requirement: Miss prompts another throw
On a miss, the `result/retry` phase SHALL indicate the miss and offer a "throw again" action that
returns to `aim` with the same board and pins.

#### Scenario: Miss offers retry
- **WHEN** the phase becomes `result/retry` after a miss
- **THEN** a miss is indicated
- **AND** a "throw again" action is offered
- **WHEN** the user chooses "throw again"
- **THEN** the phase returns to `aim` with the same board and pins retained

### Requirement: Pick a new area
The `result/retry` phase SHALL offer a "pick new area" action that returns to `pick-area` and clears
the previous board, pins, and throw state.

#### Scenario: Pick new area resets to the map
- **WHEN** the user chooses "pick new area"
- **THEN** the phase returns to `pick-area`
- **AND** the previous board, pins, and throw state are cleared

### Requirement: Results use the persistence seam
The `result/retry` phase SHALL record results through the `ResultStore` shim. In v1 the shim SHALL
NOT persist (it is localStorage-ready only), so results SHALL NOT survive a page reload.

#### Scenario: Result recorded via the shim without persistence
- **WHEN** a hit produces a result
- **THEN** the result is recorded through the `ResultStore` shim
- **AND** after a page reload no prior results are present
