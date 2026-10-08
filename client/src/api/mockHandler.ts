import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  fallbackCategories,
  fallbackBrands,
  fallbackProducts,
  fallbackCustomer,
  fallbackAdmin,
  fallbackAddress,
  fallbackAnalytics,
  fallbackOrders,
} from '../data/mockData';
import { Cart, CartItem, Order, User, Address } from '@ecommerce/shared';

function parseBody(data: any): any {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
}

function getStoredUser(): User & { addresses: Address[] } {
  try {
    const raw = localStorage.getItem('aura_demo_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return fallbackCustomer;
}

function getStoredAddresses(): Address[] {
  try {
    const raw = localStorage.getItem('aura_demo_addresses');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [fallbackAddress];
}

function getStoredCart(): Cart {
  try {
    const raw = localStorage.getItem('aura_demo_cart');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {
    id: 'cart_demo_01',
    userId: 'usr_demo_customer_01',
    items: [],
    subtotal: 0,
    totalQuantity: 0,
  };
}

function refreshCartTotals(cart: Cart): Cart {
  cart.subtotal = Number(
    cart.items
      .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
      .toFixed(2)
  );
  cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return cart;
}

function saveCart(cart: Cart) {
  try {
    refreshCartTotals(cart);
    localStorage.setItem('aura_demo_cart', JSON.stringify(cart));
  } catch (e) {
    console.error(e);
  }
}

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem('aura_demo_orders');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return fallbackOrders;
}

export async function handleMockFallback(config: AxiosRequestConfig): Promise<AxiosResponse<any> | null> {
  const method = (config.method || 'get').toLowerCase();
  const rawUrl = config.url || '';
  // Normalize url by stripping baseURL if present and removing query params
  const cleanUrl = rawUrl.replace(/^(https?:\/\/[^/]+)?(\/api)?/, '').split('?')[0];

  console.info(`[Demo Fallback Engine] Handling offline / 404 request: ${method.toUpperCase()} ${cleanUrl}`);

  let responseData: any = null;

  // 1. AUTHENTICATION
  if (cleanUrl === '/auth/login' && method === 'post') {
    const body = parseBody(config.data);
    const email = (body.email || '').trim().toLowerCase();
    const isAdmin = email.includes('admin');
    const user = isAdmin ? fallbackAdmin : { ...fallbackCustomer, email: body.email || fallbackCustomer.email };
    const token = `demo-token-${isAdmin ? 'admin' : 'customer'}-${Date.now()}`;

    localStorage.setItem('aura_demo_user', JSON.stringify(user));
    localStorage.setItem('aura_token', token);

    responseData = {
      success: true,
      message: 'Signed in via Demo Access Mode',
      data: { user, token },
    };
  } else if (cleanUrl === '/auth/register' && method === 'post') {
    const body = parseBody(config.data);
    const user: User & { addresses: Address[] } = {
      ...fallbackCustomer,
      id: `usr_demo_${Date.now()}`,
      name: body.name || 'New Member',
      email: body.email || 'user@store.com',
    };
    const token = `demo-token-customer-${Date.now()}`;

    localStorage.setItem('aura_demo_user', JSON.stringify(user));
    localStorage.setItem('aura_token', token);

    responseData = {
      success: true,
      message: 'Account created via Demo Mode',
      data: { user, token },
    };
  } else if (cleanUrl === '/auth/me' && method === 'get') {
    const user = getStoredUser();
    responseData = {
      success: true,
      data: user,
    };
  } else if (cleanUrl === '/auth/logout' && method === 'post') {
    localStorage.removeItem('aura_demo_user');
    localStorage.removeItem('aura_token');
    responseData = { success: true, message: 'Logged out' };
  }

  // 2. USER PROFILE & ADDRESSES
  else if (cleanUrl === '/users/profile' && method === 'put') {
    const body = parseBody(config.data);
    const currentUser = getStoredUser();
    const updated = { ...currentUser, ...body };
    localStorage.setItem('aura_demo_user', JSON.stringify(updated));
    responseData = { success: true, data: updated };
  } else if (cleanUrl === '/users/change-password' && method === 'put') {
    responseData = { success: true, message: 'Password updated successfully' };
  } else if (cleanUrl === '/users/addresses' && method === 'get') {
    responseData = { success: true, data: getStoredAddresses() };
  } else if (cleanUrl === '/users/addresses' && method === 'post') {
    const body = parseBody(config.data);
    const list = getStoredAddresses();
    const newAddress: Address = {
      id: `addr_demo_${Date.now()}`,
      userId: getStoredUser().id,
      fullName: body.fullName || 'John Doe',
      phone: body.phone || '+91 98765 43210',
      street: body.street || 'Flat 402, Prestige Tech Park, Marathahalli Ring Road',
      city: body.city || 'Bengaluru',
      state: body.state || 'Karnataka',
      postalCode: body.postalCode || '560103',
      country: body.country || 'India',
      isDefault: list.length === 0,
    };
    const updated = [...list, newAddress];
    localStorage.setItem('aura_demo_addresses', JSON.stringify(updated));
    responseData = { success: true, data: newAddress };
  } else if (cleanUrl.startsWith('/users/addresses/') && method === 'delete') {
    const id = cleanUrl.split('/users/addresses/')[1];
    const list = getStoredAddresses().filter((a) => a.id !== id);
    localStorage.setItem('aura_demo_addresses', JSON.stringify(list));
    responseData = { success: true, message: 'Address removed' };
  }

  // 3. CATALOG
  else if (cleanUrl === '/products' && method === 'get') {
    responseData = {
      success: true,
      data: fallbackProducts,
      pagination: {
        page: 1,
        limit: 20,
        total: fallbackProducts.length,
        totalPages: 1,
      },
    };
  } else if (cleanUrl === '/products/featured' && method === 'get') {
    responseData = {
      success: true,
      data: fallbackProducts.filter((p) => p.isFeatured),
    };
  } else if (cleanUrl === '/products/trending' && method === 'get') {
    responseData = {
      success: true,
      data: fallbackProducts,
    };
  } else if (cleanUrl === '/products/categories' && method === 'get') {
    responseData = {
      success: true,
      data: fallbackCategories,
    };
  } else if (cleanUrl === '/products/brands' && method === 'get') {
    responseData = {
      success: true,
      data: fallbackBrands,
    };
  } else if (cleanUrl.startsWith('/products/related') && method === 'get') {
    responseData = {
      success: true,
      data: fallbackProducts.slice(0, 3),
    };
  } else if (cleanUrl.startsWith('/products/') && method === 'get') {
    const slugOrId = cleanUrl.replace('/products/', '');
    const product =
      fallbackProducts.find((p) => p.slug === slugOrId || p.id === slugOrId) || fallbackProducts[0];
    responseData = {
      success: true,
      data: { ...product, reviews: [] },
    };
  } else if (cleanUrl.includes('/reviews') && method === 'post') {
    responseData = {
      success: true,
      message: 'Review submitted',
      data: { id: `rev_${Date.now()}`, rating: 5, comment: 'Great product!' },
    };
  }

  // 4. CART
  else if (cleanUrl === '/cart' && method === 'get') {
    responseData = { success: true, data: getStoredCart() };
  } else if (cleanUrl === '/cart' && method === 'delete') {
    const cart = getStoredCart();
    cart.items = [];
    saveCart(cart);
    responseData = { success: true, data: cart };
  } else if (cleanUrl === '/cart/items' && method === 'post') {
    const body = parseBody(config.data);
    const cart = getStoredCart();
    const product = fallbackProducts.find((p) => p.id === body.productId) || fallbackProducts[0];
    const existing = cart.items.find((item) => item.productId === product.id);

    if (existing) {
      existing.quantity += body.quantity || 1;
    } else {
      const newItem: CartItem = {
        id: `c_item_${Date.now()}`,
        cartId: cart.id,
        productId: product.id,
        variantId: body.variantId || null,
        quantity: body.quantity || 1,
        product,
      };
      cart.items.push(newItem);
    }
    saveCart(cart);
    responseData = { success: true, data: cart };
  } else if (cleanUrl.startsWith('/cart/items/') && method === 'patch') {
    const itemId = cleanUrl.replace('/cart/items/', '');
    const body = parseBody(config.data);
    const cart = getStoredCart();
    const item = cart.items.find((i) => i.id === itemId);
    if (item) {
      item.quantity = body.quantity;
    }
    saveCart(cart);
    responseData = { success: true, data: cart };
  } else if (cleanUrl.startsWith('/cart/items/') && method === 'delete') {
    const itemId = cleanUrl.replace('/cart/items/', '');
    const cart = getStoredCart();
    cart.items = cart.items.filter((i) => i.id !== itemId);
    saveCart(cart);
    responseData = { success: true, data: cart };
  }

  // 5. WISHLIST
  else if (cleanUrl === '/wishlist' && method === 'get') {
    responseData = { success: true, data: [] };
  } else if (cleanUrl === '/wishlist/toggle' && method === 'post') {
    responseData = { success: true, data: { inWishlist: true } };
  } else if (cleanUrl.startsWith('/wishlist/') && method === 'delete') {
    responseData = { success: true, message: 'Removed from wishlist' };
  }

  // 6. ORDERS & CHECKOUT
  else if (cleanUrl === '/orders/validate-coupon' && method === 'post') {
    const body = parseBody(config.data);
    const code = (body.code || '').trim().toUpperCase();
    const subtotal = body.subtotal || 100;
    if (code === 'WELCOME10') {
      responseData = {
        success: true,
        data: {
          valid: true,
          discountAmount: Number((subtotal * 0.1).toFixed(2)),
          message: 'Promo code applied: 10% off',
        },
      };
    } else {
      responseData = {
        success: false,
        data: {
          valid: false,
          discountAmount: 0,
          message: 'Invalid or expired coupon code',
        },
      };
    }
  } else if (cleanUrl === '/orders/checkout-summary' && method === 'post') {
    const body = parseBody(config.data);
    const cart = getStoredCart();
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const discount = body.couponCode?.toUpperCase() === 'WELCOME10' ? Number((subtotal * 0.1).toFixed(2)) : 0;
    const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * 0.18).toFixed(2));
    const total = Number((taxableAmount + shipping + tax).toFixed(2));

    responseData = {
      success: true,
      data: {
        subtotal,
        discountAmount: discount,
        shippingAmount: shipping,
        taxAmount: tax,
        totalAmount: total,
        itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
      },
    };
  } else if (cleanUrl === '/orders' && method === 'post') {
    const body = parseBody(config.data);
    const cart = getStoredCart();
    const addresses = getStoredAddresses();
    const selectedAddress = addresses.find((a) => a.id === body.addressId) || addresses[0] || fallbackAddress;

    const subtotal = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const discount = body.couponCode?.toUpperCase() === 'WELCOME10' ? Number((subtotal * 0.1).toFixed(2)) : 0;
    const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * 0.18).toFixed(2));
    const total = Number((taxableAmount + shipping + tax).toFixed(2));

    const newOrder: Order = {
      id: `ord_demo_${Date.now()}`,
      orderNumber: `OD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: getStoredUser().id,
      shippingAddressId: selectedAddress.id,
      shippingAddressSnapshot: JSON.stringify(selectedAddress),
      subtotal,
      discountAmount: discount,
      shippingAmount: shipping,
      taxAmount: tax,
      totalAmount: total,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      trackingNumber: `DELHIVERY-${Math.floor(100000000 + Math.random() * 900000000)}IN`,
      couponCode: body.couponCode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: cart.items.map((ci) => ({
        id: `ord_item_${Date.now()}_${ci.id}`,
        orderId: `ord_demo_${Date.now()}`,
        productId: ci.productId,
        variantId: ci.variantId || null,
        productName: ci.product?.name || 'Store Item',
        unitPrice: ci.product?.price || 0,
        quantity: ci.quantity,
        totalPrice: (ci.product?.price || 0) * ci.quantity,
        product: ci.product,
      })),
    };

    const existingOrders = getStoredOrders();
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem('aura_demo_orders', JSON.stringify(updatedOrders));

    // Clear cart
    cart.items = [];
    saveCart(cart);

    responseData = { success: true, data: newOrder };
  } else if (cleanUrl === '/orders' && method === 'get') {
    responseData = { success: true, data: getStoredOrders() };
  } else if (cleanUrl.startsWith('/orders/') && method === 'get') {
    const orderId = cleanUrl.replace('/orders/', '');
    const orders = getStoredOrders();
    const order = orders.find((o) => o.id === orderId) || orders[0] || fallbackOrders[0];
    const parsedShippingAddress = JSON.parse(order.shippingAddressSnapshot || JSON.stringify(fallbackAddress));
    responseData = { success: true, data: { ...order, parsedShippingAddress } };
  } else if (cleanUrl.includes('/cancel') && method === 'post') {
    responseData = { success: true, message: 'Order cancelled successfully' };
  }

  // 7. PAYMENTS
  else if (cleanUrl === '/payments/create-intent' && method === 'post') {
    responseData = {
      success: true,
      data: {
        clientSecret: 'mock_demo_client_secret',
        paymentIntentId: `pi_mock_${Date.now()}`,
        amount: 100,
        isDevMode: true,
      },
    };
  } else if (cleanUrl === '/payments/confirm-dev' && method === 'post') {
    responseData = { success: true, message: 'Payment simulated successfully' };
  }

  // 8. ADMIN
  else if (cleanUrl === '/admin/analytics' && method === 'get') {
    responseData = { success: true, data: fallbackAnalytics };
  } else if (cleanUrl === '/admin/orders' && method === 'get') {
    const orders = getStoredOrders();
    responseData = {
      success: true,
      data: orders,
      pagination: { page: 1, limit: 10, total: orders.length, totalPages: 1 },
    };
  } else if (cleanUrl === '/admin/users' && method === 'get') {
    const users = [fallbackCustomer, fallbackAdmin];
    responseData = {
      success: true,
      data: users,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };
  } else if (cleanUrl === '/admin/products' && method === 'get') {
    responseData = {
      success: true,
      data: fallbackProducts,
      pagination: { page: 1, limit: 20, total: fallbackProducts.length, totalPages: 1 },
    };
  } else if (cleanUrl === '/admin/products' && method === 'post') {
    const body = parseBody(config.data);
    const newProduct = {
      ...fallbackProducts[0],
      id: `prod_${Date.now()}`,
      ...body,
    };
    responseData = { success: true, data: newProduct };
  } else if (cleanUrl.startsWith('/admin/products/') && (method === 'put' || method === 'delete')) {
    responseData = { success: true, message: 'Product updated successfully', data: fallbackProducts[0] };
  } else if (cleanUrl.startsWith('/admin/orders/') && method === 'patch') {
    responseData = { success: true, message: 'Order status updated' };
  } else if (cleanUrl.startsWith('/admin/users/') && method === 'patch') {
    responseData = { success: true, message: 'User updated' };
  } else if (cleanUrl === '/admin/audit-logs' && method === 'get') {
    responseData = {
      success: true,
      data: [
        {
          id: 'log_01',
          adminId: fallbackAdmin.id,
          action: 'UPDATE_PRODUCT_STOCK',
          entityType: 'Product',
          entityId: fallbackProducts[0].id,
          details: 'Updated stock to 22 units',
          createdAt: new Date().toISOString(),
          admin: fallbackAdmin,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
  }

  if (responseData !== null) {
    return {
      data: responseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config as any,
    };
  }

  return null;
}
