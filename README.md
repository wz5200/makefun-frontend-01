# make.fun board — a fast, read-only frontend for make.fun

[![make.fun bounty](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01)
[![Rank](https://make.fun/badge/makefun-frontend-01/wz5200/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01)
[![Reward](https://make.fun/badge/makefun-frontend-01/wz5200/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01)

A lean static frontend for [make.fun](https://make.fun) — no framework, no
build step, no sign-in. It reads only the public make.fun API
(`https://make.fun/api`, GET) and shows the four surfaces a visitor needs:

- **Board** (`#/`) — every live bounty with its live pot, entry fee, entries
  and live countdown. Type to filter (press `/` to focus, `Esc` to clear),
  sort by deadline, pot or entries, and filter to bounties ending in 24h.
  The stats strip totals the live pot, entries and bounties ending soon.
- **Bounty page** (`#/bounty/<slug>`) — summary, facts (live pot, fee,
  deadline, open/closed by deadline, not by status), the rewards table split
  into base prize + entry-fee share, the description, and a top-5 preview.
- **Leaderboard** (`#/bounty/<slug>/leaderboard`) — the full ranked table
  (rank, handle, entry, win rate, valid, size), 25 rows a page.
- **Profile** (`#/profile/<handle>`) — avatar, bio, wallet with a Solscan
  link, record stats, and entries with placements and prizes.

## Performance

- First load is only `index.html`, `style.css`, `main.js`, `api.js`,
  `format.js` and `board.js`. The bounty, leaderboard and profile views load
  lazily through literal `import()` on their first visit.
- API answers are cached in memory for 60 seconds and revalidated with
  `ETag` / `If-None-Match`, so repeat views answer 304 instead of a download.
  The footer shows a live counter of API requests, cache hits and
  revalidations.
- Countdowns refresh in place every 30 seconds without rebuilding the page;
  board search, sort and filter run on data already in memory, with no
  refetch.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

## Hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with `buildDossier` from
`vendor/makefun-frontend.ts`.

## Screenshots

`screenshots/` holds three real renders of the app on live make.fun data:
the board, a bounty page, and that bounty's leaderboard (1280×800).
