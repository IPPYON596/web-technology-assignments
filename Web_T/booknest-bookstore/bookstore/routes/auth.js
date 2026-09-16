const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { signToken } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: Number(process.env.COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000,
};

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain a letter'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

const loginValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

function handleValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map((e) => e.msg).join(', ');
    throw new AppError(msg, 400);
  }
}

// POST /api/auth/register
router.post(
  '/register',
  registerValidators,
  asyncHandler(async (req, res) => {
    handleValidation(req);
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new AppError('An account with this email already exists', 409);

    const user = await User.create({ name, email, password });
    await Cart.create({ user: user._id, items: [] });

    const token = signToken(user);
    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({ success: true, message: 'Registration successful', token, user });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  loginValidators,
  asyncHandler(async (req, res) => {
    handleValidation(req);
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    if (!user.isActive) throw new AppError('This account has been deactivated', 403);

    const token = signToken(user);
    const cookieOpts = { ...COOKIE_OPTS };
    if (!rememberMe) delete cookieOpts.maxAge; // session cookie if "remember me" not checked

    res.cookie('token', token, cookieOpts);
    res.status(200).json({ success: true, message: 'Login successful', token, user });
  })
);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out' });
});

// GET /api/auth/me
router.get(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.user) throw new AppError('Not authenticated', 401);
    res.status(200).json({ success: true, user: req.user });
  })
);

module.exports = router;
