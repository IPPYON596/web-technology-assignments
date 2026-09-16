require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const methodOverride = require('method-override');

const connectDB = require('./config/db');
const { attachUser } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const pageRoutes = require('./routes/pages');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

const app = express();

// Trust the first proxy (needed for secure cookies behind e.g. Heroku/Nginx)
app.set('trust proxy', 1);

/* ---------------------- Security & core middleware ---------------------- */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        scriptSrc: ["'self'", 'cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);
app.use(cors({ origin: process.env.BASE_URL || true, credentials: true }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(mongoSanitize()); // strips $ and . from user input to prevent NoSQL injection
app.use(xss()); // sanitizes user input from malicious HTML/JS (XSS protection)
app.use(hpp()); // protects against HTTP parameter pollution

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter limiter on auth endpoints to slow down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/* ---------------------------- View engine -------------------------------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ------------------------------ Static assets ----------------------------- */
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

/* --------------------------- Attach req.user ------------------------------ */
app.use(attachUser);

/* --------------------------------- Routes ---------------------------------- */
app.get('/health', (req, res) => res.status(200).json({ success: true, status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', pageRoutes);

/* ------------------------------ Error handling ----------------------------- */
app.use(notFound);
app.use(errorHandler);

/* ---------------------------------- Start ----------------------------------- */
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] BookNest running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  });
}

module.exports = app; // exported for supertest
