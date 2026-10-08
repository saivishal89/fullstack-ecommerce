import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category, Brand } from '@ecommerce/shared';
import { productApi } from '../api/services';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import {
  SlidersHorizontal,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Check,
} from 'lucide-react';

import { fallbackCategories, fallbackProducts } from '../data/mockData';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: fallbackProducts.length, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  // Filter state
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const search = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sortBy') as any) || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true';

  const [localSearch, setLocalSearch] = useState(search);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync search input if URL changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Load static filter data
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, brs] = await Promise.all([
          productApi.getCategories().catch(() => fallbackCategories),
          productApi.getBrands().catch(() => []),
        ]);
        setCategories(Array.isArray(cats) && cats.length > 0 ? cats : fallbackCategories);
        setBrands(Array.isArray(brs) ? brs : []);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  // Load products based on query parameters
  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const res = await productApi.getProducts({
          page,
          limit: 12,
          category: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          search: search || undefined,
          sortBy,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          inStock: inStock ? true : undefined,
        });

        if (res && Array.isArray(res.data)) {
          setProducts(res.data);
          setPagination(res.pagination || { page: 1, limit: 12, total: res.data.length, totalPages: 1 });
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err) {
        console.error('Failed to load products', err);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [searchParams, selectedCategory, selectedBrand, search, sortBy, minPrice, maxPrice, inStock]);

  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to first page
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', localSearch.trim() || null);
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedBrand || search || minPrice || maxPrice || inStock
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {pagination.total} high-grade products
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mobile Filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && '(Active)'}
          </button>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-48 sm:w-64 bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-8 pr-4 py-2.5 rounded-xl border border-transparent focus:border-slate-300 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </form>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-300 shadow-sm"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 pr-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              Filter Catalog
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2 border-t border-slate-200/80 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter('category', null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  !selectedCategory ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter('category', selectedCategory === c.slug ? null : c.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === c.slug
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2 border-t border-slate-200/80 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Brand</h3>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter('brand', null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  !selectedBrand ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Brands</span>
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateFilter('brand', selectedBrand === b.slug ? null : b.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedBrand === b.slug
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Availability */}
          <div className="border-t border-slate-200/80 pt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid & States */}
        <div className="lg:col-span-3">
          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-slate-400">Active filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
                  Category: {selectedCategory}
                  <button onClick={() => updateFilter('category', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
                  Brand: {selectedBrand}
                  <button onClick={() => updateFilter('brand', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
                  Search: "{search}"
                  <button onClick={() => updateFilter('search', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStock && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium">
                  In Stock Only
                  <button onClick={() => updateFilter('inStock', null)}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid list */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center my-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                We couldn't find any products matching your selected criteria. Try adjusting or clearing your filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2 pt-6 border-t border-slate-200">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => updateFilter('page', String(pagination.page - 1))}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                    const p = idx + 1;
                    const isCurrent = p === pagination.page;
                    return (
                      <button
                        key={p}
                        onClick={() => updateFilter('page', String(p))}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => updateFilter('page', String(pagination.page + 1))}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
