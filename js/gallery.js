import { renderPiece } from "./render.js";
import { GALLERY, ROOMS } from "./gallery-data.js";
import { defaultDesign, PIECES, YARNS, colorName } from "./catalog.js";
import { esc, money, studioLink, whatsappUrl } from "./site.js";
import { SITE } from "./config.js";

const wall = document.getElementById("wall");
const roomsEl = document.getElementById("rooms");
const viewer = document.getElementById("viewer");
const vArt = document.getElementById("viewer-art");
const vText = document.getElementById("viewer-text");

const full = (g) => ({ ...defaultDesign(g.design.piece), ...g.design });
const art = (g) => (g.photo ? `<img src="${esc(g.photo)}" alt="${esc(g.title)}" loading="lazy">` : renderPiece(full(g), { title: g.title }));
const STATUS = { available: "Available now", commission: "Can be made to order", collection: "In the maker's collection" };

let room = "all";
let visible = GALLERY;
let current = -1;

function drawRooms() {
  const all = [["all", "Everything", GALLERY.length], ...Object.entries(ROOMS).map(([k, v]) => [k, v, GALLERY.filter((g) => g.room === k).length])];
  roomsEl.innerHTML = all
    .map(([k, label, n]) => `<button class="chip" type="button" data-room="${k}" aria-pressed="${k === room}">${esc(label)}<span class="count">${n}</span></button>`)
    .join("");
}

function drawWall() {
  visible = room === "all" ? GALLERY : GALLERY.filter((g) => g.room === room);
  wall.innerHTML = visible.length
    ? visible
        .map(
          (g, i) => `<figure class="exhibit ${g.span === "wide" ? "exhibit--wide" : ""}" id="${esc(g.id)}">
        <button type="button" data-open="${i}" aria-label="Open ${esc(g.title)}">
          <div class="frame">${art(g)}</div>
        </button>
        <figcaption class="placard">
          <h3>${esc(g.title)}</h3>
          <p class="meta">${esc(PIECES[g.design.piece].name)}, ${g.year}</p>
          <span class="status status--${g.status}">${STATUS[g.status]}${g.status === "available" && g.price ? `, ${money(g.price)}` : ""}</span>
        </figcaption>
      </figure>`
        )
        .join("")
    : `<p class="wall-empty lede">Nothing in this room yet.</p>`;
}

function open(i) {
  current = (i + visible.length) % visible.length;
  const g = visible[current];
  const d = full(g);
  vArt.innerHTML = art(g);
  const colors = [...new Set([d.main, d.accent, d.trim])].map(colorName).join(", ");
  const buy =
    g.status === "available"
      ? `<a class="btn" target="_blank" rel="noopener" href="${whatsappUrl(`Hello ${SITE.maker}, I would like to buy "${g.title}" from the gallery${g.price ? ` (${money(g.price)})` : ""}. Is it still available?`)}">Buy this piece</a>
         <a class="btn btn--ghost" href="${studioLink(d)}">Make one in my size</a>`
      : g.status === "commission"
      ? `<a class="btn" href="${studioLink(d)}">Commission one like this</a>`
      : `<a class="btn btn--ghost" href="${studioLink(d)}">Design something similar</a>`;

  vText.innerHTML = `
    <div>
      <p class="small">${current + 1} of ${visible.length}</p>
      <h2 id="viewer-title">${esc(g.title)}</h2>
    </div>
    <p class="read">${esc(g.note)}</p>
    <dl>
      <dt>Piece</dt><dd>${esc(PIECES[d.piece].name)}</dd>
      <dt>Yarn</dt><dd>${esc(YARNS[d.yarn]?.name ?? "")}</dd>
      <dt>Colors</dt><dd>${esc(colors)}</dd>
      <dt>Made in</dt><dd>${g.year}</dd>
      <dt>Time</dt><dd>${g.hours} hours</dd>
      <dt>Status</dt><dd><span class="status status--${g.status}" style="margin:0">${STATUS[g.status]}</span></dd>
      ${g.status === "available" && g.price ? `<dt>Price</dt><dd>${money(g.price)}</dd>` : ""}
    </dl>
    <div class="viewer-actions">
      ${buy}
      <div class="viewer-nav" style="margin-left:auto">
        <button class="icon-btn" type="button" data-step="-1" aria-label="Previous piece"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>
        <button class="icon-btn" type="button" data-step="1" aria-label="Next piece"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>
      </div>
    </div>`;
  if (!viewer.open) viewer.showModal();
  history.replaceState(null, "", `#${g.id}`);
}

function close() {
  viewer.close();
}

roomsEl.addEventListener("click", (e) => {
  const b = e.target.closest("[data-room]");
  if (!b) return;
  room = b.dataset.room;
  drawRooms();
  drawWall();
});

wall.addEventListener("click", (e) => {
  const b = e.target.closest("[data-open]");
  if (b) open(Number(b.dataset.open));
});

viewer.addEventListener("click", (e) => {
  if (e.target === viewer || e.target.closest("[data-close]")) return close();
  const s = e.target.closest("[data-step]");
  if (s) open(current + Number(s.dataset.step));
});
viewer.addEventListener("close", () => {
  history.replaceState(null, "", location.pathname);
  const fig = visible[current] && document.getElementById(visible[current].id);
  fig?.querySelector("button")?.focus({ preventScroll: true });
});
viewer.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") open(current + 1);
  if (e.key === "ArrowLeft") open(current - 1);
});

drawRooms();
drawWall();

const hash = location.hash.slice(1);
if (hash) {
  const i = visible.findIndex((g) => g.id === hash);
  if (i > -1) open(i);
}
