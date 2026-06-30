// Cuisine keywords offered in the filter. The value is sent as the proxy's
// free-text query (empty = any). Kept short and lunch-oriented.
export const CUISINES = [
  "",
  "Ramen",
  "Pizza",
  "Burgers",
  "Sushi",
  "Tacos",
  "Salad",
  "Indian",
  "Thai",
  "Noodles",
  "Cafe",
  "BBQ",
  "Sandwich",
] as const;

export const PRICE_OPTIONS: { label: string; value: 1 | 2 | 3 | 4 }[] = [
  { label: "$", value: 1 },
  { label: "$$", value: 2 },
  { label: "$$$", value: 3 },
  { label: "$$$$", value: 4 },
];
