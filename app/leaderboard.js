// Full leaderboard, loaded lazily. One table, 25 rows a page, pager buttons
// that swap only the rows — the fetched entries stay cached in memory.

import { bountyLeaderboard } from './api.js';
import { esc, pct, num } from './format.js';

const PER_PAGE = 25;
let entries = [];
let page = 0;
let slug = '';

function pageRows() {
  const start = page * PER_PAGE;
  const slice = entries.slice(start, start + PER_PAGE);
  return slice.map((e) => {
    const win = e.values ? e.values.judge : null;
    const size = e.values ? e.values.bytes : null;
    const valid = e.values ? e.values.valid : null;
    return '<tr><td>' + num(e.rank) + '</td>'
      + '<td><a href="#/profile/' + esc(e.handle) + '">' + esc(e.handle) + '</a></td>'
      + '<td>' + esc(e.title || '') + '</td>'
      + '<td>' + pct(win) + '</td>'
      + '<td>' + (valid === null || valid === undefined ? '—' : esc(valid)) + '</td>'
      + '<td>' + (size === null || size === undefined ? '—' : num(size) + ' B') + '</td></tr>';
  }).join('');
}

function paint(root) {
  const pages = Math.max(1, Math.ceil(entries.length / PER_PAGE));
  if (page >= pages) page = pages - 1;
  if (page < 0) page = 0;
  const body = root.querySelector('#lb-body');
  if (body) body.innerHTML = pageRows();
  const info = root.querySelector('#lb-page');
  if (info) info.textContent = 'Page ' + (page + 1) + ' of ' + pages + ' · ' + entries.length + ' entries';
  const prev = root.querySelector('#lb-prev');
  const next = root.querySelector('#lb-next');
  if (prev) prev.disabled = page === 0;
  if (next) next.disabled = page >= pages - 1;
}

export async function renderLeaderboard(root, bountySlug) {
  slug = bountySlug;
  page = 0;
  root.innerHTML = '<p class="empty">Loading leaderboard…</p>';
  const board = await bountyLeaderboard(slug);
  entries = Array.isArray(board.entries) ? board.entries : [];
  root.innerHTML = '<section aria-label="Leaderboard">'
    + '<p class="crumbs"><a href="#/">Board</a> / <a href="#/bounty/' + esc(slug) + '">' + esc(board.competition ? board.competition.title : slug) + '</a></p>'
    + '<h1>Leaderboard</h1>'
    + '<p class="count" id="lb-page"></p>'
    + '<table class="board-table"><thead><tr><th>Rank</th><th>Handle</th><th>Entry</th><th>Win rate</th><th>Valid</th><th>Size</th></tr></thead>'
    + '<tbody id="lb-body"></tbody></table>'
    + '<div class="pager"><button id="lb-prev" type="button">← Previous</button>'
    + '<button id="lb-next" type="button">Next →</button></div>'
    + '</section>';
  paint(root);
  root.querySelector('#lb-prev').addEventListener('click', () => { page -= 1; paint(root); });
  root.querySelector('#lb-next').addEventListener('click', () => { page += 1; paint(root); });
}
