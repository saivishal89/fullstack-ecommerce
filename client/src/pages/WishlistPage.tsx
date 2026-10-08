import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { WishlistItem } from '@ecommerce/shared';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { items, fetchWishlist, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Sign in to view your wishlist</h1>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Save your favorite products, monitor prices, and shop effortlessly across all your devices.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Wishlist is Empty</h1>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Click the heart icon on any product to save it here for later.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Saved Wishlist</h1>
          <p className="text-xs text-slate-500 mt-1">{items.length} items saved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item: WishlistItem) => {
          const product = item.product;
          if (!product) return null;
          const img = product.images?.[0]?.url;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between group"
            >
              <div>
                <Link to={`/products/${product.slug}`} className="block aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 relative">
                  <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>

                <div className="text-[10px] font-bold text-brand-700 uppercase">{product.brand?.name}</div>
                <Link to={`/products/${product.slug}`} className="font-bold text-sm text-slate-900 line-clamp-1 hover:text-brand-600">
                  {product.name}
                </Link>
                <div className="text-base font-extrabold text-slate-950 mt-1">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={async () => {
                    await addItem(product.id, 1);
                    await removeItem(product.id);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
