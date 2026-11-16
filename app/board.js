// Bounty board: the first view. Fetches the competition list once, then every
// search, sort and filter runs on the copy already in memory — no refetch.

import { boardList } from './api.js';
import { esc, money, moneyShort, timeLeft, stillOpen, num } from './format.js';

let all = [];
let query = '';
let sortKey = 'deadline';
let endingOnly = false;

function row(b) {
  const open = stillOpen(b.deadline);
  const fee = b.entryFeeUsd === null || b.entryFeeUsd === undefined ? 'Free' : money(b.entryFeeUsd);
  return '<article class="card">'
    + '<h2><a href="#/bounty/' + esc(b.slug) + '">' + esc(b.title) + '</a></h2>'
    + '<p class="meta">' + esc(b.category || '') + ' · ' + num(b.submissionCount) + ' entries</p>'
    + '<p class="pot">Live pot <strong>' + money(b.potUsd ?? b.rewardAmount) + '</strong>'
    + ' <span class="fee">Fee ' + esc(fee) + '</span></p>'
    + '<p class="when"><span data-deadline="' + esc(b.deadline) + '">' + esc(timeLeft(b.deadline)) + '</span>'
    + ' · <span class="' + (open ? 'open' : 'closed') + '">' + (open ? 'Open' : 'Closed') + '</span></p>'
    + '</article>';
}

function visible() {
  const q = query.trim().toLowerCase();
  let list = all.filter((b) => {
    if (endingOnly && !stillOpen(b.deadline)) return false;
    if (endingOnly && new Date(b.deadline).getTime() - Date.now() > 86400000) return false;
    if (!q) return true;
    const hay = (b.title + ' ' + (b.category || '') + ' ' + (b.skills || []).join(' ') + ' ' + b.slug).toLowerCase();
    return hay.includes(q);
  });
  const by = {
    deadline: (a, b) => {
      const ao = stillOpen(a.deadline) ? 0 : 1;
      const bo = stillOpen(b.deadline) ? 0 : 1;
      return ao - bo || new Date(a.deadline) - new Date(b.deadline);
    },
    pot: (a, b) => Number(b.potUsd ?? b.rewardAmount ?? 0) - Number(a.potUsd ?? a.rewardAmount ?? 0),
    entries: (a, b) => Number(b.submissionCount ?? 0) - Number(a.submissionCount ?? 0),
  };
  return list.sort(by[sortKey] || by.deadline);
}

function paintList(root) {
  const list = visible();
  const box = root.querySelector('#board-list');
  if (!box) return;
  box.innerHTML = list.length
    ? list.map(row).join('')
    : '<p class="empty">No bounties match that search.</p>';
  const count = root.querySelector('#board-count');
  if (count) count.textContent = list.length + ' of ' + all.length + ' bounties';
}

function paintStats(root) {
  const now = Date.now();
  const pot = all.reduce((s, b) => s + Number(b.potUsd ?? b.rewardAmount ?? 0), 0);
  const entries = all.reduce((s, b) => s + Number(b.submissionCount ?? 0), 0);
  const ending = all.filter((b) => {
    const t = new Date(b.deadline).getTime() - now;
    return t > 0 && t <= 86400000;
  }).length;
  const open = all.filter((b) => stillOpen(b.deadline)).length;
  const stats = root.querySelector('#board-stats');
  if (stats) {
    stats.innerHTML = '<div><strong>' + money(pot) + '</strong><span>total live pot</span></div>'
      + '<div><strong>' + num(entries) + '</strong><span>entries</span></div>'
      + '<div><strong>' + num(open) + '</strong><span>open now</span></div>'
      + '<div><strong>' + num(ending) + '</strong><span>ending in 24h</span></div>';
  }
}

export async function renderBoard(root, params) {
  query = params.get('search') || '';
  sortKey = params.get('sort') || 'deadline';
  if (sortKey !== 'deadline' && sortKey !== 'pot' && sortKey !== 'entries') sortKey = 'deadline';
  endingOnly = params.get('ending') === '1';
  root.innerHTML = '<section aria-label="Bounty board">'
    + '<div id="board-stats" class="stats" aria-live="polite"></div>'
    + '<div class="toolbar">'
    + '<label>Search <input id="board-search" type="search" placeholder="Type to filter — press / to focus" value="' + esc(query) + '" autocomplete="off"></label>'
    + '<label>Sort <select id="board-sort">'
    + '<option value="deadline"' + (sortKey === 'deadline' ? ' selected' : '') + '>Ending soonest</option>'
    + '<option value="pot"' + (sortKey === 'pot' ? ' selected' : '') + '>Biggest pot</option>'
    + '<option value="entries"' + (sortKey === 'entries' ? ' selected' : '') + '>Most entries</option>'
    + '</select></label>'
    + '<label class="check"><input id="board-ending" type="checkbox"' + (endingOnly ? ' checked' : '') + '> Ending in 24h</label>'
    + '</div>'
    + '<p id="board-count" class="count" aria-live="polite"></p>'
    + '<div id="board-list" class="grid"></div>'
    + '</section>';
  const data = await boardList();
  all = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
  paintStats(root);
  paintList(root);

  const search = root.querySelector('#board-search');
  search.addEventListener('input', () => { query = search.value; paintList(root); });
  const sort = root.querySelector('#board-sort');
  sort.addEventListener('change', () => { sortKey = sort.value; paintList(root); });
  const ending = root.querySelector('#board-ending');
  ending.addEventListener('change', () => { endingOnly = ending.checked; paintList(root); });
  root.querySelector('#board-search').focus();
}

export function focusBoardSearch() {
  const input = document.querySelector('#board-search');
  if (input) input.focus();
}

export function clearBoardSearch() {
  const input = document.querySelector('#board-search');
  if (!input) return false;
  if (input.value === '' && query === '') return false;
  input.value = '';
  query = '';
  const root = document.querySelector('#view');
  if (root) paintList(root);
  return true;
}
