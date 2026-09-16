const express = require('express');
const Review = require('../models/Review');
const Book = require('../models/Book');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

async function recalcRating(bookId) {
  const stats = await Review.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avgRating = 0, count = 0 } = stats[0] || {};
  await Book.findByIdAndUpdate(bookId, { rating: Math.round(avgRating * 10) / 10, ratingsCount: count });
}

// POST /api/reviews  { bookId, rating, comment }
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { bookId, rating, comment } = req.body;
    const book = await Book.findById(bookId);
    if (!book) throw new AppError('Book not found', 404);

    const existing = await Review.findOne({ user: req.user._id, book: bookId });
    if (existing) throw new AppError('You have already reviewed this book', 409);

    const review = await Review.create({ user: req.user._id, book: bookId, rating, comment });
    await recalcRating(book._id);

    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  })
);

// DELETE /api/reviews/:id
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw new AppError('Review not found', 404);
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized to delete this review', 403);
    }
    const bookId = review.book;
    await review.deleteOne();
    await recalcRating(bookId);
    res.status(200).json({ success: true, message: 'Review deleted' });
  })
);

module.exports = router;
