// Read-only client for the public make.fun API.
// One GET per path, cached in memory for 60 seconds and revalidated with
// ETag / If-None-Match, so a second view of the same data costs no download
// when nothing changed (a 304 answers inside the same minute).

export const API_BASE = 'https://make.fun/api';

export const apiStats = { requests: 0, cached: 0, revalidated: 0 };

const cache = new Map();

export async function getJson(path) {
  const now = Date.now();
  const hit = cache.get(path);
  if (hit && now - hit.at < 60000) {
    apiStats.cached += 1;
    return hit.data;
  }
  const headers = { Accept: 'application/json' };
  if (hit && hit.etag) headers['If-None-Match'] = hit.etag;
  apiStats.requests += 1;
  const res = await fetch(API_BASE + path, { headers });
  if (res.status === 304 && hit) {
    apiStats.revalidated += 1;
    hit.at = Date.now();
    return hit.data;
  }
  if (!res.ok) throw new Error('make.fun API ' + res.status + ' for ' + path);
  const data = await res.json();
  const etag = res.headers.get('ETag');
  cache.set(path, { data, etag, at: Date.now() });
  return data;
}

export function boardList() {
  return getJson('/competitions');
}

export function bountyDetail(slug) {
  return getJson('/competitions/' + encodeURIComponent(slug));
}

export function bountyLeaderboard(slug) {
  return getJson('/competitions/' + encodeURIComponent(slug) + '/leaderboard');
}

export function publicProfile(handle) {
  return getJson('/profiles/' + encodeURIComponent(handle));
}
