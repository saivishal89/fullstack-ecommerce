# Full-Stack E-Commerce Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-ready full-stack e-commerce web application with React + Vite + Tailwind frontend, Node.js + Express + TypeScript backend, Prisma ORM with real database operations, authentication, product catalog, cart, multi-step checkout, payment simulation/Stripe architecture, and customer & admin dashboards.

**Architecture:** Monorepo with `/client`, `/server`, `/shared`, and `/database`. Backend uses Controllers → Services → Database pattern. Frontend uses centralized API services and Zustand stores.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Node.js, Express, Prisma ORM, SQLite/PostgreSQL, Zod, bcryptjs, jsonwebtoken, Stripe SDK, Lucide React.

**Spec:** `docs/superpowers/specs/2026-10-06-ecommerce-platform-design.md`

## Global Constraints
- Node version >= 20 (Running on v24.14.1)
- Strict TypeScript everywhere (`noImplicitAny: true`)
- Prices and totals calculated strictly server-side
- Zero placeholders or TODOs for core functionality
- Dual-mode Prisma database support (SQLite dev file `database/dev.db` ready out-of-the-box, with PostgreSQL schema ready for production deployment)

---

### Task 1: Monorepo Scaffolding & Shared Types
**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `shared/src/index.ts`
- Create: `shared/src/types.ts`
- Create: `shared/src/dtos.ts`

- [ ] **Step 1: Create root package.json and tsconfig.base.json**
- [ ] **Step 2: Create shared package with all domain types (User, Product, Category, Brand, Cart, Order, Review, Coupon)**
- [ ] **Step 3: Build shared package and verify exports**

---

### Task 2: Database Models, Prisma Setup & Realistic Seed
**Files:**
- Create: `database/package.json`
- Create: `database/prisma/schema.prisma`
- Create: `database/seed.ts`
- Create: `database/tsconfig.json`

- [ ] **Step 1: Write complete Prisma schema with all 14 models and relations**
- [ ] **Step 2: Generate Prisma client and push schema to `dev.db`**
- [ ] **Step 3: Write and execute comprehensive seed script with 20+ products, categories, brands, variants, coupons, demo users and sample orders**
- [ ] **Step 4: Verify database content query using Prisma client**

---

### Task 3: Backend Core, Middleware & Error Handling
**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/.env.example`
- Create: `server/src/config/index.ts`
- Create: `server/src/config/prisma.ts`
- Create: `server/src/utils/appError.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/middleware/rateLimiter.ts`
- Create: `server/src/server.ts`

- [ ] **Step 1: Configure server package dependencies and TypeScript configuration**
- [ ] **Step 2: Implement centralized AppError and errorHandler middleware**
- [ ] **Step 3: Implement JWT authentication and role-based access control middleware**
- [ ] **Step 4: Bootstrap Express server with Helmet, CORS, json parser, and health check route**
- [ ] **Step 5: Verify health check route responds successfully**

---

### Task 4: Authentication & User Profile Management
**Files:**
- Create: `server/src/validators/auth.validator.ts`
- Create: `server/src/services/auth.service.ts`
- Create: `server/src/controllers/auth.controller.ts`
- Create: `server/src/routes/auth.routes.ts`
- Create: `server/src/controllers/user.controller.ts`
- Create: `server/src/routes/user.routes.ts`

- [ ] **Step 1: Implement Zod validators for register, login, profile, and address**
- [ ] **Step 2: Implement AuthService with bcrypt hashing and JWT token generation**
- [ ] **Step 3: Implement AuthController and user profile & address CRUD routes**
- [ ] **Step 4: Test register, login, /me, and address creation endpoints**

---

### Task 5: Catalog, Categories & Products APIs
**Files:**
- Create: `server/src/services/product.service.ts`
- Create: `server/src/controllers/product.controller.ts`
- Create: `server/src/routes/product.routes.ts`
- Create: `server/src/services/category.service.ts`
- Create: `server/src/controllers/category.controller.ts`
- Create: `server/src/routes/category.routes.ts`
- Create: `server/src/services/review.service.ts`
- Create: `server/src/controllers/review.controller.ts`
- Create: `server/src/routes/review.routes.ts`

- [ ] **Step 1: Implement ProductService with faceted filtering, text search, sorting, and pagination**
- [ ] **Step 2: Implement category and brand listing services**
- [ ] **Step 3: Implement product review service with verified purchaser validation**
- [ ] **Step 4: Test product search, filter, and detail endpoints**

---

### Task 6: Persistent Cart & Wishlist APIs
**Files:**
- Create: `server/src/services/cart.service.ts`
- Create: `server/src/controllers/cart.controller.ts`
- Create: `server/src/routes/cart.routes.ts`
- Create: `server/src/services/wishlist.service.ts`
- Create: `server/src/controllers/wishlist.controller.ts`
- Create: `server/src/routes/wishlist.routes.ts`

- [ ] **Step 1: Implement CartService with database persistence, variant selection, and subtotal calculation**
- [ ] **Step 2: Implement WishlistService with toggle and move-to-cart operations**
- [ ] **Step 3: Mount routes and test cart item add, update, and remove**

---

### Task 7: Checkout, Orders & Coupon System
**Files:**
- Create: `server/src/services/coupon.service.ts`
- Create: `server/src/controllers/coupon.controller.ts`
- Create: `server/src/routes/coupon.routes.ts`
- Create: `server/src/services/order.service.ts`
- Create: `server/src/controllers/order.controller.ts`
- Create: `server/src/routes/order.routes.ts`

- [ ] **Step 1: Implement CouponService for discount calculations and validation rules**
- [ ] **Step 2: Implement OrderService: server-side price recalculation, inventory decrement in transaction, status tracking**
- [ ] **Step 3: Test coupon validation and order creation from cart**

---

### Task 8: Payment Architecture (Stripe & Dev Simulator)
**Files:**
- Create: `server/src/services/payment.service.ts`
- Create: `server/src/controllers/payment.controller.ts`
- Create: `server/src/routes/payment.routes.ts`

- [ ] **Step 1: Implement PaymentService with Stripe PaymentIntent creation and webhook verification**
- [ ] **Step 2: Implement safe dev simulator endpoint for testing full order confirmation without live credentials**
- [ ] **Step 3: Verify simulated and webhook payment confirmation flows**

---

### Task 9: Admin Dashboard, Management & Audit Logs API
**Files:**
- Create: `server/src/services/admin.service.ts`
- Create: `server/src/controllers/admin.controller.ts`
- Create: `server/src/routes/admin.routes.ts`

- [ ] **Step 1: Implement real database aggregations for revenue, orders, user growth, and low-stock products**
- [ ] **Step 2: Implement Admin CRUD for products, orders, and user status/roles**
- [ ] **Step 3: Implement AuditLog recording for all administrative actions**
- [ ] **Step 4: Test admin analytics and order status update APIs**

---

### Task 10: Frontend Foundation & Design System
**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.ts`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/index.html`
- Create: `client/src/index.css`
- Create: `client/src/api/client.ts`
- Create: `client/src/components/common/Toast.tsx`
- Create: `client/src/components/layout/Navbar.tsx`
- Create: `client/src/components/layout/Footer.tsx`
- Create: `client/src/layouts/MainLayout.tsx`

- [ ] **Step 1: Configure Vite + React + Tailwind CSS with modern design tokens**
- [ ] **Step 2: Setup centralized Axios API client with automatic token attachment and error interception**
- [ ] **Step 3: Build responsive Header/Navbar with search bar, cart count badge, and user dropdown**
- [ ] **Step 4: Build rich responsive Footer**

---

### Task 11: Frontend Catalog & Product Experience
**Files:**
- Create: `client/src/pages/HomePage.tsx`
- Create: `client/src/pages/CatalogPage.tsx`
- Create: `client/src/pages/ProductDetailPage.tsx`
- Create: `client/src/components/product/ProductCard.tsx`
- Create: `client/src/components/product/ProductGallery.tsx`
- Create: `client/src/components/product/ReviewList.tsx`

- [ ] **Step 1: Build Hero section, category carousel, featured products, and promo banners on Home**
- [ ] **Step 2: Build Catalog page with live debounced search, category filters, price range, and sorting**
- [ ] **Step 3: Build Product Detail page with image gallery zoom, variant selector, specifications table, and reviews**

---

### Task 12: Frontend Cart, Wishlist & Multi-Step Checkout
**Files:**
- Create: `client/src/store/useCartStore.ts`
- Create: `client/src/store/useWishlistStore.ts`
- Create: `client/src/pages/CartPage.tsx`
- Create: `client/src/pages/WishlistPage.tsx`
- Create: `client/src/pages/CheckoutPage.tsx`
- Create: `client/src/pages/OrderConfirmationPage.tsx`

- [ ] **Step 1: Implement Zustand cart and wishlist stores synced with backend database**
- [ ] **Step 2: Build Cart page with coupon input, shipping calculator, and subtotal breakdown**
- [ ] **Step 3: Build 5-step Checkout flow (Address, Shipping, Summary, Payment, Confirmation)**

---

### Task 13: Customer Dashboard & Admin Panel UI
**Files:**
- Create: `client/src/pages/account/ProfilePage.tsx`
- Create: `client/src/pages/account/OrdersPage.tsx`
- Create: `client/src/pages/account/OrderDetailPage.tsx`
- Create: `client/src/pages/admin/AdminDashboardPage.tsx`
- Create: `client/src/pages/admin/AdminProductsPage.tsx`
- Create: `client/src/pages/admin/AdminOrdersPage.tsx`
- Create: `client/src/pages/admin/AdminUsersPage.tsx`

- [ ] **Step 1: Build customer account pages: profile edit, saved addresses, and order history with tracking timeline**
- [ ] **Step 2: Build Admin dashboard with real revenue/order summary cards and trends**
- [ ] **Step 3: Build Admin product creation/edit modal, order status updater, and user role manager**

---

### Task 14: End-to-End Verification, Documentation & Production Readiness
**Files:**
- Create: `server/src/__tests__/api.test.ts`
- Create: `README.md`
- Create: `.env.example`

- [ ] **Step 1: Run comprehensive backend API integration tests**
- [ ] **Step 2: Build frontend bundle and verify zero TypeScript/lint errors**
- [ ] **Step 3: Write thorough README.md covering setup, database migrations, seed, API docs, and deployment**
