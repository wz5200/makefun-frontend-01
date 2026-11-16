# BUILD_LOG — makefun-frontend-01 (Build the best make.fun frontend)

- Competition: `makefun-frontend-01`, slug `makefun-frontend-01`
- Deadline: 2026-11-17 12:30 UTC = Nov 17 20:30 CST
- Pot at build time: $635.50 (base $500 + $135.50 entry fees; 1st place $127.14), 281 entries, entry fee $0.50
- Status: BUILD COMPLETE and sandbox-verified; NOT submitted (blocked on wallet signature — see bottom)
- Local git commit: ea2296dfc77b3084ea180835ef3919a078ed1796 (local repo only, NOT pushed anywhere; no GitHub repo created)
- Payout wallet (Jie, 2026-11-16 14:35): 1247YG56B2hRKZJPuwhGviFGQAoNNEfBrvsE9i56jKTM — in `.makefun/owner.json` as {"wallet": "1247YG56B2hRKZJPuwhGviFGQAoNNEfBrvsE9i56jKTM"} (public address only, never a private key)

## What was built (all original code, no copied entries)

Work dir / submission-ready repo layout: `~/workspace/makefun/frontend-01/work/`
- `main.ts` — starter entrypoint, unchanged (copies app/ + screenshots/, writes dossier.json via vendored buildDossier)
- `serve.ts` — starter static dev server, unchanged
- `vendor/makefun-frontend.ts` — kit copy, unchanged (required byte-for-byte)
- `LICENSE` — MIT (from starter)
- `shots.json` — 3 shots: `#/` board, `#/bounty/makefun-frontend-01` bounty page, `#/bounty/makefun-frontend-01/leaderboard`
- `app/index.html` (979 B) — shell, skip link, header nav (Board / Top pots / Ending soon), footer with live API request/cached/revalidated counter
- `app/style.css` (4,634 B) — single stylesheet, system fonts only, focus-visible outlines, phone layout under 720px
- `app/api.js` (1,364 B) — read-only GET to https://make.fun/api only; in-memory cache + ETag/If-None-Match revalidation (304), 60 s TTL; request counters
- `app/format.js` (1,163 B) — esc/money/date/timeLeft/stillOpen/pct
- `app/board.js` (4,504 B) — board view (first load): stats strip (live total pot, entries, ending-in-24h), search (type-to-filter, `/` shortcut, Esc clears), sort (deadline/pot/entries), ending-24h filter — all client-side, no refetch; rows show title, category, entries, live pot, fee, live countdown
- `app/main.js` (2,629 B) — hash router; bounty/leaderboard/profile views load lazily via literal import() so they are NOT in the first load; 30 s countdown ticker updates in place; window.__shotReady false→true per route
- `app/bounty.js` (2,548 B, lazy) — bounty page: summary, facts (live pot, fee, deadline, open/closed by deadline not status, entries, category/skills), live rewards table (rewardsNow split base+fees), description, top-5 leaderboard preview + full-leaderboard link
- `app/leaderboard.js` (1,924 B, lazy) — full leaderboard table (rank, handle→profile link, title, win rate, valid, size), 25/page pager
- `app/profile.js` (1,760 B, lazy) — public profile: avatar (crossorigin=anonymous, from API answer), bio, wallet (Solscan link), record stats, entries list with placements/prizes
- Total app/: 9 files, 21,505 bytes raw. First load (index.html + style.css + main.js + api.js + format.js + board.js) ≈ 15.3 KB raw, ~5 KB gzipped (to confirm from dossier Totals line).

## Design choices vs the judge rubric (fully functioning > performance > speed > ease of use)
- All 4 surfaces exist as real routes with real live data (starter only had board + bounty).
- Performance: ETag revalidation, 60 s cache, client-side filter/sort, in-place countdown updates, paged leaderboard (25/page).
- Speed: no framework, no fonts, no images except API avatars; lazy import() keeps bounty/leaderboard/profile out of first load.
- Ease of use: search + sort + filters, stats strip, live pots prominent, keyboard (`/`, Esc), skip link, aria-live, readable contrast, phone layout.
- No external origins in source besides https://make.fun; no on* handlers, no createElement scripts, no computed import().

## Checks run
- `node --check` on all 7 app JS files: OK.
- `node serve.ts --port 8901`: index 200, main.js 200.
- `MAKEFUN_OUTPUT_DIR=/tmp/out-test node main.ts`: fails as expected — buildDossier requires ≥1 screenshot in screenshots/ (none yet). Will re-run after screenshots.
- Live API probes (curl): board, bounty, leaderboard (148 entries, top win rate 95.06%), profile (nightshift-labs) all return as expected. Top rival: "Potboard" 95.06% win rate, claims 2 KB first load.

## Screenshots — DONE, real Chromium on live data, never edited/composited/borrowed
- `screenshots/1-board.jpg` 72,282 B, `2-bounty.jpg` 88,833 B, `3-leaderboard.jpg` 98,570 B — all 1280×800 JPEG, each ≤ 256 KiB cap. Visually verified: board shows live pots/fees/countdowns + stats strip + search/sort; bounty page shows live pot $635.50, $0.50 fee, deadline, rewards table (1st $127.14); leaderboard shows 148 judged entries with win rates.
- Browser note: this VM's Chromium cannot tunnel through the egress proxy directly (6 probes: ERR_TUNNEL_CONNECTION_FAILED / ERR_EMPTY_RESPONSE; curl works). Fix used: downloaded Chrome for Testing 159 via curl to ~/.cache/chrome-1255/, and a local CONNECT shim /tmp/pw-tools/shim.mjs (127.0.0.1:8899, creds read from env at runtime, never written to disk) that re-issues CONNECT with proxy auth. Screenshot script: /tmp/pw-tools/shot.mjs (playwright-core in /tmp/pw-tools). /tmp is a 512 MB tmpfs — the browser lives in ~/.cache, not /tmp. The /opt/meta-chromium build refuses to start outside its harness ("Hatch WebGL domain policy is required") and was NOT used.
- One fix from screenshot review: removed the `data:` favicon link from index.html (gate allows data: URLs for fonts only) and rebuilt the dossier.

## Dossier + gate self-check — DONE
- `MAKEFUN_OUTPUT_DIR=/tmp/out-test node main.ts` built cleanly. Dossier Totals line: **first load 6 files, 6,224 bytes gzip-9 (15,273 raw); later by import() 3 files, 3,037 bytes gzip-9; whole app 9 files, 21,505 bytes**. Dossier text within the 163,840-byte cap (buildDossier enforces it and passed).
- Gate rows checked by hand (sealed scorer is NOT published in the kit, so no local gate run exists):
  - app_files: 9 files, 21,505 B (caps 993 files / 16 MiB), index.html 1,011 B (cap 1 MiB), 0 symlinks — PASS
  - references: only https://make.fun origins in source; no on* handlers; no createElement scripts; import() only with literal specifiers — PASS
  - screenshots: 3 files, each ≤ 256 KiB, 1280×800 — PASS
  - dossier_matches: dossier.json written by the vendored buildDossier library itself — PASS
  - js_parses: node --check on all 7 app modules — PASS
- `grade-local` cannot run this kit: "makefun-frontend-01 is a program/v1 competition: its scorer and reference data are not published in the kit, so the house grades it from its competition directory". The dev provisional judge heat (24 judge calls, ~$0.08) runs server-side only after submission — NOT run.

## Interaction verification (Playwright, live data) — DONE
- Profile route `#/profile/nightshift-labs` renders: bio, record (9 entered, best #7, $10 prizes), wallet, entries list.
- Board search "chess" → "1 of 11 bounties"; sort by pot → token-radar $1,325 first; `/` key focuses search; Esc clears.
- No page errors (only Chromium's own content-autofill 403 noise and a favicon 404 before the icon link was removed).

## What remains for submission (parent / user — DO NOT do here)
1. Jie signs in to make.fun (GitHub/Google/Discord OAuth or Solana wallet 1247YG56B2hRKZJPuwhGviFGQAoNNEfBrvsE9i56jKTM) — agent cannot do this; address alone does not log in, an entry must be signed by that wallet.
2. Pay the $0.50 entry fee once per account (USDC into escrow) — `node cli/makefun.mjs` entry-fee flow from inside the unpacked kit.
3. Create a NEW public GitHub repo (created after 2026-11-15T12:30Z); push this work/ tree (local commit ea2296dfc77b3084ea180835ef3919a078ed1796 + BUILD_LOG update commit on top); `.makefun/owner.json` already in the tree, so repo owner ≠ account login is covered.
4. Record the build with the kit (`node cli/makefun.mjs record --competition makefun-frontend-01 --source <repo> -- claude -p ...`) — NOTE: strict transcripts require Claude Code or Codex sessions recorded live; this build was done in Muse, so a re-run under a recorded Claude Code/Codex session may be needed for the transcript check. Flag for parent.
5. Submit: `node cli/makefun.mjs submit --competition makefun-frontend-01 --recording <id> --repo-url https://github.com/<owner>/<repo> --commit <sha> --title "<name>" --keypair <file> --repo <repo>` before 2026-11-17 12:30 UTC (Nov 17 20:30 CST).
6. No secrets/keys were created or stored in this build. No account created, no fee paid, nothing submitted.
