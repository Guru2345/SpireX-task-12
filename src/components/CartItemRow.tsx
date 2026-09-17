import React from 'react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;
  const isAtMaxStock = quantity >= product.stock;

  const handleManualQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val <= 0) {
      onUpdateQuantity(product.id, 1);
    } else if (val > product.stock) {
      onUpdateQuantity(product.id, product.stock);
    } else {
      onUpdateQuantity(product.id, val);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      id={`cart-item-${product.id}`}
      className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex gap-3.5 items-center group"
    >
      {/* Product Thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200/60">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              {product.category}
            </span>
            <h4 className="text-sm font-semibold text-neutral-900 truncate leading-snug">
              {product.name}
            </h4>
          </div>
          <button
            id={`remove-cart-item-${product.id}`}
            onClick={() => onRemoveItem(product.id)}
            className="text-neutral-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
            title="Remove item from cart"
            aria-label={`Remove ${product.name} from cart`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
          {/* Quantity Controls */}
          <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 p-0.5">
            <button
              id={`cart-decrement-${product.id}`}
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              className="w-6 h-6 flex items-center justify-center rounded bg-white hover:bg-neutral-100 text-neutral-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
              aria-label={`Decrease ${product.name} quantity`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              id={`cart-qty-input-${product.id}`}
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={handleManualQuantityChange}
              className="w-8 text-center text-xs font-bold text-neutral-900 bg-transparent focus:outline-none"
              aria-label={`${product.name} quantity`}
            />
            <button
              id={`cart-increment-${product.id}`}
              disabled={isAtMaxStock}
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className={`w-6 h-6 flex items-center justify-center rounded transition-all shadow-2xs ${
                isAtMaxStock
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 active:scale-95 cursor-pointer'
              }`}
              aria-label={`Increase ${product.name} quantity`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Price Calculation */}
          <div className="text-right">
            <div className="text-sm font-bold text-neutral-900">
              {formatCurrency(lineTotal)}
            </div>
            {quantity > 1 && (
              <div className="text-[11px] text-neutral-400">
                {quantity} × {formatCurrency(product.price)}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
