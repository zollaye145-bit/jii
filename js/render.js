/**
 * Draws a crochet piece as SVG from a design object.
 * Same renderer feeds the gallery, the home hero and the studio preview,
 * so anything a customer designs looks like the pieces in the collection.
 */

let uid = 0;

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export function shade(hex, amt) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function luminance(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${400 - x} ${y}`);

/* ---------- Shapes: body = patterned fabric, rib = trim color ---------- */

function sleevePair(kind, shoulder) {
  const [sx, sy] = shoulder;
  let s, c;
  if (kind === "short") {
    s = `M${sx} ${sy} L${sx - 40} ${sy + 26} L${sx - 56} ${sy + 98} L${sx - 8} ${sy + 108} L${sx} ${sy + 66} Z`;
    c = `M${sx - 56} ${sy + 98} L${sx - 8} ${sy + 108} L${sx - 10} ${sy + 124} L${sx - 59} ${sy + 113} Z`;
  } else {
    s = `M${sx} ${sy} L${sx - 38} ${sy + 28} L${sx - 70} ${sy + 238} L${sx - 28} ${sy + 246} L${sx} ${sy + 78} Z`;
    c = `M${sx - 70} ${sy + 238} L${sx - 28} ${sy + 246} L${sx - 31} ${sy + 270} L${sx - 74} ${sy + 261} Z`;
  }
  return { body: [s, mirror(s)], rib: [c, mirror(c)] };
}

function shapes(d) {
  switch (d.piece) {
    case "sweater": {
      const sl = sleevePair(d.sleeves, [100, 92]);
      return {
        body: ["M100 92 L160 70 Q200 100 240 70 L300 92 L300 372 L100 372 Z", ...sl.body],
        rib: ["M100 350 L300 350 L300 378 L100 378 Z", "M156 68 Q200 108 244 68 L236 60 Q200 94 164 60 Z", ...sl.rib],
        split: 200,
      };
    }
    case "cardigan": {
      const sl = sleevePair(d.sleeves, [100, 92]);
      const rib = ["M100 352 L300 352 L300 378 L100 378 Z", "M158 70 L200 176 L242 70 L250 74 L207 186 L193 186 L150 74 Z", "M193 180 L207 180 L207 378 L193 378 Z", ...sl.rib];
      if (d.pockets) rib.push("M124 270 L178 270 L178 326 L124 326 Z", "M222 270 L276 270 L276 326 L222 326 Z");
      return {
        body: ["M100 92 L158 70 L200 176 L242 70 L300 92 L300 372 L100 372 Z", ...sl.body],
        rib,
        buttons: [214, 252, 290, 328].map((y) => [200, y]),
        split: 210,
      };
    }
    case "top":
      return {
        body: ["M126 128 Q200 160 274 128 L292 286 L108 286 Z"],
        rib: ["M108 270 L292 270 L294 292 L106 292 Z", "M134 126 L150 54 L160 54 L146 130 Z", mirror("M134 126 L150 54 L160 54 L146 130 Z")],
        split: 190,
      };
    case "pants":
      if (d.legs === "shorts")
        return {
          body: ["M118 84 L282 84 L296 236 L208 236 L200 168 L192 236 L104 236 Z"],
          rib: ["M116 58 L284 58 L284 86 L116 86 Z", "M104 226 L192 226 L191 246 L103 246 Z", mirror("M104 226 L192 226 L191 246 L103 246 Z")],
          split: 150,
        };
      return {
        body: ["M118 84 L282 84 L296 396 L212 396 L200 184 L188 396 L104 396 Z"],
        rib: ["M116 58 L284 58 L284 86 L116 86 Z", "M104 386 L188 386 L188 410 L103 410 Z", mirror("M104 386 L188 386 L188 410 L103 410 Z")],
        split: 200,
      };
    case "beanie":
      return {
        body: ["M112 300 C112 150 150 120 200 120 C250 120 288 150 288 300 Z"],
        rib: ["M100 286 Q200 274 300 286 L300 350 Q200 362 100 350 Z"],
        pompom: d.pompom ? [200, 108, 40] : null,
        split: 210,
      };
    case "scarf":
      return {
        body: ["M156 34 Q178 210 150 382 L250 382 Q222 210 244 34 Z"],
        rib: [],
        fringe: d.fringe ? { top: [156, 244, 34], bottom: [150, 250, 382] } : null,
        split: 208,
      };
    case "tote":
      return {
        body: ["M88 160 L312 160 L300 400 L100 400 Z"],
        rib: ["M88 160 L312 160 L311 186 L89 186 Z"],
        handles: ["M140 162 C140 58 260 58 260 162", "M150 162 C150 76 250 76 250 162"],
        split: 260,
      };
    case "blanket":
      return {
        body: ["M74 74 L326 74 L326 346 L74 346 Z"],
        rib: ["M60 60 L340 60 L340 360 L60 360 Z M74 74 L74 346 L326 346 L326 74 Z"],
        split: 210,
      };
    default:
      return { body: [], rib: [] };
  }
}

/* ---------- Pattern fills ---------- */

function fill(d, s) {
  const { main, accent, trim } = d;
  const out = [];
  const R = (x, y, w, h, c) => out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
  switch (d.pattern) {
    case "stripes": {
      const w = { s: 12, m: 22, l: 40 }[d.stripe] ?? 22;
      for (let y = 0, i = 0; y < 440; y += w, i++) R(0, y, 400, w, i % 2 ? accent : main);
      break;
    }
    case "colorblock":
      R(0, 0, 400, 440, main);
      R(0, 0, 400, s.split ?? 200, accent);
      out.push(`<rect x="0" y="${(s.split ?? 200) - 5}" width="400" height="10" fill="${trim}"/>`);
      break;
    case "checker": {
      const w = 26;
      for (let y = 0; y < 440; y += w) for (let x = 0; x < 400; x += w) R(x, y, w, w, ((x + y) / w) % 2 ? accent : main);
      break;
    }
    case "granny": {
      const w = 44;
      R(0, 0, 400, 440, shade(trim, -0.08));
      const ring = [main, accent, trim];
      for (let y = 4, r = 0; y < 440; y += w, r++)
        for (let x = 2, c = 0; x < 400; x += w, c++) {
          const k = (r + c) % 3;
          R(x + 2, y + 2, w - 4, w - 4, ring[k]);
          R(x + 9, y + 9, w - 18, w - 18, ring[(k + 1) % 3]);
          R(x + 16, y + 16, w - 32, w - 32, ring[(k + 2) % 3]);
        }
      break;
    }
    case "cable": {
      R(0, 0, 400, 440, main);
      const dark = shade(main, -0.22), light = shade(main, 0.25);
      for (let x = 20; x < 400; x += 56) {
        R(x - 16, 0, 2, 440, shade(main, -0.12));
        R(x + 14, 0, 2, 440, shade(main, -0.12));
        let p = `M${x - 7} 0`, q = `M${x + 7} 0`;
        for (let y = 0; y < 440; y += 36) {
          p += ` C${x - 7} ${y + 12} ${x + 7} ${y + 24} ${x + 7} ${y + 36}`;
          q += ` C${x + 7} ${y + 12} ${x - 7} ${y + 24} ${x - 7} ${y + 36}`;
        }
        out.push(`<path d="${p}" stroke="${dark}" stroke-width="9" fill="none" stroke-linecap="round"/>`);
        out.push(`<path d="${q}" stroke="${light}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".75"/>`);
      }
      break;
    }
    default:
      R(0, 0, 400, 440, main);
  }
  return out.join("");
}

/* ---------- Public API ---------- */

export function renderPiece(d, { title = "", shadow = true } = {}) {
  const id = `jp${++uid}`;
  const s = shapes(d);
  const outline = shade(d.main, -0.45);
  const trimLine = shade(d.trim, -0.4);
  const ribDark = shade(d.trim, -0.18);

  const defs = `
  <defs>
    <clipPath id="${id}c">${s.body.map((p) => `<path d="${p}"/>`).join("")}</clipPath>
    <pattern id="${id}st" width="9" height="8" patternUnits="userSpaceOnUse">
      <path d="M1 1.5 L4.5 6.5 L8 1.5" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M1.5 0.5 L4.5 5 L7.5 0.5" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width=".9" stroke-linecap="round"/>
    </pattern>
    <pattern id="${id}rb" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="${d.trim}"/>
      <rect x="4" width="2" height="6" fill="${ribDark}"/>
    </pattern>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".22"/>
      <stop offset=".55" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".18"/>
    </linearGradient>
    <radialGradient id="${id}pp">
      <stop offset="0" stop-color="${shade(d.trim, 0.15)}"/>
      <stop offset="1" stop-color="${shade(d.trim, -0.15)}"/>
    </radialGradient>
  </defs>`;

  const parts = [];
  if (shadow) parts.push(`<ellipse cx="200" cy="420" rx="150" ry="10" fill="#000" opacity=".08"/>`);

  if (s.handles) {
    parts.push(`<path d="${s.handles[0]}" stroke="${trimLine}" stroke-width="20" fill="none" stroke-linecap="round"/>`);
    parts.push(`<path d="${s.handles[0]}" stroke="url(#${id}rb)" stroke-width="16" fill="none" stroke-linecap="round"/>`);
  }

  parts.push(`<g clip-path="url(#${id}c)">${fill(d, s)}<rect width="400" height="440" fill="url(#${id}st)"/><rect width="400" height="440" fill="url(#${id}g)"/></g>`);
  parts.push(s.body.map((p) => `<path d="${p}" fill="none" stroke="${outline}" stroke-width="2" stroke-linejoin="round"/>`).join(""));
  parts.push(s.rib.map((p) => `<path d="${p}" fill="url(#${id}rb)" fill-rule="evenodd" stroke="${trimLine}" stroke-width="2" stroke-linejoin="round"/>`).join(""));

  if (s.buttons)
    parts.push(s.buttons.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${shade(d.accent, -0.1)}" stroke="${shade(d.accent, -0.5)}" stroke-width="1.5"/><circle cx="${x - 2}" cy="${y - 2}" r="1.3" fill="#fff" opacity=".5"/>`).join(""));

  if (s.fringe) {
    const f = [];
    for (const [x0, x1, y, dir] of [[...s.fringe.top, -1], [...s.fringe.bottom, 1]])
      for (let x = x0 + 5; x <= x1 - 4; x += 8)
        f.push(`<path d="M${x} ${y} q${dir * 2} ${dir * 14} ${dir * -1} ${dir * 30}" stroke="${d.trim}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
    parts.splice(shadow ? 1 : 0, 0, `<g>${f.join("").replace(/stroke-width="4"/g, 'stroke-width="6" stroke-opacity=".35"').replace(new RegExp(`stroke="${d.trim}"`, "g"), `stroke="${trimLine}"`)}${f.join("")}</g>`);
  }

  if (s.pompom) {
    const [cx, cy, r] = s.pompom;
    let tufts = "";
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2, rr = r * (0.82 + ((i * 7) % 5) * 0.05);
      tufts += `<circle cx="${(cx + Math.cos(a) * rr * 0.86).toFixed(1)}" cy="${(cy + Math.sin(a) * rr * 0.86).toFixed(1)}" r="${(r * 0.22).toFixed(1)}" fill="${shade(d.trim, (i % 3) * -0.07)}"/>`;
    }
    parts.push(`<g>${tufts}<circle cx="${cx}" cy="${cy}" r="${r * 0.82}" fill="url(#${id}pp)"/></g>`);
  }

  const label = title || `${d.piece} illustration`;
  return `<svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label.replace(/"/g, "&quot;")}">${defs}${parts.join("")}</svg>`;
}

/** Rasterises a design to a PNG blob (for downloads). */
export async function pieceToPng(d, size = 1200, bg = "#FAFBF8") {
  const svg = renderPiece(d);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const c = document.createElement("canvas");
  c.width = size; c.height = Math.round(size * 1.1);
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return new Promise((res) => c.toBlob(res, "image/png"));
}

export { clamp };
