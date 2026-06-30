// Deterministic analytic projectile + hit test for the dart throw.
// Board is the vertical plane z=0, spanning x,y in [-BOARD_SIZE/2, BOARD_SIZE/2],
// facing the thrower at +z. Gravity acts only on y, so z is linear and the
// plane-crossing time is closed-form (no stepping → fully deterministic).
import { BOARD_SIZE, GRAVITY, HIT_RADIUS, THROW_SPEED_MIN, THROW_SPEED_MAX } from "./constants";

export type Vec3 = { x: number; y: number; z: number };

export function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/** Charge power (0..1) → launch speed, linear MIN→MAX. */
export function chargeToSpeed(power: number): number {
  return THROW_SPEED_MIN + (THROW_SPEED_MAX - THROW_SPEED_MIN) * clamp01(power);
}

/** Normalize aimDir and scale by charge speed. Zero-length aim defaults to -z. */
export function launchVelocity(aimDir: Vec3, power: number): Vec3 {
  const len = Math.hypot(aimDir.x, aimDir.y, aimDir.z);
  const dir = len === 0 ? { x: 0, y: 0, z: -1 } : { x: aimDir.x / len, y: aimDir.y / len, z: aimDir.z / len };
  const speed = chargeToSpeed(power);
  return { x: dir.x * speed, y: dir.y * speed, z: dir.z * speed };
}

/** Where (and when) the dart crosses the board plane z=0, or null if it never does. */
export function impactOnBoard(
  origin: Vec3,
  velocity: Vec3,
  gravity: number = GRAVITY,
): { point: Vec3; t: number } | null {
  if (velocity.z >= 0) return null;
  const t = -origin.z / velocity.z;
  if (t <= 0) return null;
  return {
    point: {
      x: origin.x + velocity.x * t,
      y: origin.y + velocity.y * t - 0.5 * gravity * t * t,
      z: 0,
    },
    t,
  };
}

/** Inverse of uvToBoardLocal: board-plane point → normalized (u,v). */
export function boardPointToUV(point: Vec3): { u: number; v: number } {
  return { u: point.x / BOARD_SIZE + 0.5, v: 0.5 - point.y / BOARD_SIZE };
}

/** Index of the nearest pin within hitRadius (normalized u,v distance), else -1. */
export function hitTest(
  uv: { u: number; v: number },
  pins: Array<{ u: number; v: number }>,
  hitRadius: number = HIT_RADIUS,
): number {
  let best = -1;
  let bestDist = hitRadius;
  for (let i = 0; i < pins.length; i++) {
    const d = Math.hypot(pins[i].u - uv.u, pins[i].v - uv.v);
    if (d <= bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}
