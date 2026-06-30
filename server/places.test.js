import { describe, it, expect } from "vitest";
import {
  validateBounds,
  priceLevelToNumber,
  numberToPriceEnums,
  shapePlace,
} from "./places.js";

const VALID = { north: "25.1", south: "25.0", east: "121.6", west: "121.5" };

describe("validateBounds", () => {
  it("accepts a valid box and returns numeric bounds", () => {
    const r = validateBounds(VALID);
    expect(r.ok).toBe(true);
    expect(r.bounds).toEqual({ north: 25.1, south: 25.0, east: 121.6, west: 121.5 });
  });

  it("rejects a missing param", () => {
    const { north, ...rest } = VALID;
    const r = validateBounds(rest);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/north/);
  });

  it("rejects a non-numeric param", () => {
    const r = validateBounds({ ...VALID, east: "abc" });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/east/);
  });

  it("rejects inverted north/south", () => {
    const r = validateBounds({ ...VALID, north: "24.9" });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/north/);
  });

  it("rejects inverted east/west", () => {
    const r = validateBounds({ ...VALID, east: "121.4" });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/east/);
  });
});

describe("priceLevelToNumber", () => {
  it("maps each known enum", () => {
    expect(priceLevelToNumber("PRICE_LEVEL_FREE")).toBe(1);
    expect(priceLevelToNumber("PRICE_LEVEL_INEXPENSIVE")).toBe(1);
    expect(priceLevelToNumber("PRICE_LEVEL_MODERATE")).toBe(2);
    expect(priceLevelToNumber("PRICE_LEVEL_EXPENSIVE")).toBe(3);
    expect(priceLevelToNumber("PRICE_LEVEL_VERY_EXPENSIVE")).toBe(4);
  });

  it("returns null for unknown/undefined", () => {
    expect(priceLevelToNumber("PRICE_LEVEL_UNSPECIFIED")).toBeNull();
    expect(priceLevelToNumber(undefined)).toBeNull();
  });
});

describe("numberToPriceEnums", () => {
  it("returns levels 1..maxPrice", () => {
    expect(numberToPriceEnums(2)).toEqual([
      "PRICE_LEVEL_INEXPENSIVE",
      "PRICE_LEVEL_MODERATE",
    ]);
  });

  it("returns empty for null", () => {
    expect(numberToPriceEnums(null)).toEqual([]);
  });
});

describe("shapePlace", () => {
  const full = {
    id: "abc123",
    displayName: { text: "Ramen Spot" },
    location: { latitude: 25.04, longitude: 121.56 },
    types: ["ramen_restaurant", "restaurant", "food"],
    primaryTypeDisplayName: { text: "Ramen Restaurant" },
    priceLevel: "PRICE_LEVEL_MODERATE",
    rating: 4.5,
    googleMapsUri: "https://maps.google.com/?cid=123",
  };

  it("maps all fields from a full place", () => {
    expect(shapePlace(full)).toEqual({
      id: "abc123",
      name: "Ramen Spot",
      lat: 25.04,
      lng: 121.56,
      cuisine: "Ramen Restaurant",
      priceLevel: 2,
      rating: 4.5,
      mapsUrl: "https://maps.google.com/?cid=123",
    });
  });

  it("falls back to a maps.google URL with lat,lng when googleMapsUri missing", () => {
    const { googleMapsUri, ...noUri } = full;
    const r = shapePlace(noUri);
    expect(r.mapsUrl).toContain("25.04,121.56");
    expect(r.mapsUrl).toContain("query_place_id=abc123");
  });

  it("maps missing rating to null", () => {
    const { rating, ...noRating } = full;
    expect(shapePlace(noRating).rating).toBeNull();
  });

  it("maps missing priceLevel to null", () => {
    const { priceLevel, ...noPrice } = full;
    expect(shapePlace(noPrice).priceLevel).toBeNull();
  });
});
