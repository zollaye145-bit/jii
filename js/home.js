import { renderPiece } from "./render.js";
import { GALLERY } from "./gallery-data.js";
import { defaultDesign } from "./catalog.js";
import { esc, studioLink } from "./site.js";

/* Hero: a sweater you can recolor, then take to the studio. */
const hero = document.getElementById("hero-art");
const rail = document.querySelector(".swatch-rail");
const looks = [
  { name: "Blush and moss", main: "#F6D3DB", accent: "#4E6B46", trim: "#F4EFE6" },
  { name: "Saffron and milk", main: "#E0A43A", accent: "#F4EFE6", trim: "#F4EFE6" },
  { name: "Sky and navy", main: "#9CC3E0", accent: "#1F2C4C", trim: "#1F2C4C" },
  { name: "Tomato and butter", main: "#D9462E", accent: "#F2D477", trim: "#F2D477" },
  { name: "Lavender and plum", main: "#B7A6D9", accent: "#6E2E55", trim: "#B7A6D9" },
];
let design = { ...defaultDesign("sweater"), pattern: "stripes", stripe: "m", ...looks[0] };

function drawHero(animate) {
  hero.innerHTML = renderPiece(design, { title: `Striped crochet sweater in ${looks.find((l) => l.main === design.main)?.name ?? "custom colors"}` });
  if (animate) {
    hero.classList.remove("piece-swap");
    void hero.offsetWidth;
    hero.classList.add("piece-swap");
  }
}

looks.forEach((l, i) => {
  const b = document.createElement("button");
  b.className = "yarn";
  b.type = "button";
  b.style.setProperty("--c", `linear-gradient(90deg, ${l.main} 50%, ${l.accent} 50%)`);
  b.style.background = `repeating-linear-gradient(115deg, transparent 0 3px, rgba(0,0,0,.09) 3px 4.5px), linear-gradient(90deg, ${l.main} 50%, ${l.accent} 50%)`;
  b.setAttribute("aria-label", l.name);
  b.setAttribute("aria-pressed", String(i === 0));
  b.addEventListener("click", () => {
    rail.querySelectorAll(".yarn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    design = { ...design, ...l };
    drawHero(true);
  });
  rail.append(b);
});
drawHero(false);

hero.style.cursor = "pointer";
hero.title = "Open this design in the studio";
hero.addEventListener("click", () => (location.href = studioLink(design)));

/* Featured pieces */
const featured = document.getElementById("featured");
const picks = ["first-snow", "lavender-hour", "little-cherry", "sunday-market"].map((id) => GALLERY.find((g) => g.id === id)).filter(Boolean);
featured.innerHTML = picks
  .map((g) => {
    const d = { ...defaultDesign(g.design.piece), ...g.design };
    const art = g.photo ? `<img src="${esc(g.photo)}" alt="${esc(g.title)}" loading="lazy">` : renderPiece(d, { title: g.title });
    return `<a href="gallery.html#${esc(g.id)}">
      <div class="frame">${art}</div>
      <div class="placard"><h3>${esc(g.title)}</h3><p class="meta">${g.year}, ${g.hours} hours of work</p></div>
    </a>`;
  })
  .join("");
