// Small text and number helpers shared by every view. No network, no DOM.

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function moneyShort(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n >= 1000) return '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return '$' + n.toFixed(0);
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function timeLeft(iso, nowMs) {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return '—';
  const diff = end - (nowMs ?? Date.now());
  if (diff <= 0) return 'Closed';
  const mins = Math.floor(diff / 60000);
  const days = Math.floor(mins / 1440);
  if (days > 0) return days + 'd ' + Math.floor((mins % 1440) / 60) + 'h left';
  const hours = Math.floor(mins / 60);
  if (hours > 0) return hours + 'h ' + (mins % 60) + 'm left';
  return mins + 'm left';
}

export function stillOpen(iso, nowMs) {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return false;
  return end > (nowMs ?? Date.now());
}

export function pct(micro) {
  const n = Number(micro);
  if (!Number.isFinite(n)) return '—';
  return (n / 10000).toFixed(2) + '%';
}

export function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('en-US') : '—';
}
