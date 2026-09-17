import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils';
import { Star, Plus, Minus, Check, PackageCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isAtMaxStock = quantityInCart >= product.stock;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-300 overflow-hidden"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-100 p-4 text-center">
            <PackageCheck className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs font-medium">{product.name}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-neutral-900/90 backdrop-blur-md text-white rounded-lg shadow-xs">
              {product.badge}
            </span>
          )}
          {product.originalPrice && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-400 text-neutral-950 rounded-md shadow-xs">
              Save {formatCurrency(product.originalPrice - product.price)}
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-[11px] font-medium bg-white/90 backdrop-blur-md text-neutral-700 rounded-md border border-neutral-200/60 shadow-xs">
            {product.stock} in stock
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-neutral-700">{product.rating}</span>
              <span className="text-neutral-400 text-[11px]">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 className="font-semibold text-neutral-900 text-base leading-snug line-clamp-1 group-hover:text-neutral-950 transition-colors">
            {product.name}
          </h3>

          <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Cart Actions */}
        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-neutral-900">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400">Taxes calculated at checkout</span>
          </div>

          <div>
            {quantityInCart > 0 ? (
              <div className="flex items-center bg-neutral-100 rounded-xl p-1 border border-neutral-200 shadow-xs">
                <button
                  id={`decrement-btn-${product.id}`}
                  onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-neutral-50 text-neutral-700 flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                  aria-label={`Decrease quantity of ${product.name}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-neutral-900">
                  {quantityInCart}
                </span>
                <button
                  id={`increment-btn-${product.id}`}
                  disabled={isAtMaxStock}
                  onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shadow-2xs active:scale-95 ${
                    isAtMaxStock
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700 cursor-pointer'
                  }`}
                  aria-label={`Increase quantity of ${product.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <motion.button
                id={`add-to-cart-${product.id}`}
                whileTap={{ scale: 0.96 }}
                disabled={isOutOfStock}
                onClick={() => onAddToCart(product)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all shadow-xs cursor-pointer ${
                  isOutOfStock
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white active:bg-neutral-950'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
