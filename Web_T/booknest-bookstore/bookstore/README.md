# 📚 BookNest — Online Bookstore

A complete, production-ready, mobile-first responsive online bookstore built with **Node.js, Express, MongoDB (Mongoose), and EJS**.

---

## 1. Database Choice & Justification

**Chosen database: MongoDB (via Mongoose ODM).**

Reasons:

1. **Natural fit for the domain.** Books have variable, semi-structured attributes (description length, optional publisher/pages/language, growing review arrays). MongoDB's flexible document model avoids the sparse-column problem a rigid SQL schema would create, while Mongoose schemas still give us validation, types, and required fields — so we keep structure without losing flexibility.
2. **JS-native development.** Since the backend, frontend logic, and database driver are all JavaScript/JSON, there's no object-relational impedance mismatch — a `Book` document maps 1:1 to the JSON the API returns and the JS the browser consumes.
3. **Read-heavy, denormalized-friendly workload.** A bookstore catalogue is read-heavy (browsing, searching, filtering). MongoDB's document model lets us embed cart items and order line-item snapshots directly, minimizing joins for the most common queries (`GET /api/books`, `GET /api/cart`, `GET /api/orders`).
4. **Built-in text search & indexing.** Mongoose text indexes (`$text`) give us title/author/ISBN search out of the box, plus compound indexes for category/price/date sorting — no separate search engine required for this scope.
5. **Horizontal scalability.** MongoDB shards natively, which matters if the catalogue or order volume grows well beyond what a single SQL instance handles comfortably.

Trade-off acknowledged: MongoDB doesn't enforce foreign-key constraints or multi-document ACID transactions as natively as a relational database. We mitigate this by:
- Using Mongoose `required`/`ref` validation for referential integrity at the application layer.
- Snapshotting price/title into `OrderItem` at purchase time (so historical orders remain accurate even if a book's price changes later) — this is standard e-commerce practice regardless of database choice.
- Keeping the cart→order transition (stock check, decrement, clear cart) inside a single request handler with sequential awaits; a production deployment handling high concurrency would wrap this in a MongoDB multi-document transaction (`mongoose.startSession()`), which the code is structured to make an easy addition (see `routes/orders.js`).

*(MySQL/Oracle scripts were not chosen for this build, but the ER design in Section 4 below is drawn so it could be translated 1:1 into normalized SQL tables if the project's database were swapped later.)*

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Backend | Node.js 18+, Express.js 4 |
| Database | MongoDB 6+, Mongoose 8 (ODM) |
| Frontend | Server-rendered EJS + vanilla JS (fetch-based SPA-like interactivity per page), custom mobile-first CSS |
| Auth | JWT stored in an httpOnly cookie, bcrypt password hashing (12 salt rounds) |
| Security | Helmet, CORS, express-mongo-sanitize, xss-clean, hpp, express-rate-limit |
| Testing | Jest + Supertest + mongodb-memory-server (no external DB needed to run tests) |

---

## 3. Folder Structure

```
bookstore/
├── server.js                 # App entry point, middleware wiring
├── package.json
├── .env.example               # Copy to .env and fill in secrets
├── config/
│   └── db.js                  # Mongoose connection
├── models/                    # Mongoose schemas
│   ├── User.js
│   ├── Book.js
│   ├── Category.js
│   ├── Cart.js
│   ├── Order.js
│   └── Review.js
├── middleware/
│   ├── auth.js                 # JWT verification, requireAuth, requireAdmin
│   └── errorHandler.js         # asyncHandler wrapper, centralized error responses
├── routes/
│   ├── pages.js                 # Server-rendered page routes (/, /login, /cart, ...)
│   ├── auth.js                  # /api/auth/*
│   ├── books.js                 # /api/books/*
│   ├── cart.js                  # /api/cart/*
│   ├── orders.js                # /api/orders/*
│   ├── reviews.js                # /api/reviews/*
│   └── admin.js                  # /api/admin/*
├── views/                      # EJS templates (all mobile-first responsive)
│   ├── partials/ (header, footer, book-card)
│   ├── home.ejs, login.ejs, register.ejs, catalogue.ejs,
│   ├── book-details.ejs, cart.ejs, checkout.ejs, profile.ejs,
│   ├── admin-dashboard.ejs, error.ejs
├── public/
│   ├── css/style.css            # Mobile-first responsive stylesheet
│   ├── js/api.js, main.js       # Shared fetch client + UI behavior
│   └── images/book-placeholder.svg
├── seed/
│   └── seed.js                  # Seeds admin user, categories, sample books
└── tests/
    ├── setup.js                  # In-memory MongoDB for isolated test runs
    ├── auth.test.js
    ├── books.test.js
    └── cart.test.js
```

---

## 4. Database Schema (Collections)

**Users** — `name, email (unique), password (hashed), role [customer|admin], address, phone, isActive, timestamps`
Index: `email` (unique)

**Categories** — `name (unique), slug (unique), description`

**Books** — `title, author, isbn (unique), description, price, category (ref Category), stock, coverImage, rating, ratingsCount, isFeatured, isBestseller, publishedYear, publisher, language, pages`
Indexes: text index on `title/author/isbn`; `category`; `price`; `createdAt`

**Cart** — one document per user: `user (ref, unique), items: [{ book (ref), quantity }]`

**Orders** — `user (ref), items: [{ book (ref), title, price, quantity }]` (title/price are snapshots at purchase time), `totalAmount, status [pending|paid|shipped|delivered|cancelled], shippingAddress {...}, paymentMethod, paymentSimulated`
Index: `user + createdAt`

**Reviews** — `user (ref), book (ref), rating (1-5), comment`
Index: `user + book` (unique — one review per user per book)

**Relationships:** Book → Category (many-to-one) · Cart/Order → User (many-to-one) · Order.items/Cart.items → Book (many-to-one) · Review → User + Book (many-to-one each)

---

## 5. API Endpoints

All responses are JSON: `{ success, message?, data?, ... }`. Protected routes require the `token` httpOnly cookie (set automatically on login/register) or an `Authorization: Bearer <token>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account (validates email/password, hashes password, auto-logs-in) |
| POST | `/api/auth/login` | Public | Login, sets JWT cookie |
| POST | `/api/auth/logout` | Public | Clears auth cookie |
| GET | `/api/auth/me` | Auth | Current user profile |
| GET | `/api/books` | Public | List books — query: `search, category, minPrice, maxPrice, rating, inStock, sort, page, limit` |
| GET | `/api/books/featured` | Public | Featured books |
| GET | `/api/books/categories` | Public | All categories |
| GET | `/api/books/:id` | Public | Book detail + reviews + related books |
| GET | `/api/cart` | Auth | Current user's cart |
| POST | `/api/cart` | Auth | Add item `{ bookId, quantity }` |
| PUT | `/api/cart/:itemId` | Auth | Update quantity `{ quantity }` |
| DELETE | `/api/cart/:itemId` | Auth | Remove item |
| POST | `/api/orders` | Auth | Place order from cart `{ shippingAddress, paymentMethod }` (simulated payment) |
| GET | `/api/orders` | Auth | Current user's order history |
| GET | `/api/orders/:id` | Auth | Single order (owner or admin) |
| POST | `/api/reviews` | Auth | Add review `{ bookId, rating, comment }` |
| DELETE | `/api/reviews/:id` | Auth | Delete own review (or any, if admin) |
| GET/POST/PUT/DELETE | `/api/admin/books[/:id]` | Admin | Book CRUD |
| GET/POST/PUT/DELETE | `/api/admin/categories[/:id]` | Admin | Category CRUD |
| GET | `/api/admin/orders` | Admin | All orders |
| PUT | `/api/admin/orders/:id/status` | Admin | Update order status |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/toggle-active` | Admin | Enable/disable a user |
| GET | `/api/admin/summary` | Admin | Dashboard stats (book/user/order counts, revenue, low stock) |

### Page routes (server-rendered)
`/`, `/login`, `/register`, `/catalogue`, `/books/:id`, `/cart` (auth), `/checkout` (auth), `/profile` (auth), `/admin` (admin)

---

## 6. Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

### Steps

```bash
# 1. Install dependencies
cd bookstore
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env: set MONGO_URI, JWT_SECRET, SESSION_SECRET, ADMIN_EMAIL/PASSWORD

# 3. Seed the database (creates an admin user, demo customer, categories, and sample books)
npm run seed

# 4. Run the app
npm start          # production
npm run dev         # auto-restart on changes (nodemon)

# App runs at http://localhost:3000
```

**Seeded logins** (from `npm run seed`, using your `.env` values):
- Admin: `admin@bookstore.com` / `Admin@12345`
- Customer: `jane@example.com` / `Customer@123`

### Running tests
```bash
npm test
```
Tests spin up an in-memory MongoDB instance (`mongodb-memory-server`), so no external database is required to run the suite. Covers registration/login validation and password hashing, catalogue filtering, and the full cart → checkout → stock-decrement flow, including insufficient-stock rejection.

---

## 7. Security Measures Implemented

- Passwords hashed with **bcrypt** (12 salt rounds); hashes never serialize into JSON responses.
- **JWT** in an httpOnly, sameSite cookie (not readable by JS — mitigates XSS token theft); `secure` flag auto-enabled in production.
- **Helmet** for secure HTTP headers + a Content-Security-Policy.
- **express-mongo-sanitize** strips `$`/`.` operators from user input to prevent NoSQL injection.
- **xss-clean** sanitizes request bodies against script injection.
- **hpp** guards against HTTP parameter pollution.
- **express-rate-limit**: global API limiter + a stricter limiter on `/api/auth/login` and `/api/auth/register` to slow brute-force attempts.
- Server-side validation via **express-validator** on registration/login (mirrors the client-side checks, since client validation alone is never sufficient).
- Role-based access control (`requireAuth`, `requireAdmin` middleware) enforced on every cart/order/admin route — not just hidden in the UI.
- Centralized error handler normalizes Mongoose validation/cast/duplicate-key errors into safe, consistent JSON without leaking stack traces outside development.

## 8. Accessibility & SEO

- Semantic HTML5 (`header`, `main`, `nav`, `footer`, `article`, `dl`), skip-to-content link, `aria-label`/`aria-expanded` on the mobile nav toggle.
- All images use descriptive `alt` text; form inputs are paired with `<label for>`.
- Touch targets sized ≥44px (buttons, inputs) for mobile usability.
- Meta description tag, clean semantic URLs (`/books/:id`, `/catalogue?category=...`).

## 9. Responsiveness

Every view uses the shared mobile-first stylesheet (`public/css/style.css`): a fluid `container`, a CSS-grid book catalogue that scales from 2 columns (320px) → 3 (576px) → 4 (992px+), a collapsible hamburger nav below 768px, and a single-column → two-column layout switch on catalogue/checkout/book-detail pages at wider breakpoints.

## 10. Known Simplifications (documented, not hidden)

This is a learning/demo-scope deliverable, so a few things are intentionally simplified and called out rather than silently glossed over:
- **Payments are simulated** — no real payment gateway (Stripe/PayPal) is integrated; orders are marked `paid` immediately. Swapping in a real gateway means replacing the `paymentSimulated` block in `routes/orders.js`.
- **Password reset via email** is not wired up (the "Forgot Password" link shows a message rather than sending an email) — the `User` model already has `passwordResetToken`/`passwordResetExpires` fields ready for that feature.
- **Profile editing** (name/phone) is UI-only in this build; wiring it to `PATCH /api/users/me` is a small, isolated addition.
- **Image uploads**: books use a `coverImage` URL string rather than a file-upload pipeline; `multer` is included in `package.json` for when that's added.
- **Cart→order stock decrement** is sequential rather than wrapped in a MongoDB transaction — fine at this project's scale, but noted in Section 1 as the first thing to harden for high concurrency.

## 11. Architecture Diagram (text form)

```
[Browser] --(HTML pages + fetch calls)--> [Express Server]
                                              |
                    ┌─────────────────────────┼─────────────────────────┐
                    |                          |                          |
             [pages.js routes]          [/api/* routes]            [static assets]
             (EJS server-render)     (auth/books/cart/orders/       (css/js/images)
                    |                  reviews/admin — JSON)
                    |                          |
                    └───────────┬──────────────┘
                                 |
                     [middleware: attachUser (JWT),
                      requireAuth, requireAdmin,
                      errorHandler]
                                 |
                          [Mongoose Models]
                                 |
                            [MongoDB]
```
