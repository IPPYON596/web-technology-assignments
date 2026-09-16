const express = require('express');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();
router.use(requireAuth);

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

// GET /api/cart
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const cart = await (await getOrCreateCart(req.user._id)).populate('items.book');
    const total = cart.items.reduce((sum, item) => sum + (item.book?.price || 0) * item.quantity, 0);
    res.status(200).json({ success: true, data: cart, total });
  })
);

// POST /api/cart  { bookId, quantity }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { bookId, quantity = 1 } = req.body;
    const book = await Book.findById(bookId);
    if (!book) throw new AppError('Book not found', 404);
    if (book.stock < quantity) throw new AppError('Not enough stock available', 400);

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find((i) => i.book.toString() === bookId);
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ book: bookId, quantity: Number(quantity) });
    }
    await cart.save();
    await cart.populate('items.book');
    res.status(200).json({ success: true, message: 'Item added to cart', data: cart });
  })
);

// PUT /api/cart/:itemId  { quantity }
router.put(
  '/:itemId',
  asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) throw new AppError('Quantity must be at least 1', 400);

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.itemId);
    if (!item) throw new AppError('Cart item not found', 404);

    const book = await Book.findById(item.book);
    if (book && book.stock < quantity) throw new AppError('Not enough stock available', 400);

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate('items.book');
    res.status(200).json({ success: true, message: 'Cart updated', data: cart });
  })
);

// DELETE /api/cart/:itemId
router.delete(
  '/:itemId',
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate('items.book');
    res.status(200).json({ success: true, message: 'Item removed', data: cart });
  })
);

module.exports = router;
