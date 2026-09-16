/** Wraps async route handlers so rejected promises reach the error middleware. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** 404 handler for unmatched routes. */
function notFound(req, res, next) {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  }
  res.status(404).render('error', { title: 'Page Not Found', message: 'The page you are looking for does not exist.', user: req.user });
}

/** Centralized error handler. Never leaks stack traces in production. */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }
  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);
  }

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  res.status(statusCode).render('error', { title: 'Something Went Wrong', message, user: req.user });
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { asyncHandler, notFound, errorHandler, AppError };
