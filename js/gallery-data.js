/**
 * The collection shown in the gallery.
 *
 * Each piece is drawn from its `design` (same options as the studio).
 * To show a real photo instead, put the image in /assets/gallery/ and add
 *   photo: "assets/gallery/your-photo.jpg"
 * The design is still used for the "Commission one like this" button.
 *
 * status: "available" (can be bought as is), "commission" (can be remade
 * to order) or "collection" (kept by the maker, not for sale).
 */
export const ROOMS = {
  wear: "To wear",
  home: "For the home",
  small: "Little things",
};

export const GALLERY = [
  {
    id: "first-snow",
    title: "First Snow",
    room: "wear",
    year: 2025,
    hours: 46,
    status: "commission",
    note: "Cabled pullover in milk merino. The cables took longer than the rest of the sweater together.",
    design: { piece: "sweater", main: "#F4EFE6", accent: "#D9C7A7", trim: "#F4EFE6", pattern: "cable", yarn: "merino", sleeves: "long", size: "M" },
  },
  {
    id: "garden-wall",
    title: "Garden Wall",
    room: "home",
    year: 2025,
    hours: 72,
    status: "collection",
    note: "One hundred and twelve granny squares, joined one evening at a time.",
    design: { piece: "blanket", main: "#A9BC9B", accent: "#F2D477", trim: "#F4EFE6", pattern: "granny", yarn: "acrylic", size: "Throw" },
  },
  {
    id: "orange-juice",
    title: "Orange Juice",
    room: "wear",
    year: 2026,
    hours: 9,
    status: "available",
    price: 300,
    note: "Cotton crop top for the first warm days. Ties are adjustable.",
    design: { piece: "top", main: "#E0A43A", accent: "#F2D477", trim: "#F4EFE6", pattern: "stripes", stripe: "s", yarn: "cotton", size: "S" },
  },
  {
    id: "sunday-market",
    title: "Sunday Market",
    room: "small",
    year: 2026,
    hours: 6,
    status: "commission",
    note: "Holds a week of vegetables. Handles are worked double so they never stretch.",
    design: { piece: "tote", main: "#D9C7A7", accent: "#4E6B46", trim: "#4E6B46", pattern: "checker", yarn: "cotton", size: "Medium" },
  },
  {
    id: "lavender-hour",
    title: "Lavender Hour",
    room: "wear",
    year: 2026,
    hours: 38,
    status: "commission",
    note: "Mohair cardigan, light as a breath. Pearl buttons sewn on by hand.",
    design: { piece: "cardigan", main: "#B7A6D9", accent: "#F4EFE6", trim: "#B7A6D9", pattern: "plain", yarn: "mohair", sleeves: "long", pockets: true, size: "M" },
  },
  {
    id: "little-cherry",
    title: "Little Cherry",
    room: "small",
    year: 2025,
    hours: 4,
    status: "available",
    price: 160,
    note: "Beanie with an oversized pompom. Baby and adult sizes.",
    design: { piece: "beanie", main: "#D9462E", accent: "#F6D3DB", trim: "#F6D3DB", pattern: "plain", yarn: "acrylic", pompom: true, size: "Adult" },
  },
  {
    id: "long-road",
    title: "The Long Road",
    room: "wear",
    year: 2025,
    hours: 14,
    status: "commission",
    note: "A scarf long enough to wrap twice, with stripes that never repeat the same way.",
    design: { piece: "scarf", main: "#1F2C4C", accent: "#9CC3E0", trim: "#9CC3E0", pattern: "stripes", stripe: "m", yarn: "merino", fringe: true, size: "Oversized" },
  },
  {
    id: "denim-days",
    title: "Denim Days",
    room: "wear",
    year: 2026,
    hours: 40,
    status: "commission",
    note: "Wide-leg crochet trousers with a soft ribbed waist. Made to measure.",
    design: { piece: "pants", main: "#3E5F8A", accent: "#9CC3E0", trim: "#1F2C4C", pattern: "colorblock", yarn: "cotton", legs: "full", size: "M" },
  },
  {
    id: "tea-at-four",
    title: "Tea at Four",
    room: "home",
    year: 2026,
    hours: 30,
    status: "available",
    price: 650,
    note: "Baby blanket in checkerboard, soft enough for a newborn.",
    design: { piece: "blanket", main: "#F6D3DB", accent: "#F4EFE6", trim: "#E8A4B4", pattern: "checker", yarn: "cotton", size: "Baby" },
  },
  {
    id: "moss-and-stone",
    title: "Moss and Stone",
    room: "wear",
    year: 2025,
    hours: 22,
    status: "commission",
    note: "Short-sleeve sweater in two greens, made for in-between seasons.",
    design: { piece: "sweater", main: "#4E6B46", accent: "#A9BC9B", trim: "#23402F", pattern: "colorblock", yarn: "cotton", sleeves: "short", size: "L" },
  },
  {
    id: "plum-jam",
    title: "Plum Jam",
    room: "small",
    year: 2026,
    hours: 5,
    status: "commission",
    note: "Striped beanie, brim folded twice for extra warmth.",
    design: { piece: "beanie", main: "#6E2E55", accent: "#E8A4B4", trim: "#6E2E55", pattern: "stripes", stripe: "s", yarn: "merino", pompom: false, size: "Adult" },
  },
  {
    id: "beach-house",
    title: "Beach House",
    room: "small",
    year: 2026,
    hours: 7,
    status: "collection",
    note: "Granny-square tote in the colors of a summer afternoon.",
    design: { piece: "tote", main: "#9CC3E0", accent: "#F2D477", trim: "#F4EFE6", pattern: "granny", yarn: "cotton", size: "Large" },
  },
];
