import { renderPiece, pieceToPng } from "./render.js";
import {
  PIECES, PATTERNS, YARNS, YARN_COLORS, MEASURE_LABELS,
  colorName, defaultDesign, sizePresets, presetMeasures, estimate,
} from "./catalog.js";
import { SITE } from "./config.js";
import { esc, money, toast, store, whatsappUrl, encodeDesign, decodeDesign } from "./site.js";

const $ = (s, r = document) => r.querySelector(s);
const form = $("#designer");

/* ---------- State ---------- */

const fromHash = () => {
  const m = location.hash.match(/d=([^&]+)/);
  return m ? decodeDesign(m[1]) : null;
};
let d = fromHash() ?? store.get("ji:draft", null) ?? defaultDesign("sweater");
if (!PIECES[d.piece]) d = defaultDesign("sweater");

const COMBOS = [
  ["Blush garden", "#F6D3DB", "#4E6B46", "#F4EFE6"],
  ["Sea and sand", "#9CC3E0", "#D9C7A7", "#1F2C4C"],
  ["Marmalade", "#E0A43A", "#F4EFE6", "#B7793F"],
  ["Berry", "#6E2E55", "#E8A4B4", "#F6D3DB"],
  ["Forest walk", "#23402F", "#A9BC9B", "#D9C7A7"],
  ["Cherry", "#D9462E", "#F2D477", "#F4EFE6"],
  ["Monochrome", "#F4EFE6", "#3A3A3D", "#17171A"],
];

const ROLES = {
  main: { label: "Main color", use: "Most of the piece." },
  accent: { label: "Accent color", use: "Stripes, blocks, squares and buttons." },
  trim: { label: "Trim color", use: "Cuffs, collar, hem, handles and fringe." },
};

/* ---------- Static sections (built once) ---------- */

function buildPieces() {
  $("#piece-tiles").innerHTML = Object.entries(PIECES)
    .map(([id, p]) => `<label class="tile"><input type="radio" name="piece" value="${id}"><div class="thumb" data-thumb-piece="${id}"></div><strong>${p.name}</strong><span>from ${money(p.base)}</span></label>`)
    .join("");
}

function buildPatterns() {
  $("#pattern-tiles").innerHTML = Object.entries(PATTERNS)
    .map(([id, p]) => `<label class="tile"><input type="radio" name="pattern" value="${id}"><div class="thumb" data-thumb-pattern="${id}"></div><strong>${p.name}</strong><span>${p.note}</span>${p.add ? `<em class="tag">+${Math.round(p.add * 100)}%</em>` : ""}</label>`)
    .join("");
}

function buildYarns() {
  $("#yarn-tiles").innerHTML = Object.entries(YARNS)
    .map(([id, y]) => `<label class="tile"><input type="radio" name="yarn" value="${id}"><strong>${y.name}</strong><span>${y.note}</span>${y.mult > 1 ? `<em class="tag">+${Math.round((y.mult - 1) * 100)}%</em>` : ""}</label>`)
    .join("");
}

function buildColors() {
  $("#combos").innerHTML = COMBOS.map(
    ([name, a, b, c], i) => `<button type="button" class="combo" data-combo="${i}" aria-label="${name}" title="${name}"><i style="background:${a}"></i><i style="background:${b}"></i><i style="background:${c}"></i></button>`
  ).join("");

  $("#color-roles").innerHTML = Object.entries(ROLES)
    .map(
      ([role, r]) => `<div class="color-role" data-role="${role}">
      <div class="color-role-head"><div><span class="label">${r.label}</span> <span class="small">${r.use}</span></div><span class="now" data-now="${role}"></span></div>
      <div class="palette" role="radiogroup" aria-label="${r.label}">
        ${YARN_COLORS.map((c) => `<button type="button" class="yarn" role="radio" style="--c:${c.hex}" data-color="${c.hex}" aria-label="${c.name}" title="${c.name}"></button>`).join("")}
        <label class="custom-color" title="Any other color"><span class="visually-hidden">Pick any color for ${r.label.toLowerCase()}</span><input type="color" data-custom="${role}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></label>
      </div>
    </div>`
    )
    .join("");
}

/* ---------- Dynamic sections ---------- */

function seg(name, values, current, labels = {}) {
  return `<div class="seg" role="radiogroup">${values
    .map((v) => `<label><input type="radio" name="${name}" value="${v}" ${v === current ? "checked" : ""}><span>${labels[v] ?? v}</span></label>`)
    .join("")}</div>`;
}

function drawPieceOptions() {
  const o = PIECES[d.piece].options;
  const parts = [];
  if (o.sleeves) parts.push(`<div><span class="label">Sleeves</span>${seg("sleeves", o.sleeves, d.sleeves, { long: "Long", short: "Short" })}</div>`);
  if (o.legs) parts.push(`<div><span class="label">Length</span>${seg("legs", o.legs, d.legs, { full: "Full length", shorts: "Shorts" })}</div>`);
  if (o.pompom) parts.push(`<label class="switch"><input type="checkbox" name="pompom" ${d.pompom ? "checked" : ""}> Pompom</label>`);
  if (o.pockets) parts.push(`<label class="switch"><input type="checkbox" name="pockets" ${d.pockets ? "checked" : ""}> Front pockets</label>`);
  if (o.fringe) parts.push(`<label class="switch"><input type="checkbox" name="fringe" ${d.fringe ? "checked" : ""}> Fringe</label>`);
  $("#piece-options").innerHTML = parts.join("");
  $("#piece-options").hidden = !parts.length;
}

function drawSize() {
  const p = PIECES[d.piece];
  $("#size-seg").innerHTML = seg("size", sizePresets(d.piece), d.size).replace(/^<div class="seg" role="radiogroup">|<\/div>$/g, "");
  $("#size-seg").classList.toggle("is-disabled", d.custom);
  $("#size-help").textContent =
    p.sizeMode === "apparel"
      ? "Pick a standard size, or switch on made to measure and enter your own measurements in centimetres."
      : p.sizeMode === "head"
      ? "Pick a size, or measure around your head just above the ears."
      : "Pick a size, or enter the exact dimensions you want.";
  $("#custom-toggle").checked = d.custom;
  drawMeasures();
}

function drawMeasures() {
  const p = PIECES[d.piece];
  $("#measures").innerHTML = p.measures
    .map((m) => {
      const hidden = m === "sleeve" && d.sleeves === "short";
      if (hidden) return "";
      return `<label class="input" data-measure="${m}"><span>${MEASURE_LABELS[m]}</span>
        <span class="unit"><input type="number" inputmode="decimal" min="10" max="300" step="0.5" name="m-${m}" value="${d.measures?.[m] ?? ""}" ${d.custom ? "" : "readonly"}></span>
        <small class="err"></small></label>`;
    })
    .join("");
}

function drawStripeRow() {
  const row = $("#stripe-row");
  row.innerHTML = d.pattern === "stripes" ? `<div><span class="label">Stripe width</span>${seg("stripe", ["s", "m", "l"], d.stripe, { s: "Thin", m: "Medium", l: "Wide" })}</div>` : "";
  row.hidden = d.pattern !== "stripes";
}

function syncInputs() {
  form.querySelectorAll('input[name="piece"]').forEach((i) => (i.checked = i.value === d.piece));
  form.querySelectorAll('input[name="pattern"]').forEach((i) => (i.checked = i.value === d.pattern));
  form.querySelectorAll('input[name="yarn"]').forEach((i) => (i.checked = i.value === d.yarn));
  for (const role of Object.keys(ROLES)) {
    const box = $(`[data-role="${role}"]`);
    let match = false;
    box.querySelectorAll("[data-color]").forEach((b) => {
      const on = b.dataset.color.toLowerCase() === d[role].toLowerCase();
      match ||= on;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (!match) box.querySelector("[data-color]").tabIndex = 0;
    box.querySelector("[data-custom]").value = d[role];
    box.querySelector(".custom-color").style.background = match ? "" : d[role];
    $(`[data-now="${role}"]`).textContent = colorName(d[role]);
    const used = role === "main" || role === "trim" || !["plain"].includes(d.pattern) || d.piece === "cardigan";
    box.style.opacity = used ? 1 : 0.5;
    box.title = used ? "" : "Not used by the plain pattern";
  }
}

/* ---------- Preview, price, summary ---------- */

function sizeText() {
  const p = PIECES[d.piece];
  if (!d.custom) return d.size;
  return p.measures
    .filter((m) => !(m === "sleeve" && d.sleeves === "short"))
    .map((m) => `${MEASURE_LABELS[m]} ${d.measures[m]} cm`)
    .join(", ");
}

function optionsText() {
  const p = PIECES[d.piece], o = [];
  if (p.options.sleeves) o.push(d.sleeves === "short" ? "short sleeves" : "long sleeves");
  if (p.options.legs) o.push(d.legs === "shorts" ? "shorts" : "full length");
  if (p.options.pompom) o.push(d.pompom ? "with pompom" : "no pompom");
  if (p.options.pockets && d.pockets) o.push("front pockets");
  if (p.options.fringe) o.push(d.fringe ? "with fringe" : "no fringe");
  return o.join(", ");
}

function drawPreview() {
  const p = PIECES[d.piece];
  const est = estimate(d);
  const svg = renderPiece(d, { title: `${p.name} preview` });
  $("#stage-art").innerHTML = svg;
  $("#mini-art").innerHTML = svg;
  $("#stage-title").textContent = p.name;
  $("#stage-sub").textContent = `${PATTERNS[d.pattern].name} in ${colorName(d.main)}${d.pattern !== "plain" ? ` and ${colorName(d.accent)}` : ""}, ${YARNS[d.yarn].name.toLowerCase()}`;
  $("#price").textContent = money(est.total);
  $("#price-note").textContent = `Estimate, ready in about ${est.days} days`;
  $("#mini-price").textContent = money(est.total);
  $("#mini-days").textContent = `about ${est.days} days`;

  const dot = (c) => `<span class="dot" style="background:${c}"></span>${esc(colorName(c))}`;
  const rows = [
    ["Piece", `${p.name}${optionsText() ? `, ${optionsText()}` : ""}`],
    ["Size", d.custom ? "Made to measure" : d.size],
    ...(d.custom ? [["Measurements", sizeText().replace(/, /g, "<br>")]] : []),
    ["Pattern", `${PATTERNS[d.pattern].name}${d.pattern === "stripes" ? `, ${{ s: "thin", m: "medium", l: "wide" }[d.stripe]}` : ""}`],
    ["Main", dot(d.main)],
    ...(d.pattern !== "plain" || d.piece === "cardigan" ? [["Accent", dot(d.accent)]] : []),
    ["Trim", dot(d.trim)],
    ["Yarn", YARNS[d.yarn].name],
    ["Ready in", `about ${est.days} days`],
  ];
  $("#summary").innerHTML = `<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${k === "Measurements" ? v : v}</dd>`).join("")}</dl>
    <ul class="breakdown">${est.lines.map(([l, v]) => `<li><span>${esc(l)}</span><span>${money(v)}</span></li>`).join("")}</ul>
    <dl class="total"><dt>Estimated total</dt><dd>${money(est.total)}</dd></dl>
    ${SITE.deposit ? `<p class="small" style="padding: var(--s3) var(--s4)">A deposit of about ${money(Math.round((est.total * SITE.deposit) / 10) * 10)} is asked to start the work.</p>` : ""}`;
}

function drawThumbs() {
  document.querySelectorAll("[data-thumb-piece]").forEach((el) => {
    const id = el.dataset.thumbPiece;
    el.innerHTML = renderPiece({ ...defaultDesign(id), main: d.main, accent: d.accent, trim: d.trim, pattern: d.pattern, stripe: d.stripe }, { shadow: false, title: PIECES[id].name });
  });
  document.querySelectorAll("[data-thumb-pattern]").forEach((el) => {
    el.innerHTML = renderPiece({ ...d, pattern: el.dataset.thumbPattern, stripe: "m" }, { shadow: false, title: PATTERNS[el.dataset.thumbPattern].name });
  });
}

let saveT;
function commit({ structure = false, thumbs = false } = {}) {
  if (structure) {
    drawPieceOptions();
    drawSize();
  }
  drawStripeRow();
  syncInputs();
  drawPreview();
  if (thumbs) drawThumbs();
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    store.set("ji:draft", d);
    history.replaceState(null, "", `#d=${encodeDesign(d)}`);
  }, 250);
}

/* ---------- Events ---------- */

form.addEventListener("change", (e) => {
  const t = e.target;
  const n = t.name;
  if (n === "piece") {
    const keep = { main: d.main, accent: d.accent, trim: d.trim, pattern: d.pattern, stripe: d.stripe, yarn: d.yarn };
    d = { ...defaultDesign(t.value), ...keep };
    if (t.value === "blanket" && d.pattern === "plain") d.pattern = "granny";
    commit({ structure: true, thumbs: true });
  } else if (n === "pattern" || n === "stripe") {
    d[n] = t.value;
    commit({ thumbs: true });
  } else if (n === "yarn" || n === "sleeves" || n === "legs") {
    d[n] = t.value;
    if (n === "sleeves") drawMeasures();
    commit({ thumbs: n !== "yarn" });
  } else if (["pompom", "pockets", "fringe"].includes(n)) {
    d[n] = t.checked;
    commit({ thumbs: true });
  } else if (n === "size") {
    d.size = t.value;
    d.measures = presetMeasures(d.piece, d.size);
    drawMeasures();
    commit();
  } else if (t.id === "custom-toggle") {
    d.custom = t.checked;
    drawSize();
    commit();
    if (d.custom) $("#measures input")?.focus();
  }
});

form.addEventListener("input", (e) => {
  const t = e.target;
  if (t.name?.startsWith("m-")) {
    const key = t.name.slice(2);
    const v = parseFloat(t.value);
    const wrap = t.closest(".input");
    const ok = !Number.isNaN(v) && v >= 10 && v <= 300;
    wrap.classList.toggle("has-error", !ok);
    wrap.querySelector(".err").textContent = ok ? "" : "Enter a number between 10 and 300.";
    if (ok) {
      d.measures = { ...d.measures, [key]: v };
      commit();
    }
  }
  if (t.dataset.custom) {
    d[t.dataset.custom] = t.value;
    commit({ thumbs: true });
  }
});

$("#color-roles").addEventListener("click", (e) => {
  const b = e.target.closest("[data-color]");
  if (!b) return;
  const role = b.closest("[data-role]").dataset.role;
  d[role] = b.dataset.color;
  commit({ thumbs: true });
});

$("#color-roles").addEventListener("keydown", (e) => {
  if (!["ArrowRight", "ArrowLeft"].includes(e.key) || !e.target.matches("[data-color]")) return;
  const list = [...e.target.parentElement.querySelectorAll("[data-color]")];
  const i = list.indexOf(e.target) + (e.key === "ArrowRight" ? 1 : -1);
  const next = list[(i + list.length) % list.length];
  next.focus();
  next.click();
  e.preventDefault();
});

$("#combos").addEventListener("click", (e) => {
  const b = e.target.closest("[data-combo]");
  if (!b) return;
  const [, main, accent, trim] = COMBOS[b.dataset.combo];
  Object.assign(d, { main, accent, trim });
  commit({ thumbs: true });
});

/* ---------- Tools: share, download, save ---------- */

$("#btn-share").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}#d=${encodeDesign(d)}`;
  try {
    if (navigator.share && matchMedia("(pointer: coarse)").matches) await navigator.share({ title: "My crochet design", url });
    else { await navigator.clipboard.writeText(url); toast("Link copied"); }
  } catch { /* share dismissed */ }
});

async function download() {
  const blob = await pieceToPng(d);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ji-${d.piece}-design.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast("Image downloaded");
}
$("#btn-download").addEventListener("click", download);

function drawSaved() {
  const list = store.get("ji:saved", []);
  $("#saved-wrap").hidden = !list.length;
  $("#saved").innerHTML = list
    .map((s, i) => `<div class="saved-item" role="button" tabindex="0" data-load="${i}" aria-label="Load saved ${PIECES[s.piece].name}">${renderPiece(s, { shadow: false })}<span>${PIECES[s.piece].name}</span><button type="button" class="x" data-del="${i}" aria-label="Delete this saved design">×</button></div>`)
    .join("");
}
$("#btn-save").addEventListener("click", () => {
  const list = store.get("ji:saved", []);
  list.unshift(structuredClone(d));
  store.set("ji:saved", list.slice(0, 12));
  drawSaved();
  toast("Design saved");
});
$("#saved").addEventListener("click", (e) => {
  const del = e.target.closest("[data-del]");
  const list = store.get("ji:saved", []);
  if (del) {
    list.splice(Number(del.dataset.del), 1);
    store.set("ji:saved", list);
    drawSaved();
    return;
  }
  const load = e.target.closest("[data-load]");
  if (load) {
    d = { ...defaultDesign(list[load.dataset.load].piece), ...list[load.dataset.load] };
    commit({ structure: true, thumbs: true });
    $("#step-piece").scrollIntoView({ behavior: "smooth" });
    toast("Design loaded");
  }
});
$("#saved").addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-load]")) { e.preventDefault(); e.target.click(); }
});

/* ---------- Order ---------- */

function makeRef() {
  const n = new Date();
  const ymd = `${String(n.getFullYear()).slice(2)}${String(n.getMonth() + 1).padStart(2, "0")}${String(n.getDate()).padStart(2, "0")}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `JI-${ymd}-${rnd}`;
}

function orderMessage(ref, c) {
  const p = PIECES[d.piece];
  const est = estimate(d);
  const link = `${location.origin}${location.pathname}#d=${encodeDesign(d)}`;
  return [
    `Hello ${SITE.maker}, I would like to order a custom piece.`,
    ``,
    `Order ${ref}`,
    `Piece: ${p.name}${optionsText() ? ` (${optionsText()})` : ""}`,
    `Size: ${d.custom ? `made to measure: ${sizeText()}` : d.size}`,
    `Pattern: ${PATTERNS[d.pattern].name}${d.pattern === "stripes" ? `, ${{ s: "thin", m: "medium", l: "wide" }[d.stripe]} stripes` : ""}`,
    `Colors: main ${colorName(d.main)}${d.pattern !== "plain" || d.piece === "cardigan" ? `, accent ${colorName(d.accent)}` : ""}, trim ${colorName(d.trim)}`,
    `Yarn: ${YARNS[d.yarn].name}`,
    `Estimate: ${money(est.total)}, about ${est.days} days`,
    ``,
    `Name: ${c.name}`,
    `Phone: ${c.phone}`,
    c.city ? `City: ${c.city}` : null,
    `Delivery: ${c.delivery}`,
    c.notes ? `Notes: ${c.notes}` : null,
    ``,
    `See the design: ${link}`,
  ].filter((l) => l !== null).join("\n");
}

function fieldError(id, msg) {
  const w = $(id);
  w.classList.toggle("has-error", !!msg);
  w.querySelector(".err").textContent = msg || "";
  return !msg;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(form);
  const c = Object.fromEntries(["name", "phone", "city", "delivery", "notes"].map((k) => [k, String(f.get(k) ?? "").trim()]));
  const okName = fieldError("#f-name", c.name.length < 2 ? "Enter your name so Jihane knows who the order is for." : "");
  const okPhone = fieldError("#f-phone", c.phone.replace(/\D/g, "").length < 8 ? "Enter a phone number with at least 8 digits." : "");
  const badMeasure = document.querySelector("#measures .has-error");
  if (!okName) return $("#f-name input").focus();
  if (!okPhone) return $("#f-phone input").focus();
  if (badMeasure) {
    toast("Check the measurements in step 2");
    return badMeasure.querySelector("input").focus();
  }

  const ref = makeRef();
  const msg = orderMessage(ref, c);
  const url = whatsappUrl(msg);
  const orders = store.get("ji:orders", []);
  orders.unshift({ ref, at: new Date().toISOString(), design: d, customer: { name: c.name, city: c.city }, total: estimate(d).total });
  store.set("ji:orders", orders.slice(0, 20));

  window.open(url, "_blank", "noopener");

  $("#confirm").innerHTML = `<div class="confirm" role="status" tabindex="-1">
    <h3>Your order is ready to send</h3>
    <p>WhatsApp opened with your design filled in. Press send there, and Jihane will reply to confirm the price and the date. Your reference is <span class="ref">${ref}</span>.</p>
    <p>Want her to see the picture too? Download the image and attach it in the chat.</p>
    <div class="order-actions">
      <a class="btn btn--rose" href="${url}" target="_blank" rel="noopener">Open WhatsApp again</a>
      <button class="btn btn--ghost" type="button" data-dl>Download design image</button>
    </div>
  </div>`;
  $("#confirm [data-dl]").addEventListener("click", download);
  $("#confirm .confirm").focus();
});

/* ---------- Step navigation highlight ---------- */

const links = [...document.querySelectorAll("#steps-nav a")];
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => {
        const on = a.getAttribute("href") === `#${en.target.id}`;
        a.classList.toggle("is-active", on);
        if (on) {
          const nav = a.parentElement;
          nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" });
        }
      });
    });
  },
  { rootMargin: "-35% 0px -60% 0px" }
);
document.querySelectorAll(".block").forEach((b) => io.observe(b));
links.forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(a.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
  })
);
document.querySelectorAll('a[href="#step-order"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    $("#step-order").scrollIntoView({ behavior: "smooth" });
  })
);

addEventListener("hashchange", () => {
  const n = fromHash();
  if (n && encodeDesign(n) !== encodeDesign(d)) {
    d = n;
    commit({ structure: true, thumbs: true });
  }
});

/* ---------- Boot ---------- */

buildPieces();
buildPatterns();
buildYarns();
buildColors();
commit({ structure: true, thumbs: true });
drawSaved();
