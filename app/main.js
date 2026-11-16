// make.fun frontend: board, bounty page, leaderboard and profile on hash routes.
//   #/                          the board
//   #/bounty/<slug>             one bounty (+ its leaderboard preview)
//   #/bounty/<slug>/leaderboard its full leaderboard
//   #/profile/<handle>          an account's public profile
// Bounty, leaderboard and profile views load only when visited (import()),
// so the first load is the board alone. window.__shotReady is false while a
// route loads and true once its data is on screen, for screenshot scripts.
import { getBoard, net } from './api.js';
import { board, wireBoard } from './board.js';
import { timeLeft } from './format.js';

const app = document.getElementById('app');
const foot = document.getElementById('net');

function showNet() {
  foot.textContent = `API requests this visit: ${net.requests} · served from cache: ${net.cached} · revalidated (304): ${net.revalidated}`;
}

function parseQuery() {
  const q = {};
  for (const [k, v] of new URLSearchParams(location.hash.split('?')[1] ?? '')) q[k] = v;
  return q;
}

/** Refresh every countdown on screen in place, without rebuilding the page. */
setInterval(() => {
  document.querySelectorAll('[data-deadline]').forEach((el) => { el.textContent = timeLeft(el.dataset.deadline); });
}, 30000);

async function render() {
  window.__shotReady = false;
  app.innerHTML = '<p class="loading" role="status">Loading…</p>';
  const [path] = location.hash.replace(/^#/, '').split('?');
  try {
    const bounty = path.match(/^\/bounty\/([^/]+)(\/leaderboard)?$/);
    const profile = path.match(/^\/profile\/([^/]+)$/);
    if (bounty) {
      const slug = decodeURIComponent(bounty[1]);
      if (bounty[2]) {
        const { leaderboardView } = await import('./leaderboard.js');
        app.innerHTML = await leaderboardView(slug);
      } else {
        const { bountyView } = await import('./bounty.js');
        app.innerHTML = await bountyView(slug);
      }
    } else if (profile) {
      const { profileView } = await import('./profile.js');
      app.innerHTML = await profileView(decodeURIComponent(profile[1]));
    } else {
      const q = parseQuery();
      const data = await getBoard();
      app.innerHTML = board(data, { q: q.q ?? '', sort: q.sort ?? 'deadline', ending: q.ending === '1' });
      wireBoard(app, data);
    }
  } catch (err) {
    app.innerHTML = `<p role="alert">Could not load live data from make.fun (${err.message}). <a href="#/">Back to the board</a></p>`;
  }
  showNet();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
