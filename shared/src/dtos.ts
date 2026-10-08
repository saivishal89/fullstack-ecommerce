import { Address, Coupon, Order, Product, Role, User } from './types.js';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[] | string> | string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth DTOs
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface UpdateProfileDto {
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Catalog Query DTO
export interface ProductQueryDto {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'popular';
}

// Cart DTOs
export interface AddToCartDto {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

// Checkout & Order DTOs
export interface ValidateCouponDto {
  code: string;
  subtotal: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message?: string;
}

export interface CheckoutSummaryRequestDto {
  addressId: string;
  shippingMethodId?: string;
  couponCode?: string;
}

export interface CheckoutSummaryResponseDto {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  itemCount: number;
}

export interface CreateOrderDto {
  addressId: string;
  paymentMethod: 'STRIPE' | 'COD' | 'DEV_SIMULATOR';
  couponCode?: string;
  paymentIntentId?: string;
}

export interface CreateReviewDto {
  rating: number;
  title: string;
  comment: string;
}

// Admin DTOs
export interface AdminAnalyticsDto {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  recentSales?: { date: string; amount: number; ordersCount: number }[];
  salesByCategory: { category: string; count: number; revenue: number }[];
  lowStockProducts?: { id: string; name: string; sku: string; stock: number }[];
  recentOrders?: any[];
}

export interface UpdateOrderStatusDto {
  status: Order['status'];
  trackingNumber?: string;
}

export interface UpdateUserRoleDto {
  role: Role;
}
