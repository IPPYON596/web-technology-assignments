require('./setup');
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth: POST /api/auth/register', () => {
  it('registers a new user with a hashed password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.password).toBeUndefined();

    const stored = await User.findOne({ email: 'test@example.com' }).select('+password');
    expect(stored.password).not.toBe('Password123');
  });

  it('rejects registration with mismatched passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test2@example.com',
      password: 'Password123',
      confirmPassword: 'Different123',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'First',
      email: 'dupe@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Second',
      email: 'dupe@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    expect(res.statusCode).toBe(409);
  });
});

describe('Auth: POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
  });

  it('logs in with correct credentials and sets a cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'Password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'WrongPass1' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects login for a non-existent user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nouser@example.com', password: 'Password123' });
    expect(res.statusCode).toBe(401);
  });
});
