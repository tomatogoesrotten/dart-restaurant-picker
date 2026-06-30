## ADDED Requirements

### Requirement: Camera transition to first person
On entering `aim`, the camera SHALL transition from the third-person beat to a first-person view
showing the hand and dart facing the board.

#### Scenario: Aim view is first person
- **WHEN** the phase becomes `aim`
- **THEN** the camera moves from third-person to a first-person view of the hand and dart aimed at
  the board

### Requirement: Cursor-tracking reticle
During `aim`, a reticle SHALL track the cursor position, indicating where the dart is aimed.

#### Scenario: Reticle follows the cursor
- **WHEN** the user moves the cursor during `aim`
- **THEN** the reticle moves to track the cursor

### Requirement: Hold-to-charge power
During `aim`, holding the throw input SHALL charge throw power, and releasing SHALL launch the dart
with that power. The charged power SHALL feed the dart's initial velocity.

#### Scenario: Holding builds power
- **WHEN** the user presses and holds the throw input during `aim`
- **THEN** throw power increases while held

#### Scenario: Releasing throws
- **WHEN** the user releases the throw input
- **THEN** the dart launches using the aim direction and the charged power as its initial velocity
- **AND** the phase transitions to `throw`

### Requirement: Analytic projectile physics with plane raycast
The dart SHALL follow analytic projectile motion (initial velocity from aim direction and charge
power, under gravity), and its path SHALL be raycast against the board plane to determine the impact
point. The app SHALL NOT use a heavyweight physics engine, and the result SHALL be deterministic for
the same inputs.

#### Scenario: Dart flies an arc and sticks
- **WHEN** the dart is launched
- **THEN** it follows a projectile arc under gravity
- **AND** the path is raycast against the board plane to compute the impact point
- **AND** the dart sticks at that impact point

#### Scenario: Deterministic for identical inputs
- **WHEN** the same aim direction and charge power are used twice
- **THEN** the computed impact point is identical both times

### Requirement: Tunable hit radius decides hit vs miss
A throw SHALL count as a hit only if its impact point is within a tunable hit radius of a restaurant
pin (board-space distance); otherwise it SHALL count as a miss. The hit radius SHALL be a single
named, tunable constant.

#### Scenario: Impact within radius is a hit
- **WHEN** the impact point is within the hit radius of a restaurant pin
- **THEN** the throw is a hit and that pin's restaurant is selected
- **AND** the phase transitions to `result/retry` showing a result

#### Scenario: Impact outside any radius is a miss
- **WHEN** the impact point is not within the hit radius of any pin
- **THEN** the throw is a miss
- **AND** the phase transitions to `result/retry` showing a miss

#### Scenario: Hit radius is a single tunable constant
- **WHEN** the hit radius value is changed
- **THEN** it is changed in one named constant and the change applies everywhere hits are evaluated
