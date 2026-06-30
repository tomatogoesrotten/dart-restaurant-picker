import { useMemo } from "react";
import type { Restaurant } from "../types";
import { useGame } from "../state/store";
import { projectToBoard, uvToBoardLocal } from "../lib/projection";

export interface ProjectedPin {
  restaurant: Restaurant;
  /** Normalized board coords (for hit testing). */
  u: number;
  v: number;
  /** Local board-plane coords (for rendering), z is added by the renderer. */
  x: number;
  y: number;
}

/**
 * Project the current round's restaurants onto the board. Shared by the board
 * renderer (placement) and the thrower (hit testing) so both agree exactly.
 */
export function useProjectedPins(): ProjectedPin[] {
  const restaurants = useGame((s) => s.restaurants);
  const selection = useGame((s) => s.selection);
  return useMemo(() => {
    if (!selection) return [];
    return restaurants.map((restaurant) => {
      const { u, v } = projectToBoard(
        restaurant.lat,
        restaurant.lng,
        selection.bounds,
      );
      const { x, y } = uvToBoardLocal(u, v);
      return { restaurant, u, v, x, y };
    });
  }, [restaurants, selection]);
}
