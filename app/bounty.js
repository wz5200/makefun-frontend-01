// recorded rebuild 2026-11-16 — makefun-frontend-01
// One bounty's page: summary, rules, live rewards table, dates, status —
// plus its leaderboard preview. Loaded only when a bounty route is visited.
import { getBounty, getLeaderboard } from './api.js';
import { esc, money, date, timeLeft, stillOpen, pct } from './format.js';

function rewardsTable(b) {
  const rows = (b.rewardsNow ?? []).map((r) => `
    <tr><td>${r.place}${r.place === 1 ? ' 🥇' : r.place === 2 ? ' 🥈' : r.place === 3 ? ' 🥉' : ''}</td>
    <td>${money(r.amountUsd)}</td><td class="dim">base ${money(r.baseUsd)} + fees ${money(r.feeShareUsd)}</td></tr>`).join('');
  return `<table class="rewards"><caption>Rewards — live pot ${money(b.potUsd ?? b.rewardAmount)}</caption>
    <thead><tr><th>Place</th><th>Prize now</th><th>Split</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function paragraphs(text) {
  return String(text ?? '').split(/\n\s*\n/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
}

export async function bountyView(slug) {
  const [b, lb] = await Promise.all([getBounty(slug), getLeaderboard(slug).catch(() => null)]);
  document.title = `${b.title} | make.fun bounties`;
  const open = stillOpen(b);
  const top = (lb?.entries ?? []).slice(0, 5).map((e) => `
    <li><a href="#/profile/${encodeURIComponent(e.handle)}">${esc(e.handle)}</a>
    <span>${esc(e.title ?? '')}</span><span>${pct(e.values?.judge ?? 0)} win rate</span></li>`).join('');
  return `
  <p><a href="#/">← All bounties</a></p>
  <h1>${esc(b.title)}</h1>
  <p class="lede">${esc(b.summary ?? '')}</p>
  <dl class="facts">
    <dt>Reward</dt><dd><strong>${money(b.potUsd ?? b.rewardAmount)}</strong> live pot</dd>
    ${b.entryFeeUsd ? `<dt>Entry fee</dt><dd>${money(b.entryFeeUsd)} — paid once, joins the pot</dd>` : ''}
    <dt>Deadline</dt><dd>${date(b.deadline)} · <span data-deadline="${esc(b.deadline)}">${timeLeft(b.deadline)}</span></dd>
    <dt>Status</dt><dd>${open ? 'Open — still taking entries' : 'Closed to entries'}</dd>
    <dt>Entries</dt><dd>${b.submissionCount}</dd>
    <dt>Category</dt><dd>${esc(b.category ?? '—')} · ${(b.skills ?? []).map(esc).join(', ')}</dd>
  </dl>
  ${rewardsTable(b)}
  <h2>About this bounty</h2>
  <div class="description">${paragraphs(b.description)}</div>
  <h2>Leaderboard — top 5</h2>
  ${top ? `<ol class="mini-board">${top}</ol><p><a href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">Full leaderboard →</a></p>`
    : `<p>No judged entries yet. <a href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">Leaderboard →</a></p>`}`;
}
