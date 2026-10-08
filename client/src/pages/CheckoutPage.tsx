import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Address, CartItem } from '@ecommerce/shared';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';
import { authApi, orderApi, paymentApi } from '../api/services';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Lock,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useAuthStore();
  const { cart, clearCart } = useCartStore();
  const { addToast } = useToastStore();

  const initialCoupon = (location.state as any)?.couponCode || '';

  // Stepper state: 1: Address, 2: Shipping, 3: Review, 4: Payment
  const [step, setStep] = useState(1);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: true,
  });

  // Shipping method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Coupon & Order Summary
  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'DEV_SIMULATOR' | 'COD' | 'STRIPE'>('DEV_SIMULATOR');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Load user addresses
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    async function loadAddresses() {
      try {
        const addrs = await authApi.getAddresses();
        setAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a: Address) => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAddresses();
  }, [isAuthenticated, navigate]);

  // Recalculate summary from server when address or coupon changes
  useEffect(() => {
    if (!selectedAddressId) return;

    async function fetchSummary() {
      try {
        setLoadingSummary(true);
        const res = await orderApi.getCheckoutSummary(selectedAddressId, couponCode || undefined);
        setSummary(res);
      } catch (err: any) {
        addToast({ type: 'error', message: err.message });
      } finally {
        setLoadingSummary(false);
      }
    }

    fetchSummary();
  }, [selectedAddressId, couponCode]);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await authApi.addAddress(newAddress);
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
      addToast({ type: 'success', message: 'Address saved successfully' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save address' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addToast({ type: 'error', message: 'Please select a shipping address' });
      setStep(1);
      return;
    }

    try {
      setIsProcessingOrder(true);

      let paymentIntentId: string | undefined;
      if (paymentMethod === 'STRIPE') {
        const intentRes = await paymentApi.createIntent(selectedAddressId, couponCode || undefined);
        paymentIntentId = intentRes.paymentIntentId;
      }

      const order = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: couponCode || undefined,
        paymentIntentId,
      });

      addToast({
        type: 'success',
        title: 'Order Placed!',
        message: `Order #${order.orderNumber} successfully confirmed`,
      });

      // Clear client cart store
      await clearCart();

      // Navigate to confirmation page
      navigate(`/order-confirmation/${order.id}`, { state: { order } });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Checkout Failed', message: err.message || 'Error processing order' });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const steps = [
    { num: 1, title: 'Address', icon: MapPin },
    { num: 2, title: 'Shipping', icon: Truck },
    { num: 3, title: 'Review', icon: CheckCircle2 },
    { num: 4, title: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Checkout Header & Stepper */}
      <div className="border-b border-slate-200 pb-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-slate-950">Secure Checkout</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        {/* Multi-Step Indicator */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <button
                key={s.num}
                onClick={() => isCompleted && setStep(s.num)}
                disabled={!isCompleted && !isCurrent}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-brand-600 bg-brand-50/40 text-brand-900 font-bold shadow-sm'
                    : isCompleted
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                    isCurrent
                      ? 'bg-brand-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-xs hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Step View */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Address Selection */}
          {step === 1 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                Select Delivery Address
              </h2>

              {!showNewAddressForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAddressId(a.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedAddressId === a.id
                            ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{a.fullName}</span>
                          {a.isDefault && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {a.street}<br />
                          {a.city}, {a.state} {a.postalCode}<br />
                          {a.country}
                        </div>
                        <div className="text-xs text-slate-400 mt-2 font-mono">{a.phone}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700 pt-2"
                  >
                    <Plus className="w-4 h-4" /> Add a new address
                  </button>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedAddressId}
                      className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-brand-600 disabled:bg-slate-300 text-white text-xs font-semibold transition-colors flex items-center gap-2"
                    >
                      Continue to Shipping <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* New Address Form */
                <form onSubmit={handleAddNewAddress} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: Shipping Method */}
          {step === 2 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-600" />
                Shipping Method
              </h2>

              <div className="space-y-3">
                <label
                  onClick={() => setShippingMethod('standard')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-brand-600 flex items-center justify-center p-0.5">
                      {shippingMethod === 'standard' && <div className="w-full h-full bg-brand-600 rounded-full" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Standard Insured Courier</div>
                      <div className="text-xs text-slate-500">Delivers in 3-5 business days</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {summary?.shippingAmount === 0 ? 'FREE' : '$10.00'}
                  </span>
                </label>

                <label
                  onClick={() => setShippingMethod('express')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-brand-600 flex items-center justify-center p-0.5">
                      {shippingMethod === 'express' && <div className="w-full h-full bg-brand-600 rounded-full" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Next-Day Priority Express</div>
                      <div className="text-xs text-slate-500">Guaranteed next business day dispatch</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">₹99</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  Review Order <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Review */}
          {step === 3 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                Review Order Items
              </h2>

              <div className="divide-y divide-slate-100">
                {cart?.items.map((item: CartItem) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product?.images?.[0]?.url}
                        alt={item.product?.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{item.product?.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Qty: {item.quantity} {item.variant ? `• ${item.variant.name}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {formatINR(((item.product?.price ?? 0) + (item.variant?.priceAdjustment ?? 0)) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment */}
          {step === 4 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-600" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Dev Simulator option */}
                <label
                  onClick={() => setPaymentMethod('DEV_SIMULATOR')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'DEV_SIMULATOR'
                      ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'DEV_SIMULATOR'}
                    onChange={() => {}}
                    className="mt-1 text-brand-600"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Instant Test Payment Simulator
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Dev Safe
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Instantly verifies transaction server-side without requiring live credit card details.
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery option */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => {}}
                    className="mt-1 text-brand-600"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Cash on Delivery (COD)</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Pay securely with cash or mobile terminal upon package arrival.
                    </div>
                  </div>
                </label>

                {/* Live Stripe Card Option */}
                <label
                  onClick={() => setPaymentMethod('STRIPE')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'STRIPE'
                      ? 'border-brand-600 bg-brand-50/30 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'STRIPE'}
                    onChange={() => {}}
                    className="mt-1 text-brand-600"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Stripe Payment Gateway</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Direct integration with Stripe PaymentIntents and Webhook verification.
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessingOrder}
                  className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-brand-600 disabled:bg-slate-400 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  {isProcessingOrder ? 'Confirming Order...' : `Pay ${formatINR(summary?.totalAmount)}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
              Summary Breakdown
            </h3>

            {loadingSummary ? (
              <div className="py-6 text-center text-xs text-slate-400">Updating calculations...</div>
            ) : summary ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({summary.itemCount} items)</span>
                  <span className="font-bold text-slate-900">{formatINR(summary.subtotal)}</span>
                </div>

                {summary.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({couponCode})</span>
                    <span>-{formatINR(summary.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-slate-900">
                    {summary.shippingAmount === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatINR(summary.shippingAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Applicable GST (18%)</span>
                  <span className="font-semibold text-slate-900">{formatINR(summary.taxAmount)}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-950">
                  <span>Total Amount</span>
                  <span className="text-xl text-brand-600">{formatINR(summary.totalAmount)}</span>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Prices verified directly against database</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
