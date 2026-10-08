import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FileText,
  ArrowLeft,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { ToastContainer } from '../components/common/Toast';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Restricted Access</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            You do not have administrative privileges to access this console.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/users', icon: Users },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-white flex items-center gap-2">
            AURA <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-mono">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-850 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Store
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <h1 className="text-base font-bold text-slate-800">Management Console</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">Logged in as</span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full">
              {user?.email}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
