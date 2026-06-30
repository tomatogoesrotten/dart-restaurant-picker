import { describe, it, expect } from "vitest";
import { HIT_RADIUS, THROW_SPEED_MIN, THROW_SPEED_MAX } from "./constants";
import { uvToBoardLocal } from "./projection";
import {
  chargeToSpeed,
  launchVelocity,
  impactOnBoard,
  boardPointToUV,
  hitTest,
  type Vec3,
} from "./physics";

describe("chargeToSpeed", () => {
  it("maps charge to the MIN..MAX range and clamps", () => {
    expect(chargeToSpeed(0)).toBe(THROW_SPEED_MIN);
    expect(chargeToSpeed(1)).toBe(THROW_SPEED_MAX);
    expect(chargeToSpeed(0.5)).toBe((THROW_SPEED_MIN + THROW_SPEED_MAX) / 2);
    expect(chargeToSpeed(2)).toBe(THROW_SPEED_MAX);
  });
});

describe("launchVelocity", () => {
  it("magnitude equals chargeToSpeed, direction is normalized aim", () => {
    const v = launchVelocity({ x: 0, y: 0, z: -2 }, 0.5);
    expect(Math.hypot(v.x, v.y, v.z)).toBeCloseTo(chargeToSpeed(0.5), 10);
    expect(v.x).toBeCloseTo(0, 10);
    expect(v.y).toBeCloseTo(0, 10);
    expect(v.z).toBeCloseTo(-chargeToSpeed(0.5), 10);
  });

  it("defaults zero-length aim to -z", () => {
    const v = launchVelocity({ x: 0, y: 0, z: 0 }, 1);
    expect(v).toEqual({ x: 0, y: 0, z: -THROW_SPEED_MAX });
  });
});

describe("impactOnBoard", () => {
  it("flies straight to the board with no gravity", () => {
    const r = impactOnBoard({ x: 0, y: 0, z: 5 }, { x: 0, y: 0, z: -5 }, 0);
    expect(r).toEqual({ point: { x: 0, y: 0, z: 0 }, t: 1 });
  });

  it("drops (y negative) under gravity", () => {
    const r = impactOnBoard({ x: 0, y: 0, z: 5 }, { x: 0, y: 0, z: -5 }, 12);
    expect(r).not.toBeNull();
    expect(r!.point.y).toBeLessThan(0);
  });

  it("returns null when thrown away from the board (velocity.z >= 0)", () => {
    expect(impactOnBoard({ x: 0, y: 0, z: 5 }, { x: 0, y: 0, z: 1 })).toBeNull();
    expect(impactOnBoard({ x: 0, y: 0, z: 5 }, { x: 0, y: 0, z: 0 })).toBeNull();
  });

  it("is deterministic for identical inputs", () => {
    const o: Vec3 = { x: 1, y: 2, z: 5 };
    const vel: Vec3 = { x: 0.3, y: 0.4, z: -3 };
    expect(impactOnBoard(o, vel)).toEqual(impactOnBoard(o, vel));
  });
});

describe("boardPointToUV", () => {
  it("round-trips with uvToBoardLocal", () => {
    const local = uvToBoardLocal(0.3, 0.7);
    const { u, v } = boardPointToUV({ x: local.x, y: local.y, z: 0 });
    expect(u).toBeCloseTo(0.3, 10);
    expect(v).toBeCloseTo(0.7, 10);
  });
});

describe("hitTest", () => {
  it("returns the index of a pin under the uv", () => {
    expect(hitTest({ u: 0.5, v: 0.5 }, [{ u: 0.5, v: 0.5 }])).toBe(0);
  });

  it("returns -1 when just outside hitRadius", () => {
    const uv = { u: 0.5 + HIT_RADIUS + 0.001, v: 0.5 };
    expect(hitTest(uv, [{ u: 0.5, v: 0.5 }])).toBe(-1);
  });

  it("returns the nearer of two pins", () => {
    const pins = [
      { u: 0.5, v: 0.5 },
      { u: 0.52, v: 0.5 },
    ];
    expect(hitTest({ u: 0.515, v: 0.5 }, pins)).toBe(1);
  });
});
