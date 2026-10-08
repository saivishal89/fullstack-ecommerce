import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { orderApi } from '../api/services';
import { CartItem } from '@ecommerce/shared';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Check,
  Truck,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { addToast } = useToastStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setApplyingCoupon(true);
      const res = await orderApi.validateCoupon(couponCode.trim(), subtotal);
      if (res.valid) {
        setAppliedCoupon(res);
        addToast({
          type: 'success',
          title: 'Coupon applied',
          message: `Saved ${formatINR(res.discountAmount)} on your order!`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Coupon error',
        message: err.message || 'Invalid coupon code',
      });
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const estimatedShipping = discountedSubtotal >= 999 || discountedSubtotal === 0 ? 0 : 99.0;
  const estimatedTax = Math.round(discountedSubtotal * 0.18 * 100) / 100;
  const estimatedTotal = Math.round((discountedSubtotal + estimatedShipping + estimatedTax) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Explore our latest collection of premium hardware, audio, and apparel to find what you love.
        </p>
        <Link
          to="/catalog"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          Browse All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Shopping Bag</h1>
          <p className="text-xs text-slate-500 mt-1">{items.length} unique items in your cart</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item: CartItem) => {
            const img = item.product?.images?.[0]?.url;
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm"
              >
                <img
                  src={img}
                  alt={item.product?.name}
                  className="w-28 h-28 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0 mx-auto sm:mx-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                        {item.product?.brand?.name}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 hover:text-brand-600 transition-colors">
                        <Link to={`/products/${item.product?.slug}`}>{item.product?.name}</Link>
                      </h3>
                      {item.variant && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Variant: <span className="font-semibold text-slate-700">{item.variant.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold text-slate-950">
                        {formatINR(((item.product?.price ?? 0) + (item.variant?.priceAdjustment ?? 0)) * item.quantity)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatINR((item.product?.price ?? 0) + (item.variant?.priceAdjustment ?? 0))} each
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-50">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 h-9">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 h-full hover:bg-white text-slate-600 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 h-full hover:bg-white text-slate-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-950">Order Summary</h2>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Promo Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl uppercase font-mono tracking-wider focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                </div>
                <button
                  type="submit"
                  disabled={applyingCoupon || !couponCode}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium pt-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Code <strong>{appliedCoupon.coupon.code}</strong> applied (-{formatINR(discountAmount)})</span>
                </div>
              )}
            </form>

            {/* Free Delivery prompt (Amazon/Flipkart style) */}
            {discountedSubtotal < 999 && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Add <strong>{formatINR(999 - discountedSubtotal)}</strong> more of eligible items to get <strong>FREE Delivery</strong>!</span>
              </div>
            )}

            {/* Pricing details */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatINR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-slate-900">
                  {estimatedShipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatINR(estimatedShipping)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated GST (18%)</span>
                <span className="font-semibold text-slate-900">{formatINR(estimatedTax)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-950">
                <span>Estimated Total</span>
                <span className="text-xl text-brand-600">{formatINR(estimatedTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.coupon?.code } })}
              className="w-full py-4 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Encrypted 256-bit SSL transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
