// Web Mercator projection: map a restaurant's lat/lng onto the board texture.
// Longitude is linear in Mercator X; latitude is non-linear (Mercator Y), so we
// project v through mercatorY to match the map snapshot even at the edges.
import type { Bounds } from "../types";
import { BOARD_SIZE } from "./constants";

/** Web Mercator Y for a latitude in degrees. */
export function mercatorY(latDeg: number): number {
  return Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 180 / 2));
}

/**
 * Project lat/lng to normalized board coords.
 * u: 0..1 west→east (left→right). v: 0..1 north→south (top→bottom).
 */
export function projectToBoard(
  lat: number,
  lng: number,
  bounds: Bounds,
): { u: number; v: number } {
  const u = (lng - bounds.west) / (bounds.east - bounds.west);
  const yN = mercatorY(bounds.north);
  const yS = mercatorY(bounds.south);
  const y = mercatorY(lat);
  const v = (yN - y) / (yN - yS);
  return { u, v };
}

/** Normalized (u,v) → local board-plane coords centered at origin. v=0/top → +y. */
export function uvToBoardLocal(u: number, v: number): { x: number; y: number } {
  return { x: (u - 0.5) * BOARD_SIZE, y: (0.5 - v) * BOARD_SIZE };
}
