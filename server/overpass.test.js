import { describe, it, expect } from "vitest";
import {
  buildOverpassQuery,
  prettifyCuisine,
  shapeOverpassElement,
  filterByCuisine,
} from "./overpass.js";

describe("buildOverpassQuery", () => {
  it("includes the bbox in S,W,N,E order and the amenity filter", () => {
    const q = buildOverpassQuery({ north: 25.04, south: 25.02, east: 121.57, west: 121.55 });
    expect(q).toContain("25.02,121.55,25.04,121.57");
    expect(q).toContain("restaurant");
    expect(q).toContain('["name"]');
  });
});

describe("prettifyCuisine", () => {
  it("takes the first value and title-cases it", () => {
    expect(prettifyCuisine("pizza;pasta")).toBe("Pizza");
    expect(prettifyCuisine("fast_food")).toBe("Fast Food");
  });
  it("returns null for empty", () => {
    expect(prettifyCuisine(undefined)).toBeNull();
  });
});

describe("shapeOverpassElement", () => {
  it("shapes a node with tags", () => {
    const r = shapeOverpassElement({
      type: "node",
      id: 1,
      lat: 25.03,
      lon: 121.56,
      tags: { name: "Ramen Bar", cuisine: "ramen", amenity: "restaurant" },
    });
    expect(r).toMatchObject({
      id: "node/1",
      name: "Ramen Bar",
      lat: 25.03,
      lng: 121.56,
      cuisine: "Ramen",
      priceLevel: null,
      rating: null,
    });
    expect(r.mapsUrl).toContain("25.03%2C121.56");
  });
  it("uses center for ways/relations and falls back to amenity label", () => {
    const r = shapeOverpassElement({
      type: "way",
      id: 9,
      center: { lat: 1, lon: 2 },
      tags: { name: "Snack Stand", amenity: "fast_food" },
    });
    expect(r.lat).toBe(1);
    expect(r.lng).toBe(2);
    expect(r.cuisine).toBe("Fast food");
  });
  it("returns null without coords or name", () => {
    expect(shapeOverpassElement({ type: "node", id: 2, tags: { name: "X" } })).toBeNull();
    expect(
      shapeOverpassElement({ type: "node", id: 3, lat: 1, lon: 2, tags: {} }),
    ).toBeNull();
  });
});

describe("filterByCuisine", () => {
  const list = [
    { name: "Burger Joint", cuisine: "Burger" },
    { name: "Green Bowl", cuisine: "Salad" },
  ];
  it("matches plural UI label against singular OSM value (bidirectional)", () => {
    expect(filterByCuisine(list, "Burgers").map((r) => r.name)).toEqual(["Burger Joint"]);
  });
  it("matches against the name too", () => {
    expect(filterByCuisine(list, "bowl").map((r) => r.name)).toEqual(["Green Bowl"]);
  });
  it("returns all when no cuisine given", () => {
    expect(filterByCuisine(list, null)).toHaveLength(2);
  });
});
