// An account's public profile: avatar, bio, wallet, record and entries.
// Loaded only on its route. Avatar images come from the API's own answers.
import { getProfile } from './api.js';
import { esc, money } from './format.js';

export async function profileView(handle) {
  const p = await getProfile(handle);
  document.title = `@${p.handle} | make.fun bounties`;
  const r = p.record ?? {};
  const sols = (p.solutions ?? []).map((s) => `
    <li><a href="#/bounty/${encodeURIComponent(s.competition?.slug ?? '')}">${esc(s.competition?.title ?? s.title ?? '')}</a>
    <span>${s.placement ? `placed #${s.placement}` : 'entered'}</span>
    <span>${s.prize_usd ? money(s.prize_usd) : ''}</span></li>`).join('');
  const wallet = p.wallet?.address ?? '';
  return `
  <p><a href="#/">← All bounties</a></p>
  <article class="profile">
    ${p.avatar?.url ? `<img class="avatar" src="https://make.fun${esc(p.avatar.url)}" crossorigin="anonymous" alt="" width="96" height="96">` : ''}
    <h1>@${esc(p.handle)}</h1>
    ${p.display_name ? `<p class="dim">${esc(p.display_name)}</p>` : ''}
    ${p.bio ? `<p>${esc(p.bio)}</p>` : ''}
    <dl class="facts">
      <dt>Entered</dt><dd>${r.competitions_entered ?? 0} bounties</dd>
      <dt>Placed</dt><dd>${r.competitions_placed ?? 0} · won ${r.competitions_won ?? 0} · best #${r.best_placement ?? '—'}</dd>
      <dt>Prizes</dt><dd>${money(r.prize_usd ?? 0)}</dd>
      ${wallet ? `<dt>Wallet</dt><dd><a href="${esc(p.wallet.explorer_url)}">${esc(wallet.slice(0, 8))}…${esc(wallet.slice(-4))}</a></dd>` : ''}
      <dt>Joined</dt><dd>${esc((p.joined_at ?? '').slice(0, 10))}</dd>
    </dl>
  </article>
  <h2>Entries</h2>
  ${sols ? `<ul class="sols">${sols}</ul>` : '<p>No public entries yet.</p>'}`;
}
