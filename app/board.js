// recorded rebuild 2026-11-16 — makefun-frontend-01
// The bounty board: live pots, fees, time left, entries — searchable, sortable,
// filterable without another request. Rows are links; every bounty has its own URL.
import { esc, money, timeLeft, stillOpen } from './format.js';

const pot = (b) => money(b.potUsd ?? b.rewardAmount);
const fee = (b) => (b.entryFeeUsd ? `${money(b.entryFeeUsd)} fee` : 'free entry');
const soon = (b) => stillOpen(b) && new Date(b.deadline).getTime() - Date.now() < 86400000;

export function board(data, query = {}) {
  const items = (data.items ?? []).filter(stillOpen);
  const totalPot = items.reduce((s, b) => s + Number(b.potUsd ?? b.rewardAmount ?? 0), 0);
  const totalEntries = items.reduce((s, b) => s + (b.submissionCount ?? 0), 0);
  const ending = items.filter(soon).length;
  const rows = items.map((b) => `
    <li class="row" data-title="${esc((b.title + ' ' + (b.category ?? '') + ' ' + (b.skills ?? []).join(' ')).toLowerCase())}" data-pot="${Number(b.potUsd ?? b.rewardAmount ?? 0)}" data-entries="${b.submissionCount ?? 0}">
      <a class="row-title" href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a>
      <span class="row-meta">${esc(b.category ?? '')} · ${b.submissionCount} ${b.submissionCount === 1 ? 'entry' : 'entries'}</span>
      <span class="row-pot" title="Live pot: base reward plus entry fees paid in">${pot(b)}</span>
      <span class="row-fee">${fee(b)}</span>
      <span class="row-time ${soon(b) ? 'soon' : ''}" data-deadline="${esc(b.deadline)}">${timeLeft(b.deadline)}</span>
    </li>`).join('');
  return `
  <section class="stats" aria-label="Board totals">
    <div><strong>${money(totalPot)}</strong><span>live pot, ${items.length} open</span></div>
    <div><strong>${totalEntries.toLocaleString('en-US')}</strong><span>entries so far</span></div>
    <div><strong>${ending}</strong><span>ending in 24h</span></div>
  </section>
  <h1>Open bounties</h1>
  <p class="hint">Press <kbd>/</kbd> to search · every pot is live: base reward + entry fees paid in.</p>
  <div class="tools" role="search">
    <label>Search <input id="q" type="search" placeholder="title, category or skill…" value="${esc(query.q ?? '')}" autocomplete="off"></label>
    <label>Sort
      <select id="sort">
        <option value="deadline" ${query.sort === 'deadline' ? 'selected' : ''}>Ending soonest</option>
        <option value="pot" ${query.sort === 'pot' ? 'selected' : ''}>Biggest pot</option>
        <option value="entries" ${query.sort === 'entries' ? 'selected' : ''}>Most entries</option>
      </select>
    </label>
    <label class="check"><input id="ending" type="checkbox" ${query.ending ? 'checked' : ''}> Ending in 24h only</label>
  </div>
  <p id="count" aria-live="polite"></p>
  <ul class="board">${rows}</ul>
  <p class="empty" hidden>No bounties match — clear the search.</p>`;
}

/** Wire the tools after render: filter/sort in place, no refetch, no rebuild of the page. */
export function wireBoard(app, data) {
  const q = app.querySelector('#q'), sort = app.querySelector('#sort'), ending = app.querySelector('#ending');
  const count = app.querySelector('#count'), empty = app.querySelector('.empty');
  const list = app.querySelector('.board');
  let rows = [...list.children];
  function apply() {
    const needle = q.value.trim().toLowerCase();
    let shown = rows.filter((li) => {
      if (needle && !li.dataset.title.includes(needle)) return false;
      if (ending.checked && !li.querySelector('.row-time.soon')) return false;
      return true;
    });
    const key = sort.value;
    shown.sort((a, b) => {
      if (key === 'pot') return Number(b.dataset.pot) - Number(a.dataset.pot);
      if (key === 'entries') return Number(b.dataset.entries) - Number(a.dataset.entries);
      return new Date(a.querySelector('.row-time').dataset.deadline) - new Date(b.querySelector('.row-time').dataset.deadline);
    });
    rows.forEach((li) => (li.style.display = shown.includes(li) ? '' : 'none'));
    shown.forEach((li) => list.appendChild(li));
    count.textContent = `${shown.length} of ${rows.length} bounties`;
    empty.hidden = shown.length > 0;
  }
  q.addEventListener('input', apply);
  sort.addEventListener('change', apply);
  ending.addEventListener('change', apply);
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); }
    if (e.key === 'Escape' && document.activeElement === q) { q.value = ''; apply(); q.blur(); }
  });
  apply();
}
