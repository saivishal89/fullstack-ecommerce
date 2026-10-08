import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/services';
import { Order } from '@ecommerce/shared';
import { useToastStore } from '../../store/useToastStore';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  XCircle,
  Eye,
  X,
  AlertTriangle,
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export const OrdersPage: React.FC = () => {
  const { addToast } = useToastStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await orderApi.getUserOrders();
        setOrders(data);
      } catch (err: any) {
        addToast({ type: 'error', message: err.message });
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
    try {
      await orderApi.cancelOrder(orderId);
      addToast({ type: 'success', message: 'Order has been cancelled successfully' });
      const updated = await orderApi.getUserOrders();
      setOrders(updated);
      setSelectedOrder(null);
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to cancel order' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Delivered</span>;
      case 'SHIPPED':
        return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Shipped</span>;
      case 'PROCESSING':
        return <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">Processing</span>;
      case 'CONFIRMED':
        return <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">Confirmed</span>;
      case 'CANCELLED':
        return <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">Cancelled</span>;
      default:
        return <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">My Orders</h1>
        <p className="text-xs text-slate-500 mt-1">Track status, shipments, and review past purchases</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No orders yet</h2>
          <p className="text-xs text-slate-500">Your purchases will appear here once you place an order.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="text-xs text-slate-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                    {order.orderNumber}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 text-slate-600 hover:text-brand-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="View Timeline & Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items Summary */}
              <div className="divide-y divide-slate-50">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product?.images?.[0]?.url}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                      />
                      <span className="font-semibold text-slate-800">{item.productName} × {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatINR(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Standard Delivery'}
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 mr-2">Total Amount:</span>
                  <span className="text-base font-extrabold text-slate-950">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Tracking & Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs uppercase font-bold text-brand-600">Timeline & Tracking</span>
                <h2 className="text-lg font-bold text-slate-900">{selectedOrder.orderNumber}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fulfillment Timeline
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedOrder.statusHistory?.map((step, idx) => (
                  <div key={step.id || idx} className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">{step.status}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{step.note}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(step.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel order button if pending */}
            {['PENDING', 'CONFIRMED'].includes(selectedOrder.status) && (
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500">Need to make adjustments?</span>
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
