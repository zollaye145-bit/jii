# Ji Little Moments

Website for **Jihane**'s handmade crochet ([@ji_little_moments](https://www.instagram.com/ji_little_moments)).

- **Home** — hero with a sweater you can recolor, featured pieces, how ordering works, about.
- **Gallery** — the collection hung like a museum wall, filtered by room, with a viewer for each piece (yarn, hours, status, price) and a button to commission one like it.
- **Studio** — the custom-order designer: choose the piece, size or exact measurements, three yarn colors, stitch pattern and yarn. The preview and the price estimate update live. The order is sent to WhatsApp with every detail and a link back to the exact design.

Plain HTML, CSS and JavaScript modules. No build step, no dependencies.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly from the disk will not work, because JavaScript modules need a server.)

## Deploy

Any static host works. On **Vercel**: import this repo, framework preset "Other", no build command, output directory `/`.
On **GitHub Pages**: Settings → Pages → deploy from `main`, folder `/`.

## Things to edit

| What | Where |
| --- | --- |
| WhatsApp number, Instagram, currency, deposit | `js/config.js` |
| Gallery pieces (title, story, hours, status, price, photo) | `js/gallery-data.js` |
| Real photos | put them in `assets/gallery/` and add `photo: "assets/gallery/name.jpg"` to the piece |
| Pieces, base prices, yarns, colors, patterns, lead times | `js/catalog.js` |
| About text | `index.html`, section `#about` |

## How it fits together

- `js/render.js` draws every piece as SVG from a design object. The gallery, the home hero and the studio all use it, so a customer's design looks like the pieces in the collection.
- `js/catalog.js` holds the options and the `estimate()` price function.
- A design is encoded in the URL (`studio.html#d=…`), so designs can be shared, saved, and opened from the gallery.
- Saved designs and sent orders are kept in the visitor's browser (localStorage).
