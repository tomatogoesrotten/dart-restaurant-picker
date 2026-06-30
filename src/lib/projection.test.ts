import { describe, it, expect } from "vitest";
import type { Bounds } from "../types";
import { BOARD_SIZE } from "./constants";
import { mercatorY, projectToBoard, uvToBoardLocal } from "./projection";

// Small lunch-radius bbox (~few km) where Mercator is nearly linear.
const small: Bounds = { north: 25.05, south: 24.95, east: 121.55, west: 121.45 };

describe("projectToBoard", () => {
  it("center → ~{u:0.5, v:0.5}", () => {
    const { u, v } = projectToBoard(25.0, 121.5, small);
    expect(u).toBeCloseTo(0.5, 5);
    expect(v).toBeCloseTo(0.5, 2);
  });

  it("NW corner → {u:0, v:0}", () => {
    const { u, v } = projectToBoard(small.north, small.west, small);
    expect(u).toBeCloseTo(0, 5);
    expect(v).toBeCloseTo(0, 5);
  });

  it("SE corner → {u:1, v:1}", () => {
    const { u, v } = projectToBoard(small.south, small.east, small);
    expect(u).toBeCloseTo(1, 5);
    expect(v).toBeCloseTo(1, 5);
  });

  it("east edge → u≈1, west edge → u≈0", () => {
    expect(projectToBoard(25.0, small.east, small).u).toBeCloseTo(1, 5);
    expect(projectToBoard(25.0, small.west, small).u).toBeCloseTo(0, 5);
  });

  it("uses Mercator (not linear) for a large bbox", () => {
    // north=60,south=0; the midpoint latitude 30 is NOT at v=0.5 under Mercator.
    const big: Bounds = { north: 60, south: 0, east: 10, west: 0 };
    const { v } = projectToBoard(30, 5, big);
    expect(Math.abs(v - 0.5)).toBeGreaterThan(0.05);
  });
});

describe("uvToBoardLocal", () => {
  it("center → origin", () => {
    expect(uvToBoardLocal(0.5, 0.5)).toEqual({ x: 0, y: 0 });
  });

  it("top-left (u=0,v=0) → {-BOARD_SIZE/2, +BOARD_SIZE/2}", () => {
    expect(uvToBoardLocal(0, 0)).toEqual({ x: -BOARD_SIZE / 2, y: BOARD_SIZE / 2 });
  });
});

describe("mercatorY", () => {
  it("is 0 at the equator", () => {
    expect(mercatorY(0)).toBeCloseTo(0, 10);
  });
});
