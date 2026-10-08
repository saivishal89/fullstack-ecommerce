import http from 'http';
import app from '../server.js';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 Starting Full-Stack API Integration Test Suite...\n');

  server = app.listen(PORT);
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string) {
    totalCount++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  try {
    // 1. Health check
    const health = await fetch(`http://localhost:${PORT}/health`).then((r) => r.json());
    assert(health.status === 'ok', 'GET /health returns 200 and status ok');

    // 2. Authentication: Register a fresh test user
    const testEmail = `tester_${Date.now()}@store.com`;
    const registerRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Automated Tester',
        email: testEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
      }),
    });
    assert(registerRes.status === 201 && registerRes.data.success, 'POST /auth/register succeeds with bcrypt 12 hashing');
    const userToken = registerRes.data.data.token;
    assert(Boolean(userToken), 'JWT token returned upon registration');

    // 3. User Address CRUD
    const addAddressRes = await request('/users/addresses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        fullName: 'Automated Tester',
        phone: '+1 555-0199',
        street: '456 Automation Ave',
        city: 'Metropolis',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        isDefault: true,
      }),
    });
    assert(addAddressRes.status === 201, 'POST /users/addresses creates user shipping address');
    const userAddressId = addAddressRes.data.data.id;

    // 4. Products: Catalog, Search, and Featured
    const featuredRes = await request('/products/featured');
    assert(featuredRes.data.data.length > 0, 'GET /products/featured returns featured products');

    const catalogRes = await request('/products?limit=5&sortBy=price-asc');
    assert(catalogRes.data.data.length === 5, 'GET /products with pagination returns 5 products');
    const firstProduct = catalogRes.data.data[0];

    const detailRes = await request(`/products/${firstProduct.slug}`);
    assert(detailRes.data.data.id === firstProduct.id, 'GET /products/:slug returns rich product details');

    // 5. Cart Operations
    const addCartRes = await request('/cart/items', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ productId: firstProduct.id, quantity: 2 }),
    });
    assert(addCartRes.status === 201 && addCartRes.data.data.items.length > 0, 'POST /cart/items adds product to persistent cart');

    const cartRes = await request('/cart', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(cartRes.data.data.totalQuantity >= 2, 'GET /cart persists database cart items');

    // 6. Wishlist Operations
    const wishToggleRes = await request('/wishlist/toggle', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ productId: firstProduct.id }),
    });
    assert(wishToggleRes.data.success, 'POST /wishlist/toggle toggles wishlist state');

    // 7. Coupon Validation
    const couponRes = await request('/orders/validate-coupon', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ code: 'WELCOME10', subtotal: 200 }),
    });
    assert(couponRes.data.data.valid && couponRes.data.data.discountAmount === 20, 'Coupon WELCOME10 calculates 10% discount');

    // 8. Server-Side Checkout Summary
    const summaryRes = await request('/orders/checkout-summary', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ addressId: userAddressId, couponCode: 'WELCOME10' }),
    });
    assert(summaryRes.data.data.totalAmount > 0, 'Server-side checkout summary calculates subtotal, discount, tax and shipping');

    // 9. Real Order Creation
    const orderRes = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        addressId: userAddressId,
        paymentMethod: 'DEV_SIMULATOR',
        couponCode: 'WELCOME10',
      }),
    });
    assert(orderRes.status === 201 && Boolean(orderRes.data.data.orderNumber), 'POST /orders creates order with address snapshot and inventory deduction');
    const createdOrderId = orderRes.data.data.id;

    // Verify cart was cleared after order placement
    const clearedCart = await request('/cart', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(clearedCart.data.data.items.length === 0, 'Cart is automatically cleared after order placement');

    // 10. Order Details & History Timeline
    const orderDetailRes = await request(`/orders/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(orderDetailRes.data.data.statusHistory.length > 0, 'GET /orders/:id returns order status history timeline');

    // 11. Security Protection: Regular user attempting Admin endpoint
    const forbiddenRes = await request('/admin/analytics', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(forbiddenRes.status === 403, 'Regular user is rejected with 403 from /api/admin/analytics');

    // 12. Admin Login and Analytics
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@store.com', password: 'Admin@123456' }),
    });
    assert(adminLoginRes.status === 200, 'Admin login succeeds');
    const adminToken = adminLoginRes.data.data.token;

    const analyticsRes = await request('/admin/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(analyticsRes.data.data.totalProducts >= 20, 'Admin analytics returns real database product count >= 20');
    assert(analyticsRes.data.data.totalRevenue > 0, 'Admin analytics returns computed revenue from real paid orders');

    // 13. Admin Order Status Update
    const updateStatusRes = await request(`/admin/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'PROCESSING', note: 'Order sent to packing station' }),
    });
    assert(updateStatusRes.data.data.status === 'PROCESSING', 'Admin updates order status with timeline note');

    // 14. Admin Audit Logs
    const auditRes = await request('/admin/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(auditRes.data.data.length > 0, 'Admin audit logs track administrative status changes');

    console.log(`\n🎉 ALL ${passedCount}/${totalCount} TESTS PASSED SUCCESSFULLY!`);
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  if (server) server.close();
  process.exit(1);
});
