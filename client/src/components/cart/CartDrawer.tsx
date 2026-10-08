import React from 'react';
import { useCartStore } from '../../store/useCartStore';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/formatters';

export const CartDrawer: React.FC = () => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeItem } = useCartStore();

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">Your Bag</h2>
              <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {cart?.totalQuantity || 0}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">Your bag is empty</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const img = item.product?.images?.[0]?.url;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-white shadow-sm"
                  >
                    <img
                      src={img}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                          {item.product?.name}
                        </h4>
                        {item.variant && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {item.variant.name}
                          </div>
                        )}
                        <div className="text-sm font-bold text-slate-900 mt-1">
                          {formatINR((item.product?.price ?? 0) + (item.variant?.priceAdjustment ?? 0))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-white text-slate-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-white text-slate-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/60 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Shipping & taxes calculated at checkout</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors shadow-sm"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
