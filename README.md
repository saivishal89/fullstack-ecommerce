# 🛍️ AURA — Modern Full-Stack E-Commerce Platform

A production-grade, end-to-end full-stack e-commerce web application engineered with TypeScript, React 18, Vite, Tailwind CSS, Node.js, Express, and Prisma ORM.

---

## 🌟 Key Features

- **Storefront & Public Catalog:**
  - Modern responsive UI with faceted filtering (category, brand, price slider, minimum rating, stock availability).
  - Debounced real-time catalog search and multi-option sorting.
  - Interactive product detail view with image galleries, variant selection, real customer reviews, and related products carousel.
- **Cart & Wishlist Architecture:**
  - Database-persisted shopping cart with quantity stepping and variant tracking.
  - Slide-over quick cart drawer with subtotal computation.
  - Heart-toggle wishlist with one-click transfer to cart.
- **Checkout & Financial Security:**
  - Multi-step checkout pipeline: Address Selector/Creator → Shipping Method → Order Review → Payment.
  - **Server-Side Price Calculation:** The backend strictly recalculates product prices, discounts, shipping, and taxes directly from the database; never trusts client-provided amounts.
  - **Coupon Engine:** Validates minimum order spend, expiry date, per-user usage limits (`UserCoupon`), and total redemption caps.
  - **Address Snapshots:** Freezes full shipping address onto the order record at placement time to prevent post-order address modification side effects.
  - **Inventory Safety:** Deducts stock atomically inside database transactions upon order confirmation with zero overselling risk.
  - **Payment Integration:** Stripe webhook support with raw body verification (`express.raw`), plus a developer payment simulator strictly disabled in production (`NODE_ENV === 'production'`).
- **Account & Order Management:**
  - User profiles with default address manager and order history.
  - Visual **Order Timeline (`OrderStatusHistory`)** showing full fulfillment progress from `PENDING` to `DELIVERED`.
- **Comprehensive Admin Console (`/admin`):**
  - **Live Database Analytics:** Real-time revenue aggregation from paid orders, total user count, active product count, low stock warnings, and revenue breakdown by category.
  - **Product Catalog Management:** Add/edit products with variants and specifications, and perform **safe soft-deletes** (`isActive = false`) to preserve order history referential integrity.
  - **Order Operations:** Filter orders by fulfillment status, inspect item contents, update statuses, and log custom timeline notes with shipping tracking numbers.
  - **User & Role Administration:** Promote users to admin or revoke permissions, with active/suspend account toggles.
  - **Security Audit Logs:** Structured JSON audit trail tracking operator actions, target entities, and timestamps.

---

## 🏗️ Architecture & Monorepo Structure

```
├── client/          # React 18 + Vite + Tailwind CSS + Lucide + Zustand + Axios
│   ├── src/
│   │   ├── api/          # Centralized Axios client & API service endpoints
│   │   ├── components/   # UI components (Cart, Navbar, Footer, Product, Common)
│   │   ├── layouts/      # MainLayout (Storefront) & AdminLayout (Admin Console)
│   │   ├── pages/        # Storefront pages, Account views, Admin views
│   │   └── store/        # Zustand state stores (Auth, Cart, Wishlist, Toast)
│   └── package.json
│
├── server/          # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/       # Prisma client singleton & environment configuration
│   │   ├── controllers/  # Auth, User, Product, Cart, Wishlist, Order, Payment, Admin
│   │   ├── middleware/   # JWT auth guard, Admin role guard, Rate limiter, Error handler
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Core domain business logic & Prisma queries
│   │   ├── utils/        # AppError, token generation, password hashing
│   │   ├── validators/   # Zod validation schemas
│   │   ├── __tests__/    # Automated integration test suite (21/21 passing tests)
│   │   └── server.ts     # Express server entry point & raw body Stripe webhook mount
│   └── package.json
│
├── database/        # Prisma ORM, migrations, and seeds
│   ├── prisma/
│   │   ├── schema.prisma            # Active SQLite schema (zero-friction local dev)
│   │   ├── schema.postgresql.prisma # PostgreSQL schema (ready for Docker/Cloud production)
│   │   ├── dev.db                   # Seeded local SQLite database
│   │   └── seed.ts                  # Comprehensive seeder (20+ products, categories, users, orders)
│   └── package.json
│
├── shared/          # Shared TypeScript interfaces, DTOs, and types
│   ├── src/
│   │   ├── types.ts      # Core domain models (Product, Order, User, etc.)
│   │   ├── dtos.ts       # Request/response DTOs (Cart, Checkout, Admin, Auth)
│   │   └── index.ts      # Main barrel export
│   └── package.json
│
└── package.json     # Monorepo root with npm workspace orchestration
```

---

## 🔒 Security Hardening & Review Resolves

1. **Stripe Webhook Raw Body:** Mounted `express.raw({ type: 'application/json' })` explicitly on `/api/payments/webhook` *before* `express.json()` to ensure webhook signature verification succeeds without corrupted payloads.
2. **Gated Dev Simulator:** `/api/payments/confirm-dev` is strictly disabled in production (`NODE_ENV === 'production'`) with HTTP 403.
3. **Targeted Auth Rate Limiting:** Login route specifically restricted to 10 attempts per 15 minutes to thwart brute-force password guessing.
4. **Bcrypt 12 Rounds:** Password hashing configured with 12 salt rounds for enhanced cryptographic security.
5. **No Broken Deletions:** Products are soft-deleted (`isActive = false`) rather than hard-deleted to prevent database foreign key constraint violations on `OrderItem` records.
6. **Immutable Address Snapshots:** Serializes address snapshots (`shippingAddressSnapshot`) directly into the `Order` record so user address edits do not distort historical orders.
7. **Order Status Timeline:** Every fulfillment progression writes an audit entry to `OrderStatusHistory` with timestamps, notes, and the actor responsible.
8. **Per-User Coupon Caps:** Coupled with `UserCoupon` junction model to guarantee customers cannot exploit repeat promo codes.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 2. Quick Setup & Local Execution
Clone the repository and install all workspace dependencies from the root:

```bash
# Install all dependencies across all workspaces
npm install

# Build all packages (shared types, server, client)
npm run build
```

The local database (`database/prisma/dev.db`) is already pre-configured and seeded with rich mock products, categories, coupons, and demo accounts. If you wish to re-generate or re-seed:

```bash
npm run db:push
npm run db:seed
```

### 3. Launch Development Servers
Run both backend and frontend concurrently with a single command:

```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@store.com` | `Admin@123456` | Public Storefront + Full Admin Console (`/admin`) |
| **Customer** | `john@store.com` | `User@123456` | Public Storefront, Wishlist, Cart, Checkout, Profile |

*(Note: The seeded default passwords are only for local development/seed mode and should never be used in production environments).*

---

## 🧪 Automated Testing

The project includes an end-to-end integration test suite verifying authentication, rate limiting, product catalog queries, cart operations, coupon validation, checkout computations, order placement, timeline tracking, role permissions, and admin analytics:

```bash
npm test
```

**Results:**
```
✓ Auth & Registration (register, duplicate prevention, login, JWT issuance)
✓ Catalog Browsing (filters, sorting, search, detail view)
✓ Cart & Wishlist Lifecycle (add, stepper update, remove, clear)
✓ Coupons (validations, discount computation, per-user limits)
✓ Checkout (server-side subtotal, tax, shipping, and grand total calculations)
✓ Order Placement (atomic stock deduction, address snapshotting, cart auto-clearing)
✓ Fulfillment Timeline (OrderStatusHistory entries)
✓ Security & Roles (403 forbidden checks for unauthorized users on admin endpoints)
✓ Admin Dashboard (real DB KPI aggregations, status updates, audit logging)

ALL 21/21 INTEGRATION TESTS PASS
```

---

## 🗄️ Switching to PostgreSQL in Production

When deploying to production with PostgreSQL or Docker:
1. Copy or rename `database/prisma/schema.postgresql.prisma` to `schema.prisma`.
2. Configure your connection string in `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"
   ```
3. Run migrations:
   ```bash
   npm run --workspace=database migrate:deploy
   ```
