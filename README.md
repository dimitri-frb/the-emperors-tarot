# The Emperor's Tarot

Mobile-first matchup companion for the **Málaga Open** Warhammer 40,000 tournament (20 players, 2000 pts, 11th edition / GDM 2026 pack).

Pick who you are, tap an opponent, and see:

- **Their army** — faction, detachment, force disposition, and the full expandable list with points.
- **Primary missions** — each player's mission from the GDM disposition matrix (`MISSION_MATRIX[yourDispo][oppDispo]`), with the official mission card image one tap away.
- **Terrain layouts** — the 3 recommended maps for the disposition pairing.

## Stack

Plain HTML/CSS/JS, no build step, no dependencies. Deployed on GitHub Pages.

- `index.html` / `styles.css` / `app.js` — the app
- `data.js` — roster, army lists, faction colors, mission matrix (**edit this file as real lists get published**; only Miguel Puerta Rodriguez's list is real today, the rest are plausible placeholders)
- `assets/missions/`, `assets/layouts/` — all 25 mission cards + 45 terrain layouts, downloaded from [gdmissions.app](https://gdmissions.app) so the app **works offline at the venue** (a service worker precaches everything on first visit)
- `scripts/download-assets.mjs` — re-downloads all images and regenerates `assets/manifest.json`

## Updating lists

Edit `data.js` (each player = `{ id, name, team, faction, dispo, summary, list }`), commit, push. Pages redeploys automatically.

If dispositions change, re-run the asset fetch so new pairings are cached:

```sh
node scripts/download-assets.mjs
```

## Run locally

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

Your selected player and opponent persist in `localStorage`.

Mission cards and terrain layouts © [gdmissions.app](https://gdmissions.app/11th/layouts) (GDM 2026, 11th edition).
