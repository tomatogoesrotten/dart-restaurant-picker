// Sample restaurants for DARTLUNCH_MOCK mode. Tightly clustered around the
// app's default map view (≈25.033, 121.5654) so a default zoom-15 lock shows a
// full board of pins without panning. Real data comes from Google via the key.
export const MOCK_RESTAURANTS = [
  m("mock-ramen", "Ittetsu Ramen", 25.0365, 121.563, "Ramen", 2, 4.5),
  m("mock-beef-noodle", "Lin Dong Fang Beef Noodle", 25.031, 121.5688, "Beef Noodle", 1, 4.4),
  m("mock-italian", "Solo Pasta", 25.0348, 121.5701, "Italian", 3, 4.2),
  m("mock-veggie", "Soul R. Vegan", 25.0292, 121.5612, "Vegetarian", 2, null),
  m("mock-sushi", "Addiction Sushi", 25.0382, 121.5662, "Sushi", 4, 4.3),
  m("mock-hotpot", "Mala Hotpot House", 25.0301, 121.564, "Hotpot", 2, 4.1),
  m("mock-breakfast", "Fuhang Soy Milk", 25.0339, 121.5595, "Breakfast", 1, 4.6),
  m("mock-dumpling", "Din Tai Fung", 25.033, 121.5667, "Dumplings", 3, 4.7),
];

function m(id, name, lat, lng, cuisine, priceLevel, rating) {
  return {
    id,
    name,
    lat,
    lng,
    cuisine,
    priceLevel,
    rating,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  };
}
