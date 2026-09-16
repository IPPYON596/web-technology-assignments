const express = require('express');
const Book = require('../models/Book');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();
router.use(requireAuth, requireAdmin);

/* ---------- Books CRUD ---------- */

router.get(
  '/books',
  asyncHandler(async (req, res) => {
    const books = await Book.find().populate('category', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: books.length, data: books });
  })
);

router.post(
  '/books',
  asyncHandler(async (req, res) => {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, message: 'Book created', data: book });
  })
);

router.put(
  '/books/:id',
  asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) throw new AppError('Book not found', 404);
    res.status(200).json({ success: true, message: 'Book updated', data: book });
  })
);

router.delete(
  '/books/:id',
  asyncHandler(async (req, res) => {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) throw new AppError('Book not found', 404);
    res.status(200).json({ success: true, message: 'Book deleted' });
  })
);

/* ---------- Categories CRUD ---------- */

router.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  })
);

router.put(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) throw new AppError('Category not found', 404);
    res.status(200).json({ success: true, data: category });
  })
);

router.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw new AppError('Category not found', 404);
    res.status(200).json({ success: true, message: 'Category deleted' });
  })
);

/* ---------- Orders ---------- */

router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  })
);

router.put(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) throw new AppError('Order not found', 404);
    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  })
);

/* ---------- Users ---------- */

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  })
);

router.put(
  '/users/:id/toggle-active',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ success: true, message: 'User status updated', data: user });
  })
);

/* ---------- Dashboard summary ---------- */

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const [bookCount, userCount, orderCount, revenueAgg, lowStock] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Book.find({ stock: { $lte: 5 } }).select('title stock').limit(10),
    ]);
    res.status(200).json({
      success: true,
      data: {
        bookCount,
        userCount,
        orderCount,
        totalRevenue: revenueAgg[0]?.total || 0,
        lowStock,
      },
    });
  })
);

module.exports = router;
