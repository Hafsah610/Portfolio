# Hafsah Sayeedah — Marketing Portfolio ✦

A scroll-driven, storytelling portfolio told in **six chapters** — red & black theme — black surfaces, vermilion red accents, paper-white type — with a full-page animated 3D background, and a route map that draws itself as you scroll.

**Live site:** enable GitHub Pages (Settings → Pages → Deploy from branch → `main`, root) and it will be served at `https://hafsah610.github.io/Portfolio/`

## The story

| Chapter | Section | What's inside |
|---|---|---|
| Prologue | Hero | 3D shape field, name reveal, "Every brand has a story." |
| 01 | The Storyteller | About, skills, animated stats (17 months, 65%, 270+, 1 world record) |
| 02 | Plot Points | Horizontal-scroll work timeline — IP DOME, AIESEC, Media Relations, Pahel, Eagle Point |
| 03 | Fresh Ink | Posts & write-ups (first one live: 300+ women self-defense initiative) |
| 04 | On the Ground | Kumbayah Foods RTM project — scroll-drawn Hyderabad route map |
| 05 | The Shelf | Books / movies / articles as flip cards |
| 06 | Off the Clock | Karate (Guinness World Record), marathon, photography |
| Epilogue | Say hello | Contact + LinkedIn |

## Tech

- **HTML / CSS / vanilla JS** — no build step, deploy anywhere
- [Three.js](https://threejs.org/) — full-page 3D background field (30 floating shapes, mouse parallax, scroll traversal)
- [GSAP + ScrollTrigger](https://gsap.com/) — pinned sections, scrubbed animations, counters, reveals
- [Lenis](https://lenis.darkroom.engineering/) — smooth scrolling
- Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces) + [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)

All libraries load from CDNs; the site is fully static.

## Run locally

Any static server works:

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

## Structure

```
index.html        # all content & sections
css/style.css     # design system, chapter themes, animations
js/main.js        # 3D scene, scroll storytelling, chapter color engine
assets/           # portrait + photography video
```

## Updating content

Search `index.html` for **`EDIT ME`** comments:

- **Posts** — replace the draft rows with real article links as they're published
- **The Shelf** — put real book / movie / article titles on the card backs

Chapter background & glow colors live in each `<section>`'s `data-bg` / `data-b1..b4` attributes; the global palette (black, vermilion red, paper type) is the CSS variables at the top of `css/style.css`.

---

Made with stories & chai ☕
