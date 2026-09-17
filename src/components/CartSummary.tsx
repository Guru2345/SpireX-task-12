import React, { useState } from 'react';
import { OrderSummary, PromoCode } from '../types';
import { AVAILABLE_PROMOS } from '../data/products';
import { formatCurrency } from '../utils';
import { Tag, Check, ArrowRight, Truck, Info, Percent } from 'lucide-react';

interface CartSummaryProps {
  summary: OrderSummary;
  appliedPromo?: PromoCode;
  onApplyPromo: (code: string) => { success: boolean; message: string };
  onRemovePromo: () => void;
  onCheckout: () => void;
  disabled?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  summary,
  appliedPromo,
  onApplyPromo,
  onRemovePromo,
  onCheckout,
  disabled = false,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const res = onApplyPromo(promoInput);
    if (res.success) {
      setPromoFeedback({ type: 'success', message: res.message });
      setPromoInput('');
    } else {
      setPromoFeedback({ type: 'error', message: res.message });
    }
  };

  const handleQuickApplyPromo = (code: string) => {
    const res = onApplyPromo(code);
    if (res.success) {
      setPromoFeedback({ type: 'success', message: res.message });
    } else {
      setPromoFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div id="cart-summary-section" className="space-y-4">
      {/* Free Shipping Progress Indicator */}
      <div className="p-3.5 rounded-xl bg-neutral-100/90 border border-neutral-200/80 text-xs">
        <div className="flex items-center justify-between font-medium text-neutral-800 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-neutral-600" />
            <span>
              {summary.amountNeededForFreeShipping <= 0
                ? 'You unlocked Free Shipping!'
                : `Add ${formatCurrency(summary.amountNeededForFreeShipping)} more for Free Shipping`}
            </span>
          </div>
          <span className="font-bold text-neutral-600">
            {Math.round(summary.progressToFreeShipping)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
          <div
            className="h-full bg-neutral-900 rounded-full transition-all duration-500"
            style={{ width: `${summary.progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Promo Code Input & Chips */}
      <div className="pt-1">
        {appliedPromo ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <div className="flex items-center gap-2 font-medium">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Promo <strong className="font-bold">{appliedPromo.code}</strong> applied ({appliedPromo.label})
              </span>
            </div>
            <button
              id="remove-promo-button"
              onClick={() => {
                onRemovePromo();
                setPromoFeedback({ type: null, message: '' });
              }}
              className="text-emerald-700 hover:text-emerald-950 font-semibold underline text-xs cursor-pointer ml-2"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handlePromoSubmit} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="promo-code-input"
                  type="text"
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoFeedback({ type: null, message: '' });
                  }}
                  className="w-full pl-8.5 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 uppercase font-mono tracking-wider font-semibold placeholder:normal-case placeholder:font-sans placeholder:font-normal"
                />
              </div>
              <button
                id="apply-promo-button"
                type="submit"
                disabled={!promoInput.trim() || disabled}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

            {promoFeedback.message && (
              <p
                className={`text-[11px] font-medium flex items-center gap-1 ${
                  promoFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                <Info className="w-3 h-3 shrink-0" />
                <span>{promoFeedback.message}</span>
              </p>
            )}

            {/* Suggested codes pill */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                Try:
              </span>
              {AVAILABLE_PROMOS.map((promo) => (
                <button
                  key={promo.code}
                  type="button"
                  onClick={() => handleQuickApplyPromo(promo.code)}
                  className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                  title={`Apply ${promo.label}`}
                >
                  {promo.code}
                </button>
              ))}
            </div>
          </form>
        )}
      </div>

      {/* Calculations Breakdown */}
      <div className="pt-3 border-t border-neutral-200/80 space-y-2 text-xs">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span className="font-semibold text-neutral-900" id="summary-subtotal">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3" />
              Discount {appliedPromo ? `(${appliedPromo.code})` : ''}
            </span>
            <span id="summary-discount">-{formatCurrency(summary.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-neutral-600">
          <span className="flex items-center gap-1">
            Shipping
            {summary.shipping === 0 && (
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                (Free)
              </span>
            )}
          </span>
          <span className="font-semibold text-neutral-900" id="summary-shipping">
            {summary.shipping === 0 ? 'FREE' : formatCurrency(summary.shipping)}
          </span>
        </div>

        <div className="flex justify-between text-neutral-600">
          <span>Estimated Sales Tax (8.25%)</span>
          <span className="font-semibold text-neutral-900" id="summary-tax">
            {formatCurrency(summary.tax)}
          </span>
        </div>

        <div className="pt-3 border-t border-neutral-300/80 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-bold text-neutral-900">Total Price</span>
            <p className="text-[11px] text-neutral-400">All fees included</p>
          </div>
          <span className="text-xl font-bold text-neutral-950" id="summary-grand-total">
            {formatCurrency(summary.total)}
          </span>
        </div>
      </div>

      {/* Checkout button */}
      <button
        id="proceed-checkout-button"
        disabled={disabled || summary.subtotal <= 0}
        onClick={onCheckout}
        className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
