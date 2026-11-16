// make.fun public API, read-only GET, CORS open. Answers are cached in memory
// and revalidated with ETag / If-None-Match (the API's tags turn each minute),
// so a view re-visit costs one request at most, usually a 304 with no body.
const API = 'https://make.fun/api';
const cache = new Map(); // path -> {etag, data, at}
export const net = { requests: 0, cached: 0, revalidated: 0 };

async function get(path) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < 60000) { net.cached++; return hit.data; }
  net.requests++;
  const headers = {};
  if (hit?.etag) headers['If-None-Match'] = hit.etag;
  const res = await fetch(API + path, { headers });
  if (res.status === 304 && hit) { net.revalidated++; hit.at = Date.now(); return hit.data; }
  const data = await res.json();
  cache.set(path, { etag: res.headers.get('ETag'), data, at: Date.now() });
  return data;
}

export const getBoard = () => get('/competitions?status=open&activity=times&limit=100');
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
export const getSubmissions = (slug) => get(`/competitions/${encodeURIComponent(slug)}/submissions?limit=10`);
