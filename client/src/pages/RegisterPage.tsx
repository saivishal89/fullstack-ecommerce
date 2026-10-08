import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { register } = useAuthStore();
  const { addToast } = useToastStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, password, confirmPassword });
      addToast({
        type: 'success',
        title: 'Account created!',
        message: 'Welcome to AURA. Your account has been registered.',
      });
      navigate(redirect);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Registration failed', message: err.message || 'Error creating account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-elevated">
        <div className="text-center">
          <Link to="/" className="text-3xl font-extrabold tracking-tighter text-slate-950">
            AURA<span className="text-brand-600">.</span>
          </Link>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Create your account</h2>
          <p className="mt-1 text-xs text-slate-500">
            Join today to unlock insider perks, express checkout, and saved wishlists.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-3.5 py-3 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

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
                placeholder="Min. 6 chars with uppercase & number"
                className="w-full bg-slate-50 border border-slate-200 text-xs pl-10 pr-3.5 py-3 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
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
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to={`/login?redirect=${redirect}`} className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
