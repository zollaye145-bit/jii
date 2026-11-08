import { SITE } from "./config.js";
import { defaultDesign, PIECES } from "./catalog.js";

/* ---------- Design <-> URL ---------- */

export function encodeDesign(d) {
  const json = JSON.stringify(d);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeDesign(str) {
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const d = JSON.parse(decodeURIComponent(escape(atob(b64))));
    if (!PIECES[d.piece]) return null;
    return { ...defaultDesign(d.piece), ...d };
  } catch {
    return null;
  }
}

export const studioLink = (d) => `studio.html#d=${encodeDesign(d)}`;

/* ---------- Helpers ---------- */

export const money = (n) => `${Number(n).toLocaleString("en-US")} ${SITE.currency}`;

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.append(el);
  }
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("is-on"), 2600);
}

export const store = {
  get(k, f) { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

export const whatsappUrl = (text) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

/* ---------- Page chrome ---------- */

function initChrome() {
  document.querySelectorAll("[data-instagram]").forEach((a) => {
    a.href = SITE.instagram;
    if (a.dataset.instagram === "handle") a.textContent = SITE.instagramHandle;
  });
  document.querySelectorAll("[data-whatsapp]").forEach((a) => (a.href = whatsappUrl(`Hello ${SITE.maker}, `)));
  document.querySelectorAll("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear()));

  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a[href]").forEach((a) => {
    if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
  });

  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  btn?.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });

  const head = document.querySelector(".site-head");
  const onScroll = () => head?.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

initChrome();
