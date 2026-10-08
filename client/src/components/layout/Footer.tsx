import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 mt-auto border-t border-slate-900">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-slate-850">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Free Express Shipping</div>
              <div className="text-xs text-slate-400">On all orders above $150</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Secure Encrypted Pay</div>
              <div className="text-xs text-slate-400">PCI-DSS Level 1 compliant</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">30-Day Easy Returns</div>
              <div className="text-xs text-slate-400">Zero hassle refund guarantee</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">24/7 Concierge Support</div>
              <div className="text-xs text-slate-400">Dedicated assistance anytime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="text-2xl font-extrabold tracking-tighter text-white">
              AURA<span className="text-brand-500">.</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Curated premium gear engineered for creators, athletes, and modern pioneers. Experience unmatched quality, precision craft, and intelligent design.
            </p>
            {/* Newsletter */}
            <div className="pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Join our Insider Circle
              </div>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you for subscribing! Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-sm text-white px-3.5 py-2.5 rounded-l-xl focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-r-xl transition-colors flex items-center justify-center"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Catalog links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Shop Collections</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/catalog?category=electronics" className="hover:text-white transition-colors">Electronics & Computing</Link></li>
              <li><Link to="/catalog?category=audio" className="hover:text-white transition-colors">Studio & Hi-Fi Audio</Link></li>
              <li><Link to="/catalog?category=footwear" className="hover:text-white transition-colors">Performance Footwear</Link></li>
              <li><Link to="/catalog?category=gaming" className="hover:text-white transition-colors">Esports & Gaming</Link></li>
              <li><Link to="/catalog?category=fashion" className="hover:text-white transition-colors">Modern Apparel</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/account/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition-colors">Shipping Rates & Policies</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition-colors">Warranty & Service</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition-colors">Help Center & FAQ</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">About AURA</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Security Overview</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>© 2026 AURA Inc. All rights reserved. Built for high-volume enterprise e-commerce.</div>
        <div className="flex gap-6">
          <span>Stripe Certified</span>
          <span>PostgreSQL Verified</span>
          <span>Zero Plaintext Passwords</span>
        </div>
      </div>
    </footer>
  );
};
