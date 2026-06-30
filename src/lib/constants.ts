// Gameplay calibration knobs. All the "feel" lives here as named constants so
// playtest tuning (tasks 9.1) is one edit, never a magic-number hunt.
// ponytail: single source for tuning; widen HIT_RADIUS for casual, tighten for sport.

/** Board is rendered as a square plane of this size (scene units). */
export const BOARD_SIZE = 6;

/**
 * Hit radius in NORMALIZED board units (0..1 across the board).
 * A throw is a hit if its impact lands within this distance of a pin.
 */
export const HIT_RADIUS = 0.07;

/** Gravity (scene units / s^2) applied to the dart's projectile arc. */
export const GRAVITY = 12;

/** Dart launch speed (scene units / s) at 0% and 100% charge. */
export const THROW_SPEED_MIN = 7;
export const THROW_SPEED_MAX = 15;

/** Power gained per second while the throw is held (clamped 0..1). */
export const CHARGE_RATE = 1.3;

/** Distance (scene units) from the board to the first-person throw origin. */
export const THROW_DISTANCE = 7;
