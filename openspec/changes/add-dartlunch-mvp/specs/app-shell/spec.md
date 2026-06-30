## ADDED Requirements

### Requirement: Five-phase game state machine
The app SHALL model the game as a single state machine with exactly five phases -- `pick-area`,
`materialize`, `aim`, `throw`, and `result/retry` -- held in Zustand, and SHALL expose the current
phase to the UI as the single source of truth for what is rendered.

#### Scenario: App starts in pick-area
- **WHEN** the app first loads
- **THEN** the current phase is `pick-area`
- **AND** the map view is rendered and the 3D view is not

#### Scenario: Phase drives which view is shown
- **WHEN** the current phase is `pick-area`
- **THEN** the map view is rendered
- **WHEN** the current phase is any of `materialize`, `aim`, `throw`, or `result/retry`
- **THEN** the 3D view is rendered and the map view is not

### Requirement: Forward phase transitions follow the defined order
The state machine SHALL advance only along the defined edges: `pick-area` -> `materialize` ->
`aim` -> `throw` -> `result/retry`, and SHALL reject any transition that is not a defined edge.

#### Scenario: Locking bounds advances to materialize
- **WHEN** the user locks the map bounds in `pick-area`
- **THEN** the phase transitions to `materialize`

#### Scenario: Materialization completing advances to aim
- **WHEN** board materialization completes
- **THEN** the phase transitions to `aim`

#### Scenario: Releasing a charged throw advances through throw to result
- **WHEN** the user releases the dart in `aim`
- **THEN** the phase transitions to `throw`
- **AND** when the dart resolves its impact, the phase transitions to `result/retry`

#### Scenario: Undefined transitions are rejected
- **WHEN** a transition is requested that is not a defined edge (e.g. `pick-area` -> `throw`)
- **THEN** the state machine rejects it and the current phase is unchanged

### Requirement: Retry and reset transitions
The state machine SHALL support a "throw again" transition from `result/retry` back to `aim` and a
"pick new area" transition from `result/retry` back to `pick-area`.

#### Scenario: Throw again returns to aim
- **WHEN** the user chooses "throw again" in `result/retry`
- **THEN** the phase transitions to `aim` with the same board and pins retained

#### Scenario: Pick new area returns to pick-area
- **WHEN** the user chooses "pick new area" in `result/retry`
- **THEN** the phase transitions to `pick-area`
- **AND** the previous board, pins, and throw state are cleared
