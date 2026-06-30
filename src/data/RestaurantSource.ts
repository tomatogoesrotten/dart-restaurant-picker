import type { Bounds, Filters, Restaurant } from "../types";

/**
 * The single seam through which the UI gets restaurants. The UI depends only on
 * this interface — never on a concrete source — so a future `BackendSource` (or
 * any other provider) drops in with zero UI changes.
 */
export interface RestaurantSource {
  /**
   * Resolve restaurants within `bounds` matching `filters`.
   * Resolves to an empty array when there are genuinely no matches.
   * Rejects (throws) on transport/proxy failure so the UI can show an error.
   */
  fetch(bounds: Bounds, filters: Filters): Promise<Restaurant[]>;
}
