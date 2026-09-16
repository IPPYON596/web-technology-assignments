const express = require('express');
const Book = require('../models/Book');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/books?search=&category=&minPrice=&maxPrice=&rating=&inStock=&sort=&page=&limit=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (rating) filter.rating = { $gte: Number(rating) };
    if (inStock === 'true') filter.stock = { $gt: 0 };

    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      newest: { createdAt: -1 },
      popularity: { ratingsCount: -1, rating: -1 },
    };
    const sortBy = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find(filter).populate('category', 'name slug').sort(sortBy).skip(skip).limit(limitNum),
      Book.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: books,
    });
  })
);

// GET /api/books/featured
router.get(
  '/featured',
  asyncHandler(async (req, res) => {
    const books = await Book.find({ isFeatured: true }).populate('category', 'name slug').limit(8);
    res.status(200).json({ success: true, data: books });
  })
);

// GET /api/books/categories
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  })
);

// GET /api/books/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id).populate('category', 'name slug');
    if (!book) throw new AppError('Book not found', 404);

    const reviews = await Review.find({ book: book._id }).populate('user', 'name').sort({ createdAt: -1 });
    const relatedBooks = await Book.find({ category: book.category, _id: { $ne: book._id } }).limit(4);

    res.status(200).json({ success: true, data: book, reviews, relatedBooks });
  })
);

module.exports = router;
