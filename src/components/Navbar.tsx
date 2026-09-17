import React from 'react';
import { ShoppingBag, Search, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils';

interface NavbarProps {
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartSubtotal,
  onOpenCart,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-neutral-200/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-lg text-neutral-900 leading-tight">
                ModernGoods
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                Cart Demo
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden sm:block">
              Curated everyday essentials
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="catalog-search-input"
              type="text"
              placeholder="Search products, tech, audio..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 hover:bg-neutral-150/80 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-xl border border-transparent focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 hover:text-neutral-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Cart Trigger */}
        <div className="flex items-center gap-2">
          <button
            id="open-cart-button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm transition-all shadow-sm active:scale-[0.98]"
            aria-label={`Open shopping cart with ${cartCount} items`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span
                  id="cart-badge-count"
                  className="absolute -top-2 -right-2 bg-amber-400 text-neutral-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-neutral-900 animate-in zoom-in-50 duration-200"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-semibold">Cart</span>
            {cartSubtotal > 0 && (
              <span className="hidden md:inline text-neutral-300 pl-1 border-l border-neutral-700 text-xs">
                {formatCurrency(cartSubtotal)}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
