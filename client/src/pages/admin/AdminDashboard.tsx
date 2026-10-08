import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/services';
import { AdminAnalyticsDto } from '@ecommerce/shared';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await adminApi.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="text-xs text-slate-500">Loading live analytics from database...</div>;
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-950">Store Analytics Overview</h2>
        <p className="text-xs text-slate-500 mt-1">
          Aggregated in real-time from active PostgreSQL/SQLite database records
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</div>
            <div className="text-2xl font-extrabold text-slate-950 mt-1">
              {formatINR(analytics.totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Real captured payments
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-xl flex items-center justify-center shrink-0">
            ₹
          </div>
        </div>

        {/* Orders */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</div>
            <div className="text-2xl font-extrabold text-slate-950 mt-1">
              {analytics.totalOrders}
            </div>
            <div className="text-[11px] text-brand-600 font-semibold mt-1">
              {analytics.pendingOrdersCount} awaiting fulfillment
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Customers */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers</div>
            <div className="text-2xl font-extrabold text-slate-950 mt-1">
              {analytics.totalUsers}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Registered users</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Catalog Size */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalog Size</div>
            <div className="text-2xl font-extrabold text-slate-950 mt-1">
              {analytics.totalProducts}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {analytics.lowStockCount} low stock alerts
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales by Category Breakdown */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
            Revenue by Category
          </h3>
          <div className="space-y-3">
            {analytics.salesByCategory.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{cat.category}</span>
                  <span className="text-slate-900">{formatINR(cat.revenue)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (cat.revenue / (analytics.totalRevenue || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Warnings
            </h3>
            <Link to="/admin/products" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {analytics.lowStockProducts?.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-800 truncate max-w-[200px]">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold font-mono">
                  {p.stock} units left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
