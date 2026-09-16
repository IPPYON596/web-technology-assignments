const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();
router.use(requireAuth);

// POST /api/orders  { shippingAddress, paymentMethod }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod = 'card' } = req.body;
    if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.postalCode) {
      throw new AppError('A complete shipping address is required', 400);
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    if (!cart || cart.items.length === 0) throw new AppError('Your cart is empty', 400);

    // Verify stock and build snapshot line items
    const orderItems = [];
    for (const item of cart.items) {
      const book = item.book;
      if (!book) continue;
      if (book.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${book.title}"`, 400);
      }
      orderItems.push({ book: book._id, title: book.title, price: book.price, quantity: item.quantity });
    }
    if (orderItems.length === 0) throw new AppError('Your cart is empty', 400);

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Simulate payment processing (no real payment gateway integrated)
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      status: 'paid',
      shippingAddress,
      paymentMethod,
      paymentSimulated: true,
    });

    // Decrement stock
    await Promise.all(
      orderItems.map((i) => Book.findByIdAndUpdate(i.book, { $inc: { stock: -i.quantity } }))
    );

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  })
);

// GET /api/orders - current user's orders
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  })
);

// GET /api/orders/:id - single order (must belong to the requester unless admin)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404);
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized to view this order', 403);
    }
    res.status(200).json({ success: true, data: order });
  })
);

module.exports = router;
