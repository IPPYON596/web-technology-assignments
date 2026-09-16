// Shared behaviors used across every page: nav toggle + logout.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await api.post('/api/auth/logout');
      } finally {
        window.location.href = '/';
      }
    });
  }

  // Delegated "Add to Cart" handler works for any .add-to-cart-btn on the page
  document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;
    const bookId = btn.dataset.bookId;
    const quantity = Number(btn.dataset.quantity) || 1;
    btn.disabled = true;
    try {
      await api.post('/api/cart', { bookId, quantity });
      toast('Added to cart');
      refreshCartBadge();
    } catch (err) {
      if (err.status === 401) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      toast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });
});
