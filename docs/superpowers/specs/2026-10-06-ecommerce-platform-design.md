# Full-Stack E-Commerce Platform — Technical Design Specification

- **Date**: 2026-10-06
- **Architecture**: Monorepo (`client/`, `server/`, `shared/`, `database/`)
- **Status**: Approved for Implementation

---

## 1. System Overview & Technology Stack

The platform is an enterprise-grade full-stack e-commerce system built with strict separation of concerns, high-fidelity security, real relational database operations, and a modern, responsive user experience.

### 1.1 Core Technologies
- **Frontend (`/client`)**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Zustand (state management), Axios (centralized API client), React Router DOM v6.
- **Backend (`/server`)**: Node.js, Express, TypeScript, Prisma ORM, Zod (runtime validation), bcryptjs (password hashing), jsonwebtoken (JWT auth), Helmet, CORS, express-rate-limit, Morgan.
- **Database (`/database` & Prisma)**: PostgreSQL (primary schema for production) with dual-mode SQLite local adapter for zero-friction local development and testing without requiring Docker or a local PostgreSQL service.
- **Payment & Storage**: Stripe payment intent integration with dev fallback simulator + signature-verified webhook endpoints; image storage abstraction supporting local assets and Cloudinary.

---

## 2. Monorepo Directory Architecture

```
nodejs-project/
├── package.json               # Root scripts (install, build, dev, seed, test)
├── tsconfig.json
├── shared/                    # Shared types & contracts between client & server
│   └── src/
│       ├── types.ts           # Product, User, Order, Cart, Coupon types
│       └── dtos.ts            # Request & response payloads
├── database/
│   ├── prisma/
│   │   ├── schema.prisma      # PostgreSQL primary schema
│   │   └── schema.sqlite.prisma # SQLite dev schema matching identical models
│   ├── seed.ts                # Real seed data (categories, brands, products, demo users, orders)
│   └── dev.db                 # Local development SQLite file
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── config/            # Environment, Prisma instance, Stripe config
│       ├── controllers/       # Auth, Product, Cart, Wishlist, Order, Admin, Coupon, Review
│       ├── services/          # Business logic: pricing, inventory, order processing, auth
│       ├── routes/            # REST API route declarations
│       ├── middleware/        # Auth guard, role check (ADMIN), error handler, rate limit
│       ├── validators/        # Zod request validation schemas
│       ├── utils/             # JWT sign/verify, response helpers, logger
│       └── server.ts          # App bootstrap, middleware wiring, listener
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── api/               # Centralized API service layer (authApi, productApi, etc.)
        ├── components/        # UI components (Navbar, Footer, ProductCard, Modals, etc.)
        ├── layouts/           # MainLayout, AdminLayout, AuthLayout
        ├── pages/             # Home, Catalog, ProductDetail, Cart, Wishlist, Checkout, Account, Admin
        ├── store/             # Zustand stores: useAuthStore, useCartStore, useWishlistStore
        ├── hooks/             # Custom hooks: useDebounce, useProducts
        └── utils/             # Currency format, date helpers
```

---

## 3. Database Schema Specification

### 3.1 Entities & Relational Design
1. **User**: `id`, `name`, `email` (unique), `passwordHash`, `role` (USER | ADMIN), `isActive`, `avatarUrl`, `createdAt`, `updatedAt`
2. **Address**: `id`, `userId`, `fullName`, `phone`, `street`, `city`, `state`, `postalCode`, `country`, `isDefault`
3. **Category**: `id`, `name`, `slug` (unique), `description`, `imageUrl`, `parentId`
4. **Brand**: `id`, `name`, `slug` (unique), `logoUrl`
5. **Product**: `id`, `name`, `slug` (unique), `description`, `shortDescription`, `price`, `compareAtPrice`, `sku`, `stock`, `categoryId`, `brandId`, `isActive`, `rating`, `reviewCount`, `specifications` (JSON string)
6. **ProductImage**: `id`, `productId`, `url`, `altText`, `sortOrder`, `isPrimary`
7. **ProductVariant**: `id`, `productId`, `name`, `sku`, `priceAdjustment`, `stock`, `attributes` (JSON: size, color, storage)
8. **Cart** & **CartItem**: `cartId`, `userId` (unique), items linked to `productId` and optional `variantId`, `quantity`
9. **Wishlist** & **WishlistItem**: `wishlistId`, `userId` (unique), items linked to `productId`
10. **Order** & **OrderItem**:
    - Order: `id`, `orderNumber` (unique), `userId`, `shippingAddressId`, `subtotal`, `discountAmount`, `shippingAmount`, `taxAmount`, `totalAmount`, `status` (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `REFUNDED`), `paymentStatus` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`), `trackingNumber`, `couponCode`
    - OrderItem: `id`, `orderId`, `productId`, `variantId`, `productName`, `unitPrice`, `quantity`, `totalPrice`
11. **Payment**: `id`, `orderId`, `provider` (`STRIPE`, `COD`), `transactionId`, `amount`, `currency`, `status`, `payload`
12. **Review**: `id`, `productId`, `userId`, `rating` (1-5), `title`, `comment`, `isVerifiedPurchase`
13. **Coupon**: `id`, `code` (unique), `discountType` (`PERCENTAGE`, `FIXED`), `discountAmount`, `minOrderAmount`, `maxDiscountAmount`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `isActive`
14. **AuditLog**: `id`, `adminId`, `action`, `entityType`, `entityId`, `details`, `createdAt`

---

## 4. API Endpoints Specification

### 4.1 Authentication
- `POST /api/auth/register`: Validate input, hash password with bcrypt, issue JWT token & user profile.
- `POST /api/auth/login`: Validate credentials, issue HTTP-only cookie + bearer token.
- `POST /api/auth/logout`: Invalidate session cookie.
- `GET /api/auth/me`: Return authenticated user info & addresses.
- `PUT /api/auth/profile`: Update name, phone, avatar.
- `PUT /api/auth/change-password`: Validate current password, update with new hash.

### 4.2 Products & Catalog
- `GET /api/products`: Filterable by category, brand, min/max price, rating, inStock, search term, sort (price-asc, price-desc, newest, rating), pagination (`page`, `limit`).
- `GET /api/products/:slugOrId`: Retrieve complete product with variants, images, brand, category, and approved reviews.
- `GET /api/products/featured`: Top rated and featured items for landing page.
- `GET /api/categories`: Full hierarchy list.
- `GET /api/brands`: Available brand directory.

### 4.3 Cart & Wishlist
- `GET /api/cart`: Return user's database cart with live prices and totals.
- `POST /api/cart/items`: Add item (product + optional variant, quantity).
- `PATCH /api/cart/items/:id`: Update item quantity.
- `DELETE /api/cart/items/:id`: Remove item.
- `DELETE /api/cart`: Clear cart.
- `GET /api/wishlist`: Return saved products.
- `POST /api/wishlist`: Toggle or add item.
- `DELETE /api/wishlist/:productId`: Remove item.

### 4.4 Checkout & Orders
- `POST /api/coupons/validate`: Server-side coupon verification with minimum spend and discount computation.
- `POST /api/checkout/summary`: Calculate exact server-side subtotal, discount, shipping, tax, and final amount.
- `POST /api/orders`: Create order from cart with address verification; deduct stock in a transaction.
- `GET /api/orders`: User's order history.
- `GET /api/orders/:id`: Detailed order breakdown with status history timeline.
- `POST /api/orders/:id/cancel`: Cancel order if not yet shipped; restock inventory.

### 4.5 Payments
- `POST /api/payments/create-intent`: Create Stripe PaymentIntent with server-computed order total.
- `POST /api/payments/webhook`: Stripe webhook handler with signature verification.
- `POST /api/payments/confirm-dev`: Safe development payment simulator to test successful and failed transactions without real cards.

### 4.6 Reviews
- `POST /api/products/:id/reviews`: Create review (verifies user purchased item).
- `GET /api/products/:id/reviews`: Paginated reviews list with distribution breakdown.

### 4.7 Admin Endpoints (Protected: `requireAdmin`)
- `GET /api/admin/analytics`: Real database aggregation for total revenue, order count, registered users, sales over time, pending orders, and low-stock alerts.
- `GET /api/admin/products`, `POST /api/admin/products`, `PUT /api/admin/products/:id`, `DELETE /api/admin/products/:id`: Full product catalog management.
- `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`: Order fulfillment and status timeline updates.
- `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `PATCH /api/admin/users/:id/status`: Customer account management.
- `GET /api/admin/audit-logs`: Audit trail for compliance and tracking.

---

## 5. Security & Error Handling Architecture

1. **Security Headers & Protection**:
   - Helmet for secure HTTP headers.
   - Rate limiting on authentication routes (100 requests per 15 minutes).
   - Strict CORS configuration for client origin.
   - All passwords hashed with bcrypt (salt rounds = 10).
   - JWT authentication verified on every protected route.
2. **Server-Side Price Integrity**:
   - Order totals, discounts, taxes, and shipping are **always** calculated on the server by querying the database for product prices. The client can never dictate the checkout price.
3. **Centralized Error Handling**:
   - Custom `AppError` class with HTTP status codes and operational flags.
   - Central error middleware catching unhandled rejections and returning standardized `{ success: false, message: string, errors?: any }` payloads. No stack traces exposed to client.

---

## 6. Seed Data & Test Plan

1. **Seed Data**:
   - 6 Categories (Electronics, Fashion, Footwear, Home & Kitchen, Audio, Gaming)
   - 6 Brands (Apple, Sony, Nike, Samsung, Bose, Logitech)
   - 20+ Realistic Products with multiple images, specifications, and variants (Sizes, Colors, Storage)
   - 1 Admin user (`admin@store.com` / `Admin@123456`)
   - 2 Demo customers (`john@store.com` / `User@123456`, `jane@store.com` / `User@123456`)
   - Active coupons (`WELCOME10` for 10% off, `SAVE20` for $20 off orders > $100)
   - Sample historical orders to immediately populate user history and admin analytics.
2. **Automated Verification**:
   - TypeScript compilation checks (`tsc --noEmit`) for both client and server.
   - API integration tests for auth, catalog filtering, cart, order creation, coupon validation, and admin analytics.
   - Full browser verification of client UI rendering, responsive mobile view, and interactive checkout.
