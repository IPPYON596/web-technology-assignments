/**
 * Seeds the database with an admin user, categories, and real-world bestsellers/featured books with accurate cover images and page counts.
 * Usage: npm run seed   (reads MONGO_URI and ADMIN_* from .env)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Book = require('../models/Book');
const Cart = require('../models/Cart');

const categories = [
  { name: 'Fiction', slug: 'fiction', description: 'Novels and literary fiction' },
  { name: 'Science Fiction', slug: 'sci-fi', description: 'Futuristic and speculative fiction' },
  { name: 'Fantasy', slug: 'fantasy', description: 'Magic, myth, and adventure' },
  { name: 'Mystery & Thriller', slug: 'mystery-thriller', description: 'Suspense and crime fiction' },
  { name: 'Non-Fiction', slug: 'non-fiction', description: 'Real-world topics and essays' },
  { name: 'Biography', slug: 'biography', description: 'Life stories of notable people' },
  { name: 'Self-Help', slug: 'self-help', description: 'Personal growth and productivity' },
  { name: 'Children', slug: 'children', description: 'Books for young readers' },
];

async function run() {
  await connectDB();
  console.log('[Seed] Clearing existing data...');
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Book.deleteMany({}), Cart.deleteMany({})]);

  console.log('[Seed] Creating categories...');
  const createdCategories = await Category.insertMany(categories);
  const byName = Object.fromEntries(createdCategories.map((c) => [c.name, c._id]));

  console.log('[Seed] Creating admin user...');
  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Site Admin',
    email: process.env.ADMIN_EMAIL || 'admin@bookstore.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
  });
  await Cart.create({ user: admin._id, items: [] });

  console.log('[Seed] Creating a demo customer...');
  const customer = await User.create({
    name: 'Jane Reader',
    email: 'jane@example.com',
    password: 'Customer@123',
    role: 'customer',
  });
  await Cart.create({ user: customer._id, items: [] });

  console.log('[Seed] Creating sample books with internet cover images and page counts...');
  const books = [
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      isbn: '9780735211292',
      category: byName['Self-Help'],
      price: 18.00,
      stock: 45,
      pages: 320,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
      publisher: 'Avery',
      publishedYear: 2018,
      isFeatured: true,
      isBestseller: true,
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving every day.',
    },
    {
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      isbn: '9780593135204',
      category: byName['Science Fiction'],
      price: 16.99,
      stock: 30,
      pages: 496,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg',
      publisher: 'Ballantine Books',
      publishedYear: 2021,
      isFeatured: true,
      isBestseller: true,
      description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.',
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '9780441172719',
      category: byName['Science Fiction'],
      price: 10.99,
      stock: 35,
      pages: 688,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
      publisher: 'Ace',
      publishedYear: 1965,
      isFeatured: true,
      isBestseller: true,
      description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides, who will lead a revolution on the hostile desert world.',
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '9780451524935',
      category: byName['Fiction'],
      price: 9.99,
      stock: 50,
      pages: 328,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
      publisher: 'Signet Classic',
      publishedYear: 1949,
      isFeatured: true,
      isBestseller: true,
      description: 'Winston Smith wrestles with oppression in Oceania, a place where the Party scrutinizes human action and independent thought.',
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '9780061120084',
      category: byName['Fiction'],
      price: 11.99,
      stock: 40,
      pages: 281,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
      publisher: 'Harper Perennial',
      publishedYear: 1960,
      isFeatured: true,
      isBestseller: true,
      description: 'Compassionate, dramatic, and deeply moving, To Kill a Mockingbird takes readers to the roots of human behavior.',
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '9780547928227',
      category: byName['Fantasy'],
      price: 12.99,
      stock: 30,
      pages: 304,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
      publisher: 'Mariner Books',
      publishedYear: 1937,
      isFeatured: true,
      isBestseller: true,
      description: 'Bilbo Baggins enjoys a comfortable, unambitious life, until Gandalf and a company of dwarves arrive on a quest to reclaim their mountain gold.',
    },
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      isbn: '9780857197689',
      category: byName['Self-Help'],
      price: 15.99,
      stock: 25,
      pages: 252,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
      publisher: 'Harriman House',
      publishedYear: 2020,
      isFeatured: true,
      isBestseller: true,
      description: 'Timeless lessons on wealth, greed, and happiness. Doing well with money isn’t necessarily about what you know. It’s about how you behave.',
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      isbn: '9780374533557',
      category: byName['Non-Fiction'],
      price: 17.50,
      stock: 20,
      pages: 499,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg',
      publisher: 'Farrar, Straus and Giroux',
      publishedYear: 2011,
      isFeatured: true,
      isBestseller: true,
      description: 'Kahneman takes us on a tour of the mind and explains the two systems that drive the way we think: System 1 (fast) and System 2 (slow).',
    },
    {
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      isbn: '9781250301697',
      category: byName['Mystery & Thriller'],
      price: 14.99,
      stock: 28,
      pages: 336,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg',
      publisher: 'Celadon Books',
      publishedYear: 2019,
      isFeatured: true,
      isBestseller: true,
      description: 'Alicia Berenson’s life is seemingly perfect. Then one evening she shoots her husband five times in the face, and never speaks another word.',
    },
    {
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      isbn: '9781451648539',
      category: byName['Biography'],
      price: 19.99,
      stock: 15,
      pages: 656,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg',
      publisher: 'Simon & Schuster',
      publishedYear: 2011,
      isFeatured: true,
      isBestseller: true,
      description: 'Based on forty interviews with Jobs conducted over two years, this is the definitive biography of the creative entrepreneur.',
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      category: byName['Non-Fiction'],
      price: 42.50,
      stock: 18,
      pages: 464,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
      publisher: 'Prentice Hall',
      publishedYear: 2008,
      isFeatured: true,
      isBestseller: false,
      description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    },
    {
      title: 'The Very Hungry Caterpillar',
      author: 'Eric Carle',
      isbn: '9780399226908',
      category: byName['Children'],
      price: 8.99,
      stock: 50,
      pages: 26,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780399226908-L.jpg',
      publisher: 'World of Eric Carle',
      publishedYear: 1969,
      isFeatured: true,
      isBestseller: true,
      description: 'A beautifully illustrated classic picture book following the life cycle of a hungry little caterpillar.',
    },
    {
      title: 'Harry Potter and the Sorcerer\'s Stone',
      author: 'J.K. Rowling',
      isbn: '9780590353427',
      category: byName['Fantasy'],
      price: 12.99,
      stock: 42,
      pages: 309,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg',
      publisher: 'Scholastic',
      publishedYear: 1997,
      isFeatured: true,
      isBestseller: true,
      description: 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive.',
    },
    {
      title: 'Lessons in Chemistry',
      author: 'Bonnie Garmus',
      isbn: '9780385547345',
      category: byName['Fiction'],
      price: 16.99,
      stock: 35,
      pages: 400,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780385547345-L.jpg',
      publisher: 'Doubleday',
      publishedYear: 2022,
      isFeatured: true,
      isBestseller: true,
      description: 'Chemist Elizabeth Zott is not your average woman. But it’s the early 1960s and her all-male team at Hastings Research Institute takes a very unscientific view of equality.',
    },
  ];

  const createdBooks = await Book.insertMany(books);
  // Give each seeded book a plausible starting rating
  await Promise.all(
    createdBooks.map((b) =>
      Book.findByIdAndUpdate(b._id, {
        rating: Math.round((4.2 + Math.random() * 0.7) * 10) / 10,
        ratingsCount: Math.floor(Math.random() * 150) + 25,
      })
    )
  );

  console.log('[Seed] Done! Populated real-world bestsellers and featured books with cover image links and page counts.');
  console.log(`  Admin login:    ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
  console.log(`  Customer login: jane@example.com / Customer@123`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
