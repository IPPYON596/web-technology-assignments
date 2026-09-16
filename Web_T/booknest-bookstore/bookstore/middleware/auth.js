const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Reads the JWT from either the httpOnly cookie (used by the server-rendered
 * views) or the Authorization: Bearer header (used by pure API clients).
 */
function extractToken(req) {
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.split(' ')[1];
  return null;
}

/** Populates req.user if a valid token is present; never blocks the request. */
async function attachUser(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch (err) {
    // Invalid/expired token -> treat as guest, do not throw
  }
  next();
}

/** Requires a logged-in user. Responds with JSON for API calls, redirects for pages. */
function requireAuth(req, res, next) {
  if (req.user) return next();
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
}

/** Requires an admin role. */
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  return res.status(403).render('error', { title: 'Forbidden', message: 'Admin access required', user: req.user });
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = { attachUser, requireAuth, requireAdmin, signToken, extractToken };
