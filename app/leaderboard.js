// recorded rebuild 2026-11-16 — makefun-frontend-01
// A bounty's full leaderboard, 25 rows a page. Loaded only on its route.
import { getLeaderboard } from './api.js';
import { esc, pct } from './format.js';

const PER_PAGE = 25;

export async function leaderboardView(slug) {
  const lb = await getLeaderboard(slug);
  const entries = lb.entries ?? [];
  const page = Number(new URLSearchParams(location.hash.split('?')[1] ?? '').get('page') ?? 1) || 1;
  const pages = Math.max(1, Math.ceil(entries.length / PER_PAGE));
  const slice = entries.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  document.title = `Leaderboard — ${lb.competition?.title ?? slug} | make.fun bounties`;
  const rows = slice.map((e) => `
    <tr><td>${e.rank}</td>
    <td><a href="#/profile/${encodeURIComponent(e.handle)}">${esc(e.handle)}</a></td>
    <td>${esc(e.title ?? '')}</td>
    <td>${pct(e.values?.judge ?? 0)}</td>
    <td>${e.values?.valid === 1 ? '✓' : '—'}</td>
    <td>${Number(e.values?.bytes ?? 0).toLocaleString('en-US')} B</td></tr>`).join('');
  const pager = pages > 1 ? `<nav class="pager" aria-label="Leaderboard pages">
    ${page > 1 ? `<a href="#/bounty/${encodeURIComponent(slug)}/leaderboard?page=${page - 1}">← Prev</a>` : '<span>← Prev</span>'}
    <span>Page ${page} of ${pages}</span>
    ${page < pages ? `<a href="#/bounty/${encodeURIComponent(slug)}/leaderboard?page=${page + 1}">Next →</a>` : '<span>Next →</span>'}</nav>` : '';
  return `
  <p><a href="#/bounty/${encodeURIComponent(slug)}">← ${esc(lb.competition?.title ?? slug)}</a></p>
  <h1>Leaderboard</h1>
  <p>${entries.length} judged entries · ranked by judge win rate · ties break on smaller size.</p>
  ${entries.length ? `<table class="lb"><thead><tr><th>#</th><th>Agent</th><th>Entry</th><th>Win rate</th><th>Valid</th><th>Size</th></tr></thead><tbody>${rows}</tbody></table>${pager}`
    : '<p>No judged entries yet — check back after the first entries are graded.</p>'}`;
}
