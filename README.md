# Mill Makes

Step-by-step build guides for 19 pieces of rustic industrial furniture made from reclaimed scaffold boards: a sideboard, a bookcase, a 4 × 4 cube shelf, a kitchen unit (tea station), a chunky trestle table, a hall bench, shoe rack console, wall shelves, planter box, coffee table, side table, coat rack, storage crates, tiered plant stand, log & magazine rack, headboard, TV & media unit, desk and a bar-height table for the common areas of a converted mill.

Mobile-first, works offline once installed (PWA), UK prices in £, metric sizes.

## What's in it

- **Home**: 19 project cards with progress, filterable by difficulty.
- **Finish looks**: natural oiled, antique dark (walnut tint) or weathered grey. The illustrations, finishing steps and shopping list change to match.
- **Seven tabs per project**: Overview, What to find, Tools, Cut list, Build steps, Finish, Safety.
- **Customise**: change width, depth, height (and number of shelves on the bookcase). The cut list, cutting plan, board count, price and every illustration recalculate.
- **Cutting plan**: packs every part onto 3.9m and/or 2.4m boards (30mm trimmed off each end, 3mm per saw cut), with a printable build sheet and share-as-text.
- **Combined shopping list**: all the projects merged, with screws, glue, sandpaper and oil shared between projects, a running £ total and tick boxes.
- **Workshop mode**: full-screen, big text, swipe or arrow keys between steps, keeps the screen awake.
- **Progress** (step ticks, shopping ticks, sizes) is saved in the browser on that device.

## Run it

You need Node.js 20 or newer (https://nodejs.org).

```bash
npm install
npm run dev
```

Open the address it prints (for example http://localhost:5173). `--host` is on, so you can also open the "Network" address on your phone if it's on the same Wi-Fi.

## Build and deploy

```bash
npm run build
npm run preview
```

`npm run build` makes a static site in `dist/`. The app uses relative paths and hash URLs, so `dist/` works from any static host or sub-folder:

- **Railway**: New Project → Deploy from GitHub repo → pick `mill-makes`. Railway runs `npm install`, `npm run build` and `npm start` (which serves `dist` on Railway's `$PORT`). Then Settings → Networking → Generate Domain.
- **Netlify**: drag the `dist` folder onto https://app.netlify.com/drop.
- **Cloudflare Pages / Vercel / GitHub Pages**: build command `npm run build`, output folder `dist`.

The service worker (offline support) only runs over HTTPS or on localhost.

### Install on a phone

Open the deployed site, then:

- **iPhone (Safari)**: Share → Add to Home Screen.
- **Android (Chrome)**: menu → Install app.

Once installed it works with no signal, in the workshop.

## Adding photos

Each project has photo slots in `public/images/<project>/`:

| Project | Files |
| --- | --- |
| `sideboard` | `hero.jpg`, `detail-hinge.jpg`, `boards-raw.jpg` |
| `bookcase` | `hero.jpg`, `detail-shelf.jpg`, `in-situ.jpg` |
| `cubes` | `hero.jpg`, `detail-grid.jpg`, `in-situ.jpg` |
| `kitchen-unit` | `hero.jpg`, `detail-top.jpg`, `in-situ.jpg` |
| `table` | `hero.jpg`, `detail-key.jpg`, `in-situ.jpg` |
| `bench` | `hero.jpg`, `detail-seat.jpg` |
| `shoe-rack` | `hero.jpg`, `detail-edge.jpg` |
| `shelves` | `hero.jpg`, `detail-bracket.jpg` |
| `planter` | `hero.jpg`, `detail-cap.jpg` |
| `coffee-table` | `hero.jpg`, `detail-top.jpg` |
| `side-table` | `hero.jpg`, `detail-corner.jpg` |
| `coat-rack` | `hero.jpg`, `detail-hook.jpg` |
| `crates` | `hero.jpg`, `detail-crate.jpg` |
| `plant-stand` | `hero.jpg`, `detail-tier.jpg` |
| `log-rack` | `hero.jpg`, `detail-logs.jpg` |
| `headboard` | `hero.jpg`, `detail-cap.jpg` |
| `tv-unit` | `hero.jpg`, `detail-bay.jpg` |
| `desk` | `hero.jpg`, `detail-shelf.jpg` |
| `bar-table` | `hero.jpg`, `detail-footrest.jpg` |

Until a file exists, the app shows an illustration, the file name, and the exact AI image prompt (with a copy button). The prompts are also in `public/images/<project>/PROMPTS.md`. Use JPGs about 1600px wide at 4:3. If you change the prompts in `src/data/*.js`, run `npm run prompts` to rewrite the PROMPTS.md files.

## How it's built

- `src/data/sideboard.js`, `bookcase.js`, `cubes.js`, `kitchen.js`, `table.js`, `bench.js`, `shoerack.js`, `shelves.js`, `planter.js` and one file per further project (with shared preparation steps in `prep.js` and shared parts in `parts.js`): each project as a 3D model (one box per real piece of wood) worked out from the chosen size, plus its steps, fixings, tools, finish and safety notes.
- `src/lib/geometry.js`: boards, panels, cut-list grouping, surface area and weight.
- `src/lib/cutting.js`: the cutting optimiser (rips narrow pieces side by side, then first-fit-decreasing onto stock lengths, swapping to cheaper 2.4m boards where they fit).
- `src/lib/project.js`: shopping list and pricing (oil and sandpaper from surface area, screws by pack).
- `src/data/common.js`: prices, suppliers, board-picking tips, tools, finishing and safety text.
- `src/iso/IsoScene.jsx`: the isometric SVG renderer (wood grain that follows each piece, end grain, knots, nail holes, galvanised end bands, soft shadows, exploded views, labels and screws).
- `src/iso/Ortho.jsx`: dimensioned front, side and top drawings.
- `src/iso/scenes.js`: preparation and joint close-up scenes.

Because the drawings, cut list and prices all come from the same model, they always agree.

## Things to know

- **Prices** are typical UK ranges for late 2026 and will vary by yard. Edit them in `src/data/common.js` (`PRICES`).
- **Load figures** are sensible guides for sound 38mm softwood, not engineering ratings.
- **Common areas**: check with the building's managing agent ("Responsible Person" under the Regulatory Reform (Fire Safety) Order 2005) before placing furniture in shared parts.
