# WineLover

WineLover is a small wine-catalogue web app built for the EURECOM _webint_ course
(semester vår2026). It gives wine drinkers a single place to discover wines,
search and filter a catalogue, and keep a personal log of the wines
they have tried along with their own reviews.

The goal is simple: make it easy to find a wine that suits your taste, whether you have had it before or not, and to remember what you thought of the
wines you have already tasted.

## What you can do

- **Browse the homepage** — see a featured "wine of the day" and a list of the
  most recent reviews, with a search box that takes you straight into the
  catalogue.
- **Search & filter the catalogue** — find wines by name, grape, colour,
  price, year, location, rating or keywords. Results can be sorted and are
  paginated, and your last search is remembered so you can pick up where you
  left off.
- **Keep your own reviews** — log a wine you have tried, give it a rating,
  a description, keywords and food pairings, and upload a photo of
  the bottle. Your reviews live in their own list that you can also filter.
- **Maintain a profile** — a personal profile page with your details and your
  own wine quote.
- **Get help** — a help page explaining how the app works.

## How it is built (and why)

This is a course project, so the guiding principle is _keep it small and
explicit_. There is **no framework, no build step, no bundler, no
`package.json`, and no auth**. The whole thing runs on Node's standard
library. That makes the code easy to read end-to-end and easy to run with a
single command, which matters more here than scalability or abstraction.

### Backend — one Node HTTP server

`src/javascript/server.js` is the entire backend. It uses only `http`, `fs`,
and `path`, and handles requests with a flat `if/else` chain rather than a
router. Three lookup tables at the top of the file drive everything:

- `PAGES` maps clean URLs (`/`, `/search`, `/myReviews`, `/myProfile`,
  `/help`) to HTML files. This aliasing is intentional because it keeps the on-disk
  file layout out of the URLs the user sees.
- `STATIC_PREFIXES` serves `/styles/`, `/javascript/`, and `/images/` from
  their directories, with path-traversal protection.
- `MIME` maps file extensions to content types.

### Data — two JSON files as a lightweight database

Two JSON files under `data/` serves as our database for this project:

- `data/wineReviews.json` — the curated, read-only catalogue, served at
  `GET /api/wineReviews`.
- `data/myReviews.json` — the user's own reviews, served at `GET /api/reviews`
  and appended to via `POST /api/reviews`. New reviews get an auto-incremented
  `id`, a date stamped as `DD.MM.YYYY`, and, if a photo was uploaded, an image
  written to `images/wines/` with its public URL stored on the review.

Both files (and `images/wines/`) are bind-mounted in Docker so data and
uploaded images survive container rebuilds.

### Frontend — vanilla pages with shared helpers

Each page in `src/html/` is self-contained: its own HTML, CSS, and JS, loaded
with plain `<script>` tags (no modules). Shared behaviour lives in
`src/javascript/utils.js`. Page-specific
logic lives in `homepage.js`, `search.js`, `myReviews.js`, and `myProfile.js`.

## Project structure

```
data/                     JSON "database" (catalogue + user reviews)
images/                   static assets: images/wines/ holds bottle photos
src/
  html/                   one self-contained page each
  styles/                 per-page CSS + global.css
  javascript/
    server.js             the entire backend
    utils.js              shared frontend helpers
    homepage.js search.js myReviews.js myProfile.js
Dockerfile, docker-compose*.yml
```

## Deployment

The app is deployed using a VPS from Hetzner, with Caddy as reverse proxy providing TLS. Review you wines at https://winelover.online!

## Running the app locally

pick one:

```bash
# Direct (requires Node 22+)
node src/javascript/server.js

# Docker (production-like)
docker compose up --build

# Docker (local dev: exposes :3000, bind-mounts src/ and images/ for live edits)
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

The server listens on port `3000` by default; set the `PORT` environment
variable to override it.
