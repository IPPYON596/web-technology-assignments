require('./setup');
const request = require('supertest');
const app = require('../server');
const Category = require('../models/Category');
const Book = require('../models/Book');

async function registerAndLogin(agent, email = 'cartuser@example.com') {
  await agent.post('/api/auth/register').send({
    name: 'Cart User', email, password: 'Password123', confirmPassword: 'Password123',
  });
}

describe('Cart & Orders flow', () => {
  it('requires authentication to view the cart', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.statusCode).toBe(401);
  });

  it('allows a logged-in user to add items, checkout, and decrements stock', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    const category = await Category.create({ name: 'Sci-Fi', slug: 'sci-fi' });
    const book = await Book.create({ title: 'Mars Rising', author: 'X', isbn: '9789999999999', price: 10, stock: 3, category: category._id });

    const addRes = await agent.post('/api/cart').send({ bookId: book._id.toString(), quantity: 2 });
    expect(addRes.statusCode).toBe(200);
    expect(addRes.body.data.items.length).toBe(1);

    const orderRes = await agent.post('/api/orders').send({
      shippingAddress: { line1: '123 Main St', city: 'Springfield', state: 'IL', postalCode: '62701', country: 'USA' },
      paymentMethod: 'card',
    });
    expect(orderRes.statusCode).toBe(201);
    expect(orderRes.body.data.totalAmount).toBe(20);

    const updatedBook = await Book.findById(book._id);
    expect(updatedBook.stock).toBe(1);

    const cartRes = await agent.get('/api/cart');
    expect(cartRes.body.data.items.length).toBe(0);
  });

  it('rejects checkout when stock is insufficient', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent, 'lowstock@example.com');

    const category = await Category.create({ name: 'Fantasy', slug: 'fantasy' });
    const book = await Book.create({ title: 'Rare Tome', author: 'X', isbn: '9788888888888', price: 50, stock: 1, category: category._id });

    await agent.post('/api/cart').send({ bookId: book._id.toString(), quantity: 1 });
    // simulate stock running out after adding to cart
    await Book.findByIdAndUpdate(book._id, { stock: 0 });

    const orderRes = await agent.post('/api/orders').send({
      shippingAddress: { line1: '1 A St', city: 'Town', state: 'CA', postalCode: '90210', country: 'USA' },
    });
    expect(orderRes.statusCode).toBe(400);
  });
});
