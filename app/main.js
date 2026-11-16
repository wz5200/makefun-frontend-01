// Hash router and shell wiring. Board, api and format load first; the bounty,
// leaderboard and profile views load lazily on their first visit, so the first
// load stays small. Countdowns refresh in place every 30 seconds.

import { apiStats } from './api.js';
import { timeLeft } from './format.js';
import { renderBoard, focusBoardSearch, clearBoardSearch } from './board.js';

const view = document.querySelector('#view');

function showCounters() {
  const set = (id, value) => {
    const el = document.querySelector(id);
    if (el) el.textContent = String(value);
  };
  set('#api-requests', apiStats.requests);
  set('#api-cached', apiStats.cached);
  set('#api-revalidated', apiStats.revalidated);
}

function tickCountdowns() {
  document.querySelectorAll('[data-deadline]').forEach((el) => {
    el.textContent = timeLeft(el.getAttribute('data-deadline'));
  });
}

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const parts = pathPart.split('/').filter((p) => p !== '');
  return { parts, params: new URLSearchParams(queryPart || '') };
}

function notFound(message) {
  view.innerHTML = '<p class="empty">' + message + '</p>'
    + '<p><a href="#/">Back to the board</a></p>';
}

async function route() {
  window.__shotReady = false;
  const { parts, params } = parseHash();
  try {
    if (parts.length === 0) {
      await renderBoard(view, params);
    } else if (parts[0] === 'bounty' && parts[1] && parts.length === 2) {
      const mod = await import('./bounty.js');
      await mod.renderBounty(view, parts[1]);
    } else if (parts[0] === 'bounty' && parts[1] && parts[2] === 'leaderboard') {
      const mod = await import('./leaderboard.js');
      await mod.renderLeaderboard(view, parts[1]);
    } else if (parts[0] === 'profile' && parts[1]) {
      const mod = await import('./profile.js');
      await mod.renderProfile(view, parts[1]);
    } else {
      notFound('That page does not exist here.');
    }
  } catch (err) {
    view.innerHTML = '<p class="empty">Could not load this page: ' + String(err.message || err) + '</p>'
      + '<p><a href="#/">Back to the board</a></p>';
  }
  showCounters();
  window.__shotReady = true;
}

window.addEventListener('hashchange', route);

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement
      && document.activeElement.tagName !== 'INPUT'
      && document.activeElement.tagName !== 'TEXTAREA'
      && document.activeElement.tagName !== 'SELECT') {
    event.preventDefault();
    focusBoardSearch();
  }
  if (event.key === 'Escape' && clearBoardSearch()) event.preventDefault();
});

setInterval(tickCountdowns, 30000);
route();
