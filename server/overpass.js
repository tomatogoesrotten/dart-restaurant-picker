// Free restaurant data from OpenStreetMap via the Overpass API. No key, no cost.
// Returns the same shaped Restaurant[] as the Google path. OSM lacks ratings and
// price for most places, so those come back null; cuisine + name + location are
// reliable. "Open now" is not applied here (OSM opening_hours needs a full parser).

// Public Overpass mirrors, tried in order — any single one 504s/429s under load.
export const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/** Overpass QL: named eat-out POIs within the bbox, with centers for ways/relations. */
export function buildOverpassQuery(bounds) {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  return (
    `[out:json][timeout:25];` +
    `(nwr["amenity"~"^(restaurant|fast_food|cafe|food_court)$"]["name"](${bbox}););` +
    `out center tags 150;`
  );
}

function titleCase(s) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const AMENITY_LABEL = {
  restaurant: "Restaurant",
  fast_food: "Fast food",
  cafe: "Cafe",
  food_court: "Food court",
};

/** First cuisine value, prettified (OSM cuisine can be "pizza;pasta" or "japanese"). */
export function prettifyCuisine(cuisine) {
  if (!cuisine) return null;
  return titleCase(cuisine.split(";")[0].trim());
}

/** One Overpass element -> Restaurant, or null if it lacks coords or a name. */
export function shapeOverpassElement(el) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const name = el.tags?.name;
  if (lat == null || lng == null || !name) return null;
  return {
    id: `${el.type}/${el.id}`,
    name,
    lat,
    lng,
    cuisine:
      prettifyCuisine(el.tags?.cuisine) ||
      AMENITY_LABEL[el.tags?.amenity] ||
      "Restaurant",
    priceLevel: null,
    rating: null,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`,
  };
}

/** Best-effort cuisine match against the cuisine label and the name (bidirectional). */
export function filterByCuisine(restaurants, cuisine) {
  if (!cuisine) return restaurants;
  const needle = cuisine.trim().toLowerCase();
  if (!needle) return restaurants;
  return restaurants.filter((r) => {
    const c = r.cuisine.toLowerCase();
    return (
      c.includes(needle) ||
      needle.includes(c) ||
      r.name.toLowerCase().includes(needle)
    );
  });
}

async function postOverpass(endpoint, query, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Overpass rejects requests without a descriptive User-Agent (HTTP 406).
        "User-Agent": "DartLunch/0.1 (lunch dart game; local dev)",
        Accept: "application/json",
      },
      body: "data=" + encodeURIComponent(query),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${endpoint} responded ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Query Overpass for restaurants in bounds, shaped + cuisine-filtered. Throws if all mirrors fail. */
export async function fetchFromOverpass(bounds, filters) {
  const query = buildOverpassQuery(bounds);
  let lastErr;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await postOverpass(endpoint, query, 12000);
      const shaped = (data.elements || []).map(shapeOverpassElement).filter(Boolean);
      return filterByCuisine(shaped, filters.cuisine);
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error("All Overpass endpoints failed", { cause: lastErr });
}
