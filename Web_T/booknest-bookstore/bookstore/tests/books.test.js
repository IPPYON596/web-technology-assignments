require('./setup');
const request = require('supertest');
const app = require('../server');
const Category = require('../models/Category');
const Book = require('../models/Book');

async function seedOneBook(overrides = {}) {
  const category = await Category.create({ name: 'Fiction', slug: 'fiction' });
  const book = await Book.create({
    title: 'Test Driven Development',
    author: 'A. Author',
    isbn: '9781111111111',
    price: 20,
    stock: 5,
    category: category._id,
    ...overrides,
  });
  return { category, book };
}

describe('Books: GET /api/books', () => {
  it('returns paginated books', async () => {
    await seedOneBook();
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body).toHaveProperty('totalPages');
  });

  it('filters by category', async () => {
    const { category } = await seedOneBook();
    const res = await request(app).get(`/api/books?category=${category._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('filters out-of-stock items when inStock=true', async () => {
    await seedOneBook({ stock: 0, isbn: '9782222222222' });
    const res = await request(app).get('/api/books?inStock=true');
    expect(res.body.data.length).toBe(0);
  });
});

describe('Books: GET /api/books/:id', () => {
  it('returns a single book with reviews and related books', async () => {
    const { book } = await seedOneBook();
    const res = await request(app).get(`/api/books/${book._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Test Driven Development');
    expect(res.body.reviews).toEqual([]);
  });

  it('returns 404 for a non-existent book', async () => {
    const res = await request(app).get('/api/books/64b000000000000000000000');
    expect(res.statusCode).toBe(404);
  });
});
