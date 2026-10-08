import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { orderApi } from '../api/services';
import { Order } from '@ecommerce/shared';
import { CheckCircle2, Package, ArrowRight, Truck, MapPin } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const initialOrder = (location.state as any)?.order;

  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);

  useEffect(() => {
    async function fetchOrder() {
      if (!id || initialOrder) return;
      try {
        setLoading(true);
        const data = await orderApi.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, initialOrder]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading order confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Order not found</h2>
        <Link to="/" className="mt-4 inline-block px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  const shippingSnapshot = (order as any).parsedShippingAddress || (order.shippingAddressSnapshot ? JSON.parse(order.shippingAddressSnapshot) : null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-in fade-in">
      {/* Success Badge Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950">Thank you for your order!</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          We’ve received your order and our fulfillment team has started preparing it for shipment.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Order Reference</div>
            <div className="text-lg font-mono font-bold text-slate-900">{order.orderNumber}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono">
              Status: {order.status}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Shipping address details */}
        {shippingSnapshot && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-600">
              <span className="font-bold text-slate-900">Shipping to:</span> {shippingSnapshot.fullName}<br />
              {shippingSnapshot.street}, {shippingSnapshot.city}, {shippingSnapshot.state} {shippingSnapshot.postalCode}, {shippingSnapshot.country}
            </div>
          </div>
        )}

        {/* Purchased Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Items Ordered</h3>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{item.productName}</span>
                  <span className="text-slate-400 ml-2">× {item.quantity}</span>
                </div>
                <span className="font-bold text-slate-900">${item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">${order.subtotal.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount</span>
              <span>-${order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>{order.shippingAmount === 0 ? 'FREE' : `$${order.shippingAmount.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Sales Tax</span>
            <span>${order.taxAmount.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-950">
            <span>Total Paid</span>
            <span className="text-lg text-brand-600">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/account/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold transition-colors shadow-sm"
        >
          <Package className="w-4 h-4" /> View Order History
        </Link>
        <Link
          to="/catalog"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-sm"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
