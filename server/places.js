// Pure, testable logic for the DartLunch proxy + the single Google fetch call.
// No Express here so these can be unit-tested without the network.

const PRICE_ENUMS = [
  "PRICE_LEVEL_INEXPENSIVE", // 1
  "PRICE_LEVEL_MODERATE", // 2
  "PRICE_LEVEL_EXPENSIVE", // 3
  "PRICE_LEVEL_VERY_EXPENSIVE", // 4
];

export const PLACES_ENDPOINT =
  "https://places.googleapis.com/v1/places:searchText";

export const FIELD_MASK =
  "places.id,places.displayName,places.location,places.types," +
  "places.primaryTypeDisplayName,places.priceLevel,places.rating," +
  "places.googleMapsUri,places.currentOpeningHours.openNow";

/** Google price enum -> 1..4, or null when unknown/unset. */
export function priceLevelToNumber(enumStr) {
  switch (enumStr) {
    case "PRICE_LEVEL_FREE":
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return null;
  }
}

/** maxPrice (1..4 or null) -> request price enums for levels 1..maxPrice. */
export function numberToPriceEnums(maxPrice) {
  if (maxPrice == null) return [];
  return PRICE_ENUMS.slice(0, maxPrice);
}

/** Pick a human-ish type from Google's snake_case types list. */
function firstHumanType(types) {
  const t = (types || []).find((x) => x && x !== "restaurant" && x !== "food");
  if (!t) return null;
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildMapsUrl(place) {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  let url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  if (place.id) url += `&query_place_id=${place.id}`;
  return url;
}

/** Google place object -> Restaurant. */
export function shapePlace(place) {
  return {
    id: place.id,
    name: place.displayName?.text,
    lat: place.location.latitude,
    lng: place.location.longitude,
    cuisine:
      place.primaryTypeDisplayName?.text ||
      firstHumanType(place.types) ||
      "Restaurant",
    priceLevel: priceLevelToNumber(place.priceLevel),
    rating: place.rating ?? null,
    mapsUrl: place.googleMapsUri || buildMapsUrl(place),
  };
}

/** Parse + validate the query's bounding box. */
export function validateBounds(query) {
  const nums = {};
  for (const key of ["north", "south", "east", "west"]) {
    const raw = query[key];
    if (raw === undefined || raw === "") {
      return { ok: false, error: `Missing required bound: ${key}` };
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      return { ok: false, error: `Bound ${key} must be a number` };
    }
    nums[key] = n;
  }
  if (nums.north <= nums.south) {
    return { ok: false, error: "north must be greater than south" };
  }
  if (nums.east <= nums.west) {
    return { ok: false, error: "east must be greater than west" };
  }
  return { ok: true, bounds: nums };
}

/** Apply the openNow/cuisine/maxPrice filters to shaped Restaurants. */
export function applyFilters(restaurants, filters) {
  const { cuisine, maxPrice } = filters;
  const needle = cuisine ? cuisine.trim().toLowerCase() : null;
  return restaurants.filter((r) => {
    if (maxPrice != null && r.priceLevel != null && r.priceLevel > maxPrice) {
      return false;
    }
    if (needle && !r.cuisine.toLowerCase().includes(needle)) return false;
    return true;
  });
}

/** Call Google Places searchText and return shaped Restaurant[]. Throws on non-OK. */
export async function fetchRestaurants(bounds, filters, apiKey) {
  const body = {
    textQuery: filters.cuisine || "restaurant",
    includedType: "restaurant",
    locationRestriction: {
      rectangle: {
        low: { latitude: bounds.south, longitude: bounds.west },
        high: { latitude: bounds.north, longitude: bounds.east },
      },
    },
    openNow: !!filters.openNow,
  };
  const priceLevels = numberToPriceEnums(filters.maxPrice);
  if (priceLevels.length) body.priceLevels = priceLevels;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let res;
  try {
    res = await fetch(PLACES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    // ponytail: swallow upstream body so the API key/details never leak.
    throw new Error(`Places API responded ${res.status}`);
  }
  const data = await res.json();
  return (data.places || []).map(shapePlace);
}
