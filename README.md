<div align="center">

# Erebus Wiki

**The lore and chronicles wiki for Athens Through Time.**

Kindred, Elysium locations and the hidden history of the Greek World of Darkness, written by the Storytellers and the players.

[![React](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![React Flow](https://img.shields.io/badge/React_Flow-12-FF0072?style=flat-square)](https://reactflow.dev)
[![Markdown](https://img.shields.io/badge/content-Markdown_%2B_GFM-000000?style=flat-square&logo=markdown&logoColor=white)](https://github.github.com/gfm/)

[Open the wiki](https://wiki.attlarp.gr) · [API](https://github.com/MikeTsak/vtm-platform-back)

</div>

---

## Features

- **Articles.** Markdown with GitHub-flavoured extensions, infoboxes, and image uploads, edited in the TOAST UI editor.
- **Revision history.** Every edit is kept. Compare versions and roll back from `/history/:slug`.
- **Admin notes.** Storyteller-only annotations attached to an article.
- **Lore graph.** A force-directed map of how articles link to each other (`/graph`).
- **Timeline.** The chronicle's history in order (`/timeline`).
- **Elysium boards.** Shared corkboards built from post-it nodes, with per-board membership (`/boards`).
- **Journal.** Private entries that only you can see (`/journal`).
- **Search.** Search across every article.
- **Wikipedia import.** Pull a real-world article in as a starting point (`/import`).
- **SEO and analytics.** Per-page meta tags. Google Analytics 4 loads only after cookie consent.

## Quick start

**Requirements:** Node.js 18+, and the [API](https://github.com/MikeTsak/vtm-platform-back) running on `http://127.0.0.1:3001`.

```bash
npm install
npm run dev
```

The dev server runs on **http://localhost:3003** and proxies API calls to port 3001.

There is no environment file. `src/utils/api.js` targets `http://localhost:3001` in development and `https://api.attlarp.gr` in production builds. You sign in with your portal account.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 3003 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run deploy` | Build, then upload to `wiki.attlarp.gr` over FTPS |
| `npm run deploy:nobuild` | Upload the existing `dist/` |
| `npm run deploy:dry` | Show what would change without uploading |
| `npm run deploy:force` | Build and re-upload every file |
| `npm run deploy:rollback` | Restore the previous entry point on the server |

The first time you deploy, copy `deploy.config.example.json` to `deploy.config.json` (gitignored) and fill in the credentials. Any value can also come from an environment variable such as `FTP_PASSWORD`, which takes priority.

## Routes

| Path | Page |
| --- | --- |
| `/` | The `Main_Page` article |
| `/article/:slug` | Read an article |
| `/create`, `/edit/:slug` | Write or edit an article |
| `/history/:slug` | Revision history and rollback |
| `/graph` | Lore graph |
| `/timeline` | Chronicle timeline |
| `/boards`, `/boards/:id` | Elysium boards |
| `/journal` | Personal journal |
| `/import` | Wikipedia import |
| `/login` | Sign in |

## Project structure

```text
src/
  pages/        Article, EditArticle, Journal, LoreGraph, Timeline, Import,
                ElysiumBoards, ElysiumBoardView, Auth
  components/   Boards (post-it nodes, members), Wiki (history, infobox editor),
                Search, Navigation (layout, footer), Common (SEO, analytics, errors)
  context/      AuthContext
  utils/        api.js (axios client with auth and idempotency keys), wikiMarkdown.js
```

All data lives in the API under `/api/wiki/*`. State-changing requests carry an `Idempotency-Key`, so a retried save never applies twice.

## The Erebus ecosystem

| Repository | Role |
| --- | --- |
| [back](https://github.com/MikeTsak/vtm-platform-back) | API, realtime, jobs, Discord bot |
| [front](https://github.com/MikeTsak/vtm-platform-front) | Player and Storyteller portal at [portal.attlarp.gr](https://portal.attlarp.gr) |
| **wiki-vtm** (this repo) | Erebus Wiki |
| [attlarp.gr](https://github.com/MikeTsak/attlarp.gr) | Public chronicle website |
| [erebus-mobile](https://github.com/MikeTsak/erebus-mobile) | Expo mobile app for SchreckNet and Surface Web |
| [harpy-kindle](https://github.com/MikeTsak/harpy-kindle) | E-ink Harpy terminal for live events |
| [vampire-treasure-hunt](https://github.com/MikeTsak/vampire-treasure-hunt) | Hunt Tracker for location-based challenges |
| [badge-for-larp](https://github.com/MikeTsak/badge-for-larp) | Printable character badge generator |

## License

This repository does not include a license file.

*Vampire: The Masquerade* is a trademark of Paradox Interactive AB. This is an unofficial fan project for the Athens Through Time chronicle.
