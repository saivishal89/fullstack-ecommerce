import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login({ email, password });
      addToast({ type: 'success', title: 'Welcome back!', message: 'Signed in successfully' });
      navigate(redirect);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Login failed', message: err.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@store.com');
      setPassword('Admin@123456');
    } else {
      setEmail('john@store.com');
      setPassword('User@123456');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-elevated">
        <div className="text-center">
          <Link to="/" className="text-3xl font-extrabold tracking-tighter text-slate-950">
            AURA<span className="text-brand-600">.</span>
          </Link>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Sign in to your account</h2>
          <p className="mt-1 text-xs text-slate-500">
            Access your order history, saved bag, and express checkout.
          </p>
        </div>

        {/* Quick Demo Credentials Autofill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Demo Quick Access (Development):</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('user')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-[11px] font-semibold text-slate-800 transition-colors"
            >
              Customer (john@store.com)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-[11px] font-semibold text-brand-700 transition-colors"
            >
              Admin (admin@store.com)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-3.5 py-3 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-3.5 py-3 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-brand-600 disabled:bg-slate-400 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to={`/register?redirect=${redirect}`} className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
