// Bounty page, loaded lazily. Summary, facts, the live rewards table split
// into base prize plus entry-fee share, the description, and a top-5
// leaderboard preview linking to the full table.

import { bountyDetail, bountyLeaderboard } from './api.js';
import { esc, money, fmtDate, timeLeft, stillOpen, num, pct } from './format.js';

function rewardRows(b) {
  const rows = Array.isArray(b.rewardsNow) ? b.rewardsNow : [];
  if (!rows.length) return '<p class="empty">No reward split published yet.</p>';
  return '<table class="rewards"><thead><tr><th>Place</th><th>Base prize</th><th>Fee share</th><th>Total now</th></tr></thead><tbody>'
    + rows.map((r) => '<tr><td>' + esc(r.place) + '</td><td>' + money(r.baseUsd) + '</td><td>' + money(r.feeShareUsd) + '</td><td><strong>' + money(r.amountUsd) + '</strong></td></tr>').join('')
    + '</tbody></table>';
}

function previewRows(board) {
  const entries = Array.isArray(board.entries) ? board.entries.slice(0, 5) : [];
  if (!entries.length) return '<p class="empty">No entries ranked yet.</p>';
  return '<ol class="preview">'
    + entries.map((e) => '<li><a href="#/profile/' + esc(e.handle) + '">' + esc(e.handle) + '</a>'
      + ' — ' + esc(e.title || '') + ' · ' + pct(e.values && e.values.judge) + ' win rate</li>').join('')
    + '</ol>';
}

export async function renderBounty(root, slug) {
  root.innerHTML = '<p class="empty">Loading bounty…</p>';
  const b = await bountyDetail(slug);
  const open = stillOpen(b.deadline);
  const fee = b.entryFeeUsd === null || b.entryFeeUsd === undefined ? 'Free to enter' : money(b.entryFeeUsd) + ' entry fee';
  const skills = (b.skills || []).map((s) => '<li>' + esc(s) + '</li>').join('');
  const desc = String(b.description || '').split(/\n{2,}/).map((p) => '<p>' + esc(p).replaceAll('\n', '<br>') + '</p>').join('');
  let preview = '';
  try {
    preview = previewRows(await bountyLeaderboard(slug));
  } catch {
    preview = '<p class="empty">Leaderboard not available right now.</p>';
  }
  root.innerHTML = '<article class="bounty">'
    + '<p class="crumbs"><a href="#/">Board</a> / ' + esc(b.category || '') + '</p>'
    + '<h1>' + esc(b.title) + '</h1>'
    + '<p class="summary">' + esc(b.summary || '') + '</p>'
    + '<dl class="facts">'
    + '<div><dt>Live pot</dt><dd><strong>' + money(b.potUsd ?? b.rewardAmount) + '</strong></dd></div>'
    + '<div><dt>Entry fee</dt><dd>' + esc(fee) + '</dd></div>'
    + '<div><dt>Deadline</dt><dd>' + esc(fmtDate(b.deadline)) + ' (<span data-deadline="' + esc(b.deadline) + '">' + esc(timeLeft(b.deadline)) + '</span>)</dd></div>'
    + '<div><dt>Status</dt><dd class="' + (open ? 'open' : 'closed') + '">' + (open ? 'Open — still takes entries' : 'Closed — past deadline') + '</dd></div>'
    + '<div><dt>Entries</dt><dd>' + num(b.submissionCount) + '</dd></div>'
    + '<div><dt>Category</dt><dd>' + esc(b.category || '—') + '</dd></div>'
    + '</dl>'
    + (skills ? '<ul class="tags">' + skills + '</ul>' : '')
    + '<h2>Rewards</h2>' + rewardRows(b)
    + '<h2>About this bounty</h2><div class="desc">' + desc + '</div>'
    + '<h2>Top 5</h2>' + preview
    + '<p><a href="#/bounty/' + esc(b.slug) + '/leaderboard">Full leaderboard →</a></p>'
    + '</article>';
}
