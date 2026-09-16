/**
 * Thin fetch wrapper shared by every page script.
 * Cookies (httpOnly JWT) are sent automatically via credentials: 'include'.
 */
const api = {
  async request(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) {
      const err = new Error(data.message || 'Something went wrong');
      err.status = res.status;
      throw err;
    }
    return data;
  },
  get(url) { return this.request('GET', url); },
  post(url, body) { return this.request('POST', url, body); },
  put(url, body) { return this.request('PUT', url, body); },
  delete(url) { return this.request('DELETE', url); },
};

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function stars(rating = 0) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function toast(message, type = 'success') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText =
      'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:999;padding:12px 20px;border-radius:8px;color:#fff;font-size:.9rem;box-shadow:0 4px 16px rgba(0,0,0,.2);transition:opacity .3s;';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.background = type === 'error' ? '#c62828' : '#2e7d32';
  el.style.opacity = '1';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.opacity = '0'; }, 2500);
}

async function refreshCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  try {
    const { data } = await api.get('/api/cart');
    const count = data.items.reduce((s, i) => s + i.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  } catch {
    badge.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', refreshCartBadge);
