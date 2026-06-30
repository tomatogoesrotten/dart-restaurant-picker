// Shared domain types for DartLunch. Kept dependency-free so both the UI and
// the pure logic modules (projection, physics) can import them.

export type Phase = "pick-area" | "materialize" | "aim" | "throw" | "result/retry";

/** Geographic bounding box of the locked map view. */
export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Google-style price level: 1 = $, 4 = $$$$. */
export type PriceLevel = 1 | 2 | 3 | 4;

export interface Filters {
  openNow: boolean;
  /** Cuisine/type keyword (e.g. "ramen"), or null for any. */
  cuisine: string | null;
  /** Maximum price level, or null for any. */
  maxPrice: PriceLevel | null;
}

export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Human-readable cuisine/type label. */
  cuisine: string;
  priceLevel: PriceLevel | null;
  rating: number | null;
  /** "Open in Google Maps" link. */
  mapsUrl: string;
}

/** Bounds + filters captured when the user locks the map. */
export interface LockedSelection {
  bounds: Bounds;
  filters: Filters;
}

export interface ThrowResult {
  hit: boolean;
  restaurant: Restaurant | null;
  at: number;
}

export const DEFAULT_FILTERS: Filters = {
  openNow: true,
  cuisine: null,
  maxPrice: null,
};
