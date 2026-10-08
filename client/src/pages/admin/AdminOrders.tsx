import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/services';
import { Order } from '@ecommerce/shared';
import { useToastStore } from '../../store/useToastStore';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  Eye,
  X,
  CreditCard,
  MapPin,
  Calendar,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const AdminOrders: React.FC = () => {
  const { addToast } = useToastStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  
  // Update Status Modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('PROCESSING');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrders({
        status: selectedStatus || undefined,
        search: search || undefined,
        limit: 50,
      });
      setOrders(res.data);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load orders from database' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const openStatusModal = (order: Order) => {
    setActiveOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setTrackingNumber('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    try {
      setUpdating(true);
      await adminApi.updateOrderStatus(
        activeOrder.id,
        newStatus,
        statusNote || undefined,
        trackingNumber || undefined
      );
      addToast({ type: 'success', message: `Order #${activeOrder.id.slice(-8)} updated to ${newStatus}` });
      setActiveOrder(null);
      await loadOrders();
    } catch (err: any) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Status update failed' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">Customer Orders</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track fulfillment lifecycle, capture payments, and record shipping tracking notes
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID or user email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 font-medium"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={loadOrders}
            title="Refresh database records"
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders found matching filter criteria
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      #{o.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {o.user?.name || 'Customer'}
                      </div>
                      <div className="text-[10px] text-slate-400">{o.user?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.paymentStatus === 'FAILED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                      ${o.totalAmount.toFixed(2)}
                      <span className="text-[10px] font-normal text-slate-400 block">
                        {o.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                          STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openStatusModal(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-[11px] hover:bg-slate-800 transition shadow-sm"
                      >
                        <Eye className="w-3 h-3" /> Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Order Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Manage Order #{activeOrder.id.slice(-8).toUpperCase()}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Items List */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
                  Order Items ({activeOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {activeOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[10px] text-slate-500">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-extrabold text-slate-900">
                        ${item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Financials */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">${activeOrder.subtotal.toFixed(2)}</span>
                </div>
                {activeOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-bold">-${activeOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-slate-900">${activeOrder.shippingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount</span>
                  <span className="font-bold text-slate-900">${activeOrder.taxAmount.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-950 font-extrabold text-sm">
                  <span>Grand Total</span>
                  <span className="text-brand-600">${activeOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Update Fulfillment & Timeline
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Transition</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tracking Number (if Shipped)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. TRK-9831928471-US"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Timeline Audit Note
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Package dispatched from distribution hub via express carrier"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveOrder(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition disabled:opacity-50 shadow-sm"
                  >
                    {updating ? 'Updating...' : 'Save & Append to Timeline'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
