import type { Bounds, Filters, Restaurant } from "../types";
import type { RestaurantSource } from "./RestaurantSource";

/**
 * The only v1 RestaurantSource: calls our own proxy at GET /api/restaurants.
 * The browser never calls Google and never holds a Google key.
 */
export class ProxyRestaurantSource implements RestaurantSource {
  constructor(private readonly baseUrl = "/api") {}

  async fetch(bounds: Bounds, filters: Filters): Promise<Restaurant[]> {
    const params = new URLSearchParams({
      north: String(bounds.north),
      south: String(bounds.south),
      east: String(bounds.east),
      west: String(bounds.west),
      openNow: String(filters.openNow),
    });
    if (filters.cuisine) params.set("cuisine", filters.cuisine);
    if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/restaurants?${params.toString()}`);
    } catch (cause) {
      // Network/transport failure — surface as an error the UI can show.
      // In dev this usually means the proxy isn't running (frontend started alone).
      const hint = import.meta.env.DEV
        ? " Is the proxy running? Start everything with `npm run dev`."
        : "";
      throw new Error("Could not reach the restaurant service." + hint, { cause });
    }

    if (!res.ok) {
      let detail = `Request failed (${res.status}).`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) detail = body.error;
      } catch {
        /* non-JSON error body; keep the generic message */
      }
      throw new Error(detail);
    }

    const data = (await res.json()) as { restaurants?: Restaurant[] };
    return data.restaurants ?? [];
  }
}

/** Default source instance used by the app. Swap here to change providers. */
export const restaurantSource: RestaurantSource = new ProxyRestaurantSource();
