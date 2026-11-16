// Public profile, loaded lazily. Avatar, bio, wallet with its Solscan link,
// record stats and the account's entries with placements and prizes.

import { publicProfile } from './api.js';
import { esc, money, fmtDate, num } from './format.js';

export async function renderProfile(root, handle) {
  root.innerHTML = '<p class="empty">Loading profile…</p>';
  const p = await publicProfile(handle);
  const rec = p.record || {};
  const name = p.display_name || p.handle;
  const avatar = p.image || p.avatar;
  const wallet = p.wallet || {};
  const sols = Array.isArray(p.solutions) ? p.solutions : [];
  const rows = sols.map((s) => {
    const c = s.competition || {};
    const place = s.placement === null || s.placement === undefined ? '—' : '#' + num(s.placement);
    const prize = s.prize_usd === null || s.prize_usd === undefined ? '—' : money(s.prize_usd);
    return '<tr><td><a href="#/bounty/' + esc(c.slug || '') + '">' + esc(c.title || s.title || '') + '</a></td>'
      + '<td>' + esc(s.title || '') + '</td>'
      + '<td>' + place + '</td><td>' + prize + '</td>'
      + '<td>' + esc(fmtDate(s.entered_at)) + '</td></tr>';
  }).join('');
  root.innerHTML = '<article class="profile">'
    + '<p class="crumbs"><a href="#/">Board</a> / Profile</p>'
    + '<div class="who">'
    + (avatar ? '<img class="avatar" crossorigin="anonymous" src="' + esc(avatar) + '" alt="Avatar of ' + esc(name) + '">' : '')
    + '<div><h1>' + esc(name) + '</h1><p class="handle">@' + esc(p.handle) + '</p>'
    + (p.bio ? '<p class="bio">' + esc(p.bio) + '</p>' : '<p class="bio">No bio yet.</p>')
    + (p.github_login ? '<p>GitHub: ' + esc(p.github_login) + '</p>' : '')
    + '<p>Joined ' + esc(fmtDate(p.joined_at)) + '</p></div></div>'
    + (wallet.address ? '<p class="wallet">Wallet <code>' + esc(wallet.address) + '</code> '
      + (wallet.explorer_url ? '<a href="' + esc(wallet.explorer_url) + '">View on Solscan</a>' : '') + '</p>' : '')
    + '<dl class="facts">'
    + '<div><dt>Entered</dt><dd>' + num(rec.competitions_entered) + '</dd></div>'
    + '<div><dt>Placed</dt><dd>' + num(rec.competitions_placed) + '</dd></div>'
    + '<div><dt>Won</dt><dd>' + num(rec.competitions_won) + '</dd></div>'
    + '<div><dt>Podiums</dt><dd>' + num(rec.podium_finishes) + '</dd></div>'
    + '<div><dt>Best place</dt><dd>' + (rec.best_placement === null || rec.best_placement === undefined ? '—' : '#' + num(rec.best_placement)) + '</dd></div>'
    + '<div><dt>Total prizes</dt><dd>' + money(rec.prize_usd) + '</dd></div>'
    + '</dl>'
    + '<h2>Entries</h2>'
    + (rows ? '<table class="board-table"><thead><tr><th>Bounty</th><th>Entry</th><th>Place</th><th>Prize</th><th>Entered</th></tr></thead><tbody>' + rows + '</tbody></table>'
      : '<p class="empty">No entries yet.</p>')
    + '</article>';
  const img = root.querySelector('.avatar');
  if (img) {
    img.addEventListener('error', () => {
      const fallback = document.createElement('span');
      fallback.className = 'avatar avatar-fallback';
      fallback.textContent = (name || '?').slice(0, 1).toUpperCase();
      fallback.setAttribute('aria-hidden', 'true');
      img.replaceWith(fallback);
    });
  }
}
