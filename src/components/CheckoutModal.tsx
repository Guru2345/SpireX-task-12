import React from 'react';
import { CompletedOrder } from '../types';
import { formatCurrency } from '../utils';
import { CheckCircle2, Package, X, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  order: CompletedOrder | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  order,
  onClose,
  onNewOrder,
}) => {
  if (!order) return null;

  return (
    <AnimatePresence>
      <div id="checkout-modal-backdrop" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-neutral-900 text-white p-6 relative">
            <button
              id="close-checkout-modal-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3.5 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold tracking-tight">Order Placed Successfully!</h2>
            <p className="text-xs text-neutral-300 mt-1">
              Thank you for testing the Shopping Cart demo. Your simulated receipt is ready below.
            </p>

            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-300">
              <span>Order ID: <strong className="text-white">{order.orderId}</strong></span>
              <span>{order.date}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Delivery Info Box */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-3 text-xs">
              <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800">Estimated Delivery: 2-3 Business Days</p>
                <p className="text-neutral-500 text-[11px]">Free standard tracked shipping with notification updates</p>
              </div>
            </div>

            {/* Purchased Items List */}
            <div>
              <h4 className="text-xs uppercase font-bold text-neutral-400 tracking-wider mb-2.5">
                Purchased Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
              </h4>
              <div className="divide-y divide-neutral-100 border border-neutral-200/80 rounded-2xl overflow-hidden bg-neutral-50/50">
                {order.items.map((item) => (
                  <div key={item.product.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-neutral-200/60"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-neutral-900 truncate">{item.product.name}</p>
                        <p className="text-neutral-500 text-[11px]">
                          Qty: {item.quantity} × {formatCurrency(item.product.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900 shrink-0">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(order.summary.subtotal)}
                </span>
              </div>
              {order.summary.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount {order.appliedPromo ? `(${order.appliedPromo.code})` : ''}</span>
                  <span>-{formatCurrency(order.summary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="font-semibold text-neutral-900">
                  {order.summary.shipping === 0 ? 'FREE' : formatCurrency(order.summary.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Estimated Tax</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(order.summary.tax)}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-neutral-950">Total Paid</span>
                <span className="text-lg font-bold text-neutral-950">
                  {formatCurrency(order.summary.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              id="new-order-btn"
              onClick={onNewOrder}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Shop Again & Reset Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
