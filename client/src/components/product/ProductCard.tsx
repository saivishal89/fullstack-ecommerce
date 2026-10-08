import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@ecommerce/shared';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const isFavorited = isInWishlist(product.id);
  const primaryImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product.id);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product.id, 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        <img
          src={primaryImg}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
            -{discountPercent}%
          </span>
        )}

        {/* Featured Badge */}
        {product.isFeatured && !hasDiscount && (
          <span className="absolute top-3 left-3 bg-slate-900 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            Featured
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isFavorited
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-rose-600'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Button Overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors ${
              product.stock > 0
                ? 'bg-slate-900 hover:bg-brand-600 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock > 0 ? 'Quick Add' : 'Out of Stock'}
          </button>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-brand-700 tracking-wider uppercase text-[10px]">
              {product.brand?.name || 'AURA'}
            </span>
            <span className="text-[11px]">{product.category?.name}</span>
          </div>

          {/* Product Title */}
          <Link
            to={`/products/${product.slug}`}
            className="block font-semibold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-slate-800">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Stock info */}
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-slate-950">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          <div className="text-[11px] font-medium">
            {product.stock > 10 ? (
              <span className="text-emerald-600">In Stock</span>
            ) : product.stock > 0 ? (
              <span className="text-amber-600 font-semibold">{product.stock} left</span>
            ) : (
              <span className="text-rose-500 font-semibold">Sold Out</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
