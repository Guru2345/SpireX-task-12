import React, { useEffect } from 'react';
import { CartItem, OrderSummary, PromoCode } from '../types';
import { CartItemRow } from './CartItemRow';
import { CartSummary } from './CartSummary';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  summary: OrderSummary;
  appliedPromo?: PromoCode;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onApplyPromo: (code: string) => { success: boolean; message: string };
  onRemovePromo: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  summary,
  appliedPromo,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onApplyPromo,
  onRemovePromo,
  onCheckout,
}) => {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="cart-drawer-root" className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-neutral-50 shadow-2xl flex flex-col h-full border-l border-neutral-200"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-white border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-neutral-900 text-base">Shopping Cart</h2>
                    <span className="text-xs text-neutral-500">
                      {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in your cart
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {items.length > 0 && (
                    <button
                      id="clear-cart-button"
                      onClick={onClearCart}
                      className="text-xs font-medium text-neutral-400 hover:text-rose-600 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      title="Clear all items in cart"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                  <button
                    id="close-cart-drawer-button"
                    onClick={onClose}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="Close cart"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items List or Empty State */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-400">
                      <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800 text-base">
                        Your cart is empty
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                        Looks like you haven't added anything yet. Explore our curated selection and add your favorites!
                      </p>
                    </div>
                    <button
                      id="empty-cart-browse-btn"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartItemRow
                        key={item.product.id}
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemoveItem={onRemoveItem}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer Summary & Checkout */}
              {items.length > 0 && (
                <div className="p-4 sm:p-5 bg-white border-t border-neutral-200 shadow-xs">
                  <CartSummary
                    summary={summary}
                    appliedPromo={appliedPromo}
                    onApplyPromo={onApplyPromo}
                    onRemovePromo={onRemovePromo}
                    onCheckout={onCheckout}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
