export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  priceAdjustment: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  sku: string;
  stock: number;
  categoryId: string;
  brandId: string;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  variants?: ProductVariant[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product?: Product;
  variant?: ProductVariant | null;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalQuantity: number;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  product?: Product;
  createdAt: string | Date;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string | null;
  changedBy: string;
  createdAt: string | Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  product?: Product;
  variant?: ProductVariant | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  shippingAddressId?: string | null;
  shippingAddress?: Address | null;
  shippingAddressSnapshot: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string | null;
  couponCode?: string | null;
  statusHistory?: OrderStatusHistory[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string | Date;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountAmount: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate: string | Date;
  endDate: string | Date;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit?: number;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  admin?: Pick<User, 'id' | 'name' | 'email'>;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown> | null;
  createdAt: string | Date;
}
