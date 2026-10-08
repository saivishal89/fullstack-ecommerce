import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '@ecommerce/shared';
import { productApi } from '../api/services';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import {
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Headphones,
  Laptop,
  Gamepad2,
  Watch,
  Award,
} from 'lucide-react';

import { fallbackCategories, fallbackProducts } from '../data/mockData';

export const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>(fallbackProducts);
  const [trending, setTrending] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [featuredRes, trendingRes, catRes] = await Promise.all([
          productApi.getFeatured().catch(() => fallbackProducts),
          productApi.getTrending().catch(() => fallbackProducts.slice().reverse()),
          productApi.getCategories().catch(() => fallbackCategories),
        ]);
        setFeatured(Array.isArray(featuredRes) && featuredRes.length > 0 ? featuredRes : fallbackProducts);
        setTrending(Array.isArray(trendingRes) && trendingRes.length > 0 ? trendingRes : fallbackProducts.slice().reverse());
        setCategories(Array.isArray(catRes) && catRes.length > 0 ? catRes : fallbackCategories);
      } catch (err) {
        console.error('Failed to load home page content', err);
        setFeatured(fallbackProducts);
        setTrending(fallbackProducts);
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(12,143,233,0.25),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Next-Generation Hardware & Lifestyle Essentials</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
                Engineered for <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-indigo-300">
                  Peak Performance.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover masterfully crafted technology, studio acoustics, and athletic performance gear. Verified authentic, backed by full warranties and rapid delivery.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/catalog"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/30 hover:scale-[1.02]"
                >
                  Explore Catalog
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/catalog?category=electronics"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition-all backdrop-blur-sm"
                >
                  View Electronics
                </Link>
              </div>

              <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Instant Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>100% Genuine Brands</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-tr from-slate-900 to-slate-800 p-2">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
                  alt="MacBook Pro Hero"
                  className="w-full h-80 object-cover rounded-2xl"
                />
                <div className="p-5 flex justify-between items-center bg-slate-900/80 backdrop-blur-md rounded-b-2xl border-t border-white/5">
                  <div>
                    <div className="text-xs uppercase font-bold text-brand-400">Featured Highlight</div>
                    <div className="text-sm font-bold text-white mt-0.5">MacBook Pro 16" M3 Max</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">From</div>
                    <div className="text-base font-extrabold text-white">$3,499.00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
              Curated Collections
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(categories || []).map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-elevated transition-all duration-300 bg-white p-4 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-slate-100 border border-slate-100 group-hover:scale-110 transition-transform">
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                Explore gear
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (featured || []).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* 4. Promotional Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between border border-slate-800">
            <div className="space-y-3 z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Limited Promo</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold">Next-Gen Audio Clarity</h3>
              <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
                Experience studio lossless spatial audio and active noise canceling with Sony & Bose.
              </p>
            </div>
            <div className="pt-6 z-10">
              <Link
                to="/catalog?category=audio"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Shop Audio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between border border-brand-900">
            <div className="space-y-3 z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">New Arrivals</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold">Elite Gaming Hardware</h3>
              <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
                Supercharge your gameplay with high-refresh rate displays, PS5 Pro, and precision keyboards.
              </p>
            </div>
            <div className="pt-6 z-10">
              <Link
                to="/catalog?category=gaming"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-colors"
              >
                Shop Gaming <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
              Trending Right Now
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : (trending || []).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
};
