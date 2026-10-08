import { apiClient } from './client';
import {
  Address,
  AdminAnalyticsDto,
  ApiResponse,
  Cart,
  Coupon,
  LoginDto,
  Order,
  PaginatedResponse,
  Product,
  ProductQueryDto,
  RegisterDto,
  Review,
  User,
  ValidateCouponResponse,
} from '@ecommerce/shared';

// Auth APIs
export const authApi = {
  login: async (dto: LoginDto) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', dto);
    return res.data.data!;
  },
  register: async (dto: RegisterDto) => {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register', dto);
    return res.data.data!;
  },
  logout: async () => {
    const res = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<ApiResponse<User & { addresses: Address[] }>>('/auth/me');
    return res.data.data!;
  },
  updateProfile: async (data: { name?: string; phone?: string; avatarUrl?: string | null }) => {
    const res = await apiClient.put<ApiResponse<User>>('/users/profile', data);
    return res.data.data!;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await apiClient.put<ApiResponse<void>>('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
  getAddresses: async () => {
    const res = await apiClient.get<ApiResponse<Address[]>>('/users/addresses');
    return res.data.data!;
  },
  addAddress: async (data: Omit<Address, 'id' | 'userId'>) => {
    const res = await apiClient.post<ApiResponse<Address>>('/users/addresses', data);
    return res.data.data!;
  },
  updateAddress: async (id: string, data: Partial<Omit<Address, 'id' | 'userId'>>) => {
    const res = await apiClient.put<ApiResponse<Address>>(`/users/addresses/${id}`, data);
    return res.data.data!;
  },
  deleteAddress: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/users/addresses/${id}`);
    return res.data;
  },
};

// Catalog APIs
export const productApi = {
  getProducts: async (params: ProductQueryDto) => {
    const res = await apiClient.get<PaginatedResponse<Product>>('/products', { params });
    return res.data;
  },
  getFeatured: async () => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products/featured');
    return res.data.data!;
  },
  getTrending: async () => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products/trending');
    return res.data.data!;
  },
  getBySlugOrId: async (slugOrId: string) => {
    const res = await apiClient.get<ApiResponse<Product & { reviews: Review[] }>>(`/products/${slugOrId}`);
    return res.data.data!;
  },
  getRelated: async (categoryId: string, excludeId: string) => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products/related', {
      params: { categoryId, excludeId },
    });
    return res.data.data!;
  },
  getCategories: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/products/categories');
    return res.data.data!;
  },
  getBrands: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/products/brands');
    return res.data.data!;
  },
  createReview: async (productId: string, data: { rating: number; title: string; comment: string }) => {
    const res = await apiClient.post<ApiResponse<Review>>(`/products/${productId}/reviews`, data);
    return res.data.data!;
  },
};
export const catalogApi = productApi;

// Cart APIs
export const cartApi = {
  getCart: async () => {
    const res = await apiClient.get<ApiResponse<Cart>>('/cart');
    return res.data.data!;
  },
  addItem: async (productId: string, quantity = 1, variantId?: string | null) => {
    const res = await apiClient.post<ApiResponse<Cart>>('/cart/items', {
      productId,
      quantity,
      variantId,
    });
    return res.data.data!;
  },
  updateQuantity: async (itemId: string, quantity: number) => {
    const res = await apiClient.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    return res.data.data!;
  },
  removeItem: async (itemId: string) => {
    const res = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return res.data.data!;
  },
  clearCart: async () => {
    const res = await apiClient.delete<ApiResponse<Cart>>('/cart');
    return res.data.data!;
  },
};

// Wishlist APIs
export const wishlistApi = {
  getWishlist: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/wishlist');
    return res.data.data!;
  },
  toggleItem: async (productId: string) => {
    const res = await apiClient.post<ApiResponse<{ inWishlist: boolean }>>('/wishlist/toggle', {
      productId,
    });
    return res.data.data!;
  },
  removeItem: async (productId: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/wishlist/${productId}`);
    return res.data;
  },
};

// Order & Checkout APIs
export const orderApi = {
  validateCoupon: async (code: string, subtotal: number) => {
    const res = await apiClient.post<ApiResponse<ValidateCouponResponse>>('/orders/validate-coupon', {
      code,
      subtotal,
    });
    return res.data.data!;
  },
  getCheckoutSummary: async (addressId: string, couponCode?: string) => {
    const res = await apiClient.post<ApiResponse<any>>('/orders/checkout-summary', {
      addressId,
      couponCode,
    });
    return res.data.data!;
  },
  createOrder: async (data: {
    addressId: string;
    paymentMethod: 'STRIPE' | 'COD' | 'DEV_SIMULATOR';
    couponCode?: string;
    paymentIntentId?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return res.data.data!;
  },
  getUserOrders: async () => {
    const res = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return res.data.data!;
  },
  getOrderById: async (orderId: string) => {
    const res = await apiClient.get<ApiResponse<Order & { parsedShippingAddress: Address }>>(`/orders/${orderId}`);
    return res.data.data!;
  },
  cancelOrder: async (orderId: string) => {
    const res = await apiClient.post<ApiResponse<void>>(`/orders/${orderId}/cancel`);
    return res.data;
  },
};

// Payment APIs
export const paymentApi = {
  createIntent: async (addressId: string, couponCode?: string) => {
    const res = await apiClient.post<ApiResponse<{ clientSecret: string; paymentIntentId: string; amount: number; isDevMode?: boolean }>>(
      '/payments/create-intent',
      { addressId, couponCode }
    );
    return res.data.data!;
  },
  confirmDev: async (orderId: string) => {
    const res = await apiClient.post<ApiResponse<any>>('/payments/confirm-dev', { orderId });
    return res.data;
  },
};

// Admin APIs
export const adminApi = {
  getAnalytics: async () => {
    const res = await apiClient.get<ApiResponse<AdminAnalyticsDto>>('/admin/analytics');
    return res.data.data!;
  },
  getOrders: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<PaginatedResponse<Order>>('/admin/orders', { params });
    return res.data;
  },
  updateOrderStatus: async (orderId: string, status: string, note?: string, trackingNumber?: string) => {
    const res = await apiClient.patch<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, {
      status,
      note,
      trackingNumber,
    });
    return res.data.data!;
  },
  getUsers: async (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<PaginatedResponse<User>>('/admin/users', { params });
    return res.data;
  },
  updateUserStatus: async (userId: string, isActive: boolean) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/status`, { isActive });
    return res.data.data!;
  },
  updateUserRole: async (userId: string, role: string) => {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/role`, { role });
    return res.data.data!;
  },
  createProduct: async (data: any) => {
    const res = await apiClient.post<ApiResponse<Product>>('/admin/products', data);
    return res.data.data!;
  },
  updateProduct: async (productId: string, data: any) => {
    const res = await apiClient.put<ApiResponse<Product>>(`/admin/products/${productId}`, data);
    return res.data.data!;
  },
  deleteProduct: async (productId: string) => {
    const res = await apiClient.delete<ApiResponse<Product>>(`/admin/products/${productId}`);
    return res.data.data!;
  },
  getAuditLogs: async (page = 1) => {
    const res = await apiClient.get<PaginatedResponse<any>>('/admin/audit-logs', { params: { page } });
    return res.data;
  },
};
