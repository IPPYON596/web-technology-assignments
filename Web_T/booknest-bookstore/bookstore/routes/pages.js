const express = require('express');
const Book = require('../models/Book');
const Category = require('../models/Category');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Home page
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [featured, bestsellers, categories] = await Promise.all([
      Book.find({ isFeatured: true }).populate('category', 'name').limit(8),
      Book.find({ isBestseller: true }).populate('category', 'name').limit(8),
      Category.find().sort({ name: 1 }),
    ]);
    res.render('home', { title: 'Welcome to BookNest', user: req.user, featured, bestsellers, categories });
  })
);

// Register page
router.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('register', { title: 'Create an Account', user: req.user });
});

// Login page
router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('login', { title: 'Login', user: req.user, redirect: req.query.redirect || '/' });
});

// Catalogue page
router.get(
  '/catalogue',
  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    res.render('catalogue', { title: 'Book Catalogue', user: req.user, categories });
  })
);

// Book details page
router.get(
  '/books/:id',
  asyncHandler(async (req, res) => {
    res.render('book-details', { title: 'Book Details', user: req.user, bookId: req.params.id });
  })
);

// Cart page (requires login)
router.get('/cart', requireAuth, (req, res) => {
  res.render('cart', { title: 'Your Cart', user: req.user });
});

// Checkout page (requires login)
router.get('/checkout', requireAuth, (req, res) => {
  res.render('checkout', { title: 'Checkout', user: req.user });
});

// Profile page (requires login)
router.get('/profile', requireAuth, (req, res) => {
  res.render('profile', { title: 'My Profile', user: req.user });
});

// Admin dashboard (requires admin)
router.get('/admin', requireAuth, requireAdmin, (req, res) => {
  res.render('admin-dashboard', { title: 'Admin Dashboard', user: req.user });
});

module.exports = router;
