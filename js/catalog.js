/**
 * Everything a customer can choose in the studio, and how it is priced.
 * Prices are in the site currency (see config.js) and are estimates —
 * the maker confirms the final price on WhatsApp.
 */

export const YARN_COLORS = [
  { id: "milk", name: "Milk", hex: "#F4EFE6" },
  { id: "oat", name: "Oat", hex: "#D9C7A7" },
  { id: "caramel", name: "Caramel", hex: "#B7793F" },
  { id: "saffron", name: "Saffron", hex: "#E0A43A" },
  { id: "butter", name: "Butter", hex: "#F2D477" },
  { id: "tomato", name: "Tomato", hex: "#D9462E" },
  { id: "rose", name: "Rose", hex: "#E8A4B4" },
  { id: "blush", name: "Blush", hex: "#F6D3DB" },
  { id: "plum", name: "Plum", hex: "#6E2E55" },
  { id: "lavender", name: "Lavender", hex: "#B7A6D9" },
  { id: "sky", name: "Sky", hex: "#9CC3E0" },
  { id: "denim", name: "Denim", hex: "#3E5F8A" },
  { id: "navy", name: "Navy", hex: "#1F2C4C" },
  { id: "sage", name: "Sage", hex: "#A9BC9B" },
  { id: "moss", name: "Moss", hex: "#4E6B46" },
  { id: "forest", name: "Forest", hex: "#23402F" },
  { id: "charcoal", name: "Charcoal", hex: "#3A3A3D" },
  { id: "ink", name: "Ink", hex: "#17171A" },
];

export const colorName = (hex) =>
  YARN_COLORS.find((c) => c.hex.toLowerCase() === String(hex).toLowerCase())?.name ?? `Custom ${hex.toUpperCase()}`;

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const PIECES = {
  sweater: {
    name: "Sweater", blurb: "Crew neck pullover with ribbed cuffs and hem.",
    base: 650, days: 14, sizeMode: "apparel",
    options: { sleeves: ["long", "short"] },
    measures: ["chest", "length", "shoulder", "sleeve"],
  },
  cardigan: {
    name: "Cardigan", blurb: "V-neck, button front, cosy and open.",
    base: 750, days: 16, sizeMode: "apparel",
    options: { sleeves: ["long", "short"], pockets: true },
    measures: ["chest", "length", "shoulder", "sleeve"],
  },
  top: {
    name: "Crop top", blurb: "Strappy summer top, fitted to you.",
    base: 280, days: 6, sizeMode: "apparel",
    options: {},
    measures: ["chest", "waist", "length"],
  },
  pants: {
    name: "Pants", blurb: "High-waist trousers or shorts, ribbed waistband.",
    base: 600, days: 14, sizeMode: "apparel",
    options: { legs: ["full", "shorts"] },
    measures: ["waist", "hip", "inseam"],
  },
  beanie: {
    name: "Beanie", blurb: "Snug hat with a folded brim.",
    base: 150, days: 3, sizeMode: "head",
    options: { pompom: true },
    measures: ["head"],
  },
  scarf: {
    name: "Scarf", blurb: "Long, soft and fringed at both ends.",
    base: 250, days: 5, sizeMode: "dimensions",
    presets: { Short: [140, 20], Classic: [180, 25], Oversized: [220, 40] },
    options: { fringe: true },
    measures: ["lengthCm", "widthCm"],
  },
  tote: {
    name: "Tote bag", blurb: "Everyday market bag with strong handles.",
    base: 220, days: 4, sizeMode: "dimensions",
    presets: { Small: [30, 28], Medium: [38, 35], Large: [46, 42] },
    options: {},
    measures: ["widthCm", "heightCm"],
  },
  blanket: {
    name: "Blanket", blurb: "Throw or bed blanket — granny squares look lovely here.",
    base: 900, days: 25, sizeMode: "dimensions",
    presets: { Baby: [80, 100], Throw: [130, 160], Bed: [200, 220] },
    options: {},
    measures: ["widthCm", "lengthCm"],
  },
};

export const MEASURE_LABELS = {
  chest: "Chest", length: "Body length", shoulder: "Shoulder width", sleeve: "Sleeve length",
  waist: "Waist", hip: "Hips", inseam: "Inseam", head: "Head circumference",
  lengthCm: "Length", widthCm: "Width", heightCm: "Height",
};

/** Reference body measurements (cm) for standard sizes. */
const SIZE_CHART = {
  XS: { chest: 82, waist: 64, hip: 88, length: 58, shoulder: 36, sleeve: 56, inseam: 74 },
  S: { chest: 88, waist: 70, hip: 94, length: 60, shoulder: 38, sleeve: 58, inseam: 76 },
  M: { chest: 96, waist: 78, hip: 100, length: 63, shoulder: 41, sleeve: 60, inseam: 78 },
  L: { chest: 104, waist: 86, hip: 108, length: 66, shoulder: 44, sleeve: 62, inseam: 80 },
  XL: { chest: 112, waist: 94, hip: 116, length: 69, shoulder: 47, sleeve: 63, inseam: 81 },
  XXL: { chest: 122, waist: 104, hip: 124, length: 72, shoulder: 50, sleeve: 64, inseam: 82 },
};
const HEAD_SIZES = { Baby: 42, Child: 50, Adult: 56, "Adult L": 60 };

export function sizePresets(pieceId) {
  const p = PIECES[pieceId];
  if (p.sizeMode === "apparel") return APPAREL_SIZES;
  if (p.sizeMode === "head") return Object.keys(HEAD_SIZES);
  return Object.keys(p.presets);
}

export function defaultSize(pieceId) {
  const p = PIECES[pieceId];
  if (p.sizeMode === "apparel") return "M";
  if (p.sizeMode === "head") return "Adult";
  return Object.keys(p.presets)[1];
}

/** Measurements (cm) implied by a preset size, used to prefill custom inputs. */
export function presetMeasures(pieceId, size) {
  const p = PIECES[pieceId];
  const out = {};
  if (p.sizeMode === "apparel") {
    const row = SIZE_CHART[size] ?? SIZE_CHART.M;
    p.measures.forEach((m) => (out[m] = row[m]));
    if (pieceId === "top") out.length = Math.round(row.length * 0.62);
  } else if (p.sizeMode === "head") {
    out.head = HEAD_SIZES[size] ?? 56;
  } else {
    const [a, b] = p.presets[size] ?? Object.values(p.presets)[1];
    out[p.measures[0]] = a;
    out[p.measures[1]] = b;
  }
  return out;
}

export const PATTERNS = {
  plain: { name: "Plain", note: "One solid color.", add: 0, days: 0 },
  stripes: { name: "Stripes", note: "Main and accent in bands.", add: 0.05, days: 1 },
  colorblock: { name: "Color block", note: "Accent on the upper part.", add: 0.05, days: 1 },
  checker: { name: "Checkerboard", note: "Two-color squares.", add: 0.12, days: 3 },
  granny: { name: "Granny squares", note: "Classic motifs, three colors.", add: 0.2, days: 5 },
  cable: { name: "Cables", note: "Raised twisted columns.", add: 0.18, days: 4 },
};

export const YARNS = {
  acrylic: { name: "Soft acrylic", note: "Easy care, machine washable.", mult: 1 },
  cotton: { name: "Cotton", note: "Breathable, best for summer pieces.", mult: 1.15 },
  merino: { name: "Merino wool", note: "Warm and very soft.", mult: 1.6 },
  mohair: { name: "Mohair blend", note: "Fluffy halo, light and warm.", mult: 1.8 },
};

const SIZE_MULT = { XS: 0.9, S: 0.95, M: 1, L: 1.08, XL: 1.15, XXL: 1.22, Baby: 0.7, Child: 0.85, Adult: 1, "Adult L": 1.08 };

export const EXTRAS = { pompom: 20, pockets: 60, fringe: 30 };

/** Returns { total, lines[], days } for a design. */
export function estimate(d) {
  const p = PIECES[d.piece];
  let base = p.base;
  let sizeMult = SIZE_MULT[d.size] ?? 1;
  if (d.custom) sizeMult = Math.max(sizeMult, 1) + 0.05;
  if (p.sizeMode === "dimensions") {
    const [w, h] = [d.measures?.[p.measures[0]], d.measures?.[p.measures[1]]];
    const [dw, dh] = Object.values(p.presets)[1];
    if (w && h) sizeMult = Math.max(0.5, (w * h) / (dw * dh));
  }
  const lines = [];
  const sized = base * sizeMult;
  lines.push([`${p.name}, ${d.custom ? "made to measure" : d.size}`, sized]);
  const pat = PATTERNS[d.pattern];
  if (pat.add) lines.push([`${pat.name} pattern`, sized * pat.add]);
  const yarn = YARNS[d.yarn];
  const sub = lines.reduce((s, [, v]) => s + v, 0);
  if (yarn.mult !== 1) lines.push([yarn.name, sub * (yarn.mult - 1)]);
  Object.entries(EXTRAS).forEach(([k, v]) => {
    if (p.options[k] && d[k]) lines.push([k === "pompom" ? "Pompom" : k === "pockets" ? "Pockets" : "Fringe", v]);
  });
  const total = Math.round(lines.reduce((s, [, v]) => s + v, 0) / 10) * 10;
  const days = Math.round((p.days + pat.days) * Math.max(1, sizeMult * 0.9));
  return { total, lines: lines.map(([l, v]) => [l, Math.round(v)]), days };
}

export function defaultDesign(pieceId = "sweater") {
  const p = PIECES[pieceId];
  return {
    piece: pieceId,
    size: defaultSize(pieceId),
    custom: false,
    measures: presetMeasures(pieceId, defaultSize(pieceId)),
    main: "#F6D3DB",
    accent: "#4E6B46",
    trim: "#F4EFE6",
    pattern: pieceId === "blanket" ? "granny" : "stripes",
    stripe: "m",
    yarn: pieceId === "top" || pieceId === "tote" ? "cotton" : "acrylic",
    sleeves: p.options.sleeves ? "long" : undefined,
    legs: p.options.legs ? "full" : undefined,
    pompom: !!p.options.pompom,
    pockets: false,
    fringe: !!p.options.fringe,
  };
}
