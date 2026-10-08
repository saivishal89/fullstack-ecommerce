import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, ProductVariant, Review } from '@ecommerce/shared';
import { productApi } from '../api/services';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { ProductCard } from '../components/product/ProductCard';
import { Skeleton } from '../components/common/Skeleton';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { fallbackProducts } from '../data/mockData';
import { formatINR, getDiscountPercentage } from '../utils/formatters';

export const ProductDetailPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();

  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();

  const [product, setProduct] = useState<(Product & { reviews: Review[] }) | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slugOrId) return;
      try {
        setLoading(true);
        let data: any = null;
        try {
          data = await productApi.getBySlugOrId(slugOrId);
        } catch {
          data = fallbackProducts.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;
        }

        if (!data) {
          data = fallbackProducts.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;
        }

        if (data) {
          setProduct(data);
          setSelectedImage(data.images?.[0]?.url || '');
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          } else {
            setSelectedVariant(null);
          }

          // Fetch related products safely
          try {
            const rel = await productApi.getRelated(data.categoryId, data.id);
            setRelated(Array.isArray(rel) ? rel : fallbackProducts.filter((p) => p.id !== data.id));
          } catch {
            setRelated(fallbackProducts.filter((p) => p.id !== data.id));
          }
        } else {
          setProduct(null);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="w-full aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/4 h-8" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The product you are looking for does not exist or has been retired.</p>
        <Link to="/catalog" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? product.price + selectedVariant.priceAdjustment
    : product.price;

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = async () => {
    await addItem(product.id, quantity, selectedVariant?.id);
  };

  const handleBuyNow = async () => {
    await addItem(product.id, quantity, selectedVariant?.id);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast({ type: 'error', message: 'Please sign in to write a review' });
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      await productApi.createReview(product.id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      addToast({ type: 'success', title: 'Review Submitted', message: 'Thank you for your feedback!' });
      setReviewTitle('');
      setReviewComment('');
      // Reload product to show new review & updated rating
      const refreshed = await productApi.getBySlugOrId(product.id);
      setProduct(refreshed);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to submit review' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const specifications = (product.specifications as Record<string, string>) || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-slate-900">Home</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-slate-900">Catalog</Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.category?.slug}`} className="hover:text-slate-900">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-sm group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                Save ${(product.compareAtPrice - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img.url
                      ? 'border-brand-600 shadow-md ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                {product.brand?.name}
              </span>
              <span className="text-xs font-mono text-slate-400">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-950">
                  {formatINR(currentPrice)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <span className="text-base text-slate-400 line-through">
                    M.R.P: {formatINR(product.compareAtPrice)}
                  </span>
                )}
              </div>
              {getDiscountPercentage(currentPrice, product.compareAtPrice) && (
                <span className="text-xs font-bold text-emerald-600 mt-0.5">
                  Save {getDiscountPercentage(currentPrice, product.compareAtPrice)} (Inclusive of all taxes)
                </span>
              )}
            </div>

            <div className="text-xs font-semibold">
              {currentStock > 10 ? (
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">In Stock ({currentStock})</span>
              ) : currentStock > 0 ? (
                <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Only {currentStock} Left</span>
              ) : (
                <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Select Configuration / Variant:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 text-brand-900 shadow-sm ring-1 ring-brand-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div>{v.name}</div>
                      {v.priceAdjustment !== 0 && (
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          {v.priceAdjustment > 0 ? `+${formatINR(v.priceAdjustment)}` : `-${formatINR(Math.abs(v.priceAdjustment))}`}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 h-full hover:bg-white text-slate-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-bold text-slate-900 min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-3.5 h-full hover:bg-white text-slate-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
              </button>

              {/* Wishlist Heart */}
              <button
                onClick={() => toggleItem(product.id)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                  isFavorited
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white hover:text-rose-600'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now Direct Checkout */}
            <button
              onClick={handleBuyNow}
              disabled={currentStock <= 0}
              className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-300 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Zap className="w-4 h-4" />
              Instant Checkout
            </button>
          </div>

          {/* Perks Guarantee list */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-4 h-4 text-brand-600 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-slate-900">Fast Shipping</div>
              <div className="text-[10px] text-slate-500">Free over ₹999</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <RotateCcw className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-slate-900">30-Day Returns</div>
              <div className="text-[10px] text-slate-500">Zero fee refund</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[11px] font-semibold text-slate-900">Genuine Tech</div>
              <div className="text-[10px] text-slate-500">Full warranty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Overview */}
      <div className="pt-10 border-t border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-950 mb-6">Technical Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {Object.entries(specifications).map(([key, value]) => (
            <div key={key} className="flex justify-between p-3.5 rounded-xl bg-white border border-slate-100">
              <span className="text-xs font-semibold text-slate-500">{key}</span>
              <span className="text-xs font-bold text-slate-900 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-10 border-t border-slate-200 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">Customer Reviews</h2>
            <p className="text-xs text-slate-500 mt-1">
              Read authentic feedback from verified owners
            </p>
          </div>
        </div>

        {/* Write Review Form */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            Write a Product Review
          </h3>

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Your Rating</label>
              <div className="flex items-center gap-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setReviewRating(s)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${s <= reviewRating ? 'fill-current' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Review Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Unbelievable performance and build quality"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Comments</label>
              <textarea
                required
                rows={3}
                placeholder="Share your detailed impressions about this product..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs p-3.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 disabled:bg-slate-400 text-white text-xs font-semibold transition-colors"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews list */}
        <div className="space-y-4 max-w-3xl">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{rev.user?.name || 'Verified Customer'}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
              No reviews yet for this product. Be the first to review!
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-950">You Might Also Like</h2>
            <Link to="/catalog" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Explore More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
