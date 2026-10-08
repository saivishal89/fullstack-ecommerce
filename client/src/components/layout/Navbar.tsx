import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { cart, setIsOpen: setCartOpen } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const cartCount = cart?.totalQuantity || 0;
  const wishlistCount = wishlistItems.length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>FREE EXPRESS DELIVERY ON ORDERS OVER ₹999 — USE CODE <strong>WELCOME10</strong> FOR 10% OFF</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-8">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-2xl tracking-tighter text-slate-950 flex items-center">
              AURA<span className="text-brand-600">.</span>
            </span>
          </Link>

          {/* Primary Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <Link to="/catalog" className="hover:text-brand-600 transition-colors">All Products</Link>
            <Link to="/catalog?category=electronics" className="hover:text-brand-600 transition-colors">Electronics</Link>
            <Link to="/catalog?category=audio" className="hover:text-brand-600 transition-colors">Audio</Link>
            <Link to="/catalog?category=footwear" className="hover:text-brand-600 transition-colors">Footwear</Link>
            <Link to="/catalog?category=gaming" className="hover:text-brand-600 transition-colors">Gaming</Link>
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search by product, brand, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-full border border-transparent focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-full transition-colors relative"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag / Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-2.5 text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-full transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800"
                >
                  <span className="hidden sm:inline truncate max-w-[100px]">{user?.name}</span>
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                      {user?.name.charAt(0)}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl shadow-xl py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-semibold text-slate-900">{user?.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                    </div>

                    <Link
                      to="/account"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>

                    <Link
                      to="/account/orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-brand-700 hover:bg-brand-50 transition-colors font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-brand-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 text-sm text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-full border border-transparent focus:bg-white focus:border-slate-300 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-white z-50 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Browse Collections</h3>
            <div className="flex flex-col gap-3 font-semibold text-lg text-slate-800">
              <Link to="/catalog" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
              <Link to="/catalog?category=electronics" onClick={() => setMobileMenuOpen(false)}>Electronics</Link>
              <Link to="/catalog?category=audio" onClick={() => setMobileMenuOpen(false)}>Audio & Studio</Link>
              <Link to="/catalog?category=footwear" onClick={() => setMobileMenuOpen(false)}>Footwear</Link>
              <Link to="/catalog?category=gaming" onClick={() => setMobileMenuOpen(false)}>Gaming Pro</Link>
              <Link to="/catalog?category=fashion" onClick={() => setMobileMenuOpen(false)}>Fashion & Streetwear</Link>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Account Profile
                </Link>
                <Link
                  to="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-slate-700 font-medium"
                >
                  Order History
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-brand-600 font-semibold"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-rose-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-slate-900 text-white font-semibold"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
