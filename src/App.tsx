import React, { useState, useMemo, useEffect } from 'react';
import { Product, CartItem, OrderSummary, PromoCode, CompletedOrder } from './types';
import {
  INITIAL_PRODUCTS,
  AVAILABLE_PROMOS,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_RATE,
  ESTIMATED_TAX_RATE,
} from './data/products';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartItemRow } from './components/CartItemRow';
import { CartSummary } from './components/CartSummary';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  SlidersHorizontal,
  ShoppingBag,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';

const STORAGE_KEY_CART = 'shopping_cart_items_v1';
const STORAGE_KEY_PROMO = 'shopping_cart_promo_v1';

export default function App() {
  // Products state
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  // Cart state with localStorage initial load
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    // Default initial items for a lively preview experience
    return [
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[5], quantity: 2 },
    ];
  });

  // Promo code state with localStorage initial load
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | undefined>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMO);
      if (saved) {
        const found = AVAILABLE_PROMOS.find((p) => p.code === saved);
        if (found) return found;
      }
    } catch {
      // Fallback
    }
    return undefined;
  });

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Persist promo code to localStorage
  useEffect(() => {
    try {
      if (appliedPromo) {
        localStorage.setItem(STORAGE_KEY_PROMO, appliedPromo.code);
      } else {
        localStorage.removeItem(STORAGE_KEY_PROMO);
      }
    } catch {
      // ignore
    }
  }, [appliedPromo]);

  // Toast helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Maximum stock limit (${product.stock}) reached for this item`, 'error');
          return prev;
        }
        showToast(`Updated ${product.name} quantity to ${existing.quantity + 1}`, 'success');
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        showToast(`Added ${product.name} to cart`, 'success');
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clampedQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    const itemToRemove = cartItems.find((item) => item.product.id === productId);
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    if (itemToRemove) {
      showToast(`Removed ${itemToRemove.product.name} from cart`, 'info');
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedPromo(undefined);
    showToast('Cart cleared', 'info');
  };

  // Dynamic Price Calculations
  const orderSummary: OrderSummary = useMemo(() => {
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    // Calculate discount
    let discount = 0;
    if (appliedPromo && subtotal >= appliedPromo.minSubtotal) {
      if (appliedPromo.type === 'percentage') {
        discount = (subtotal * appliedPromo.value) / 100;
      } else if (appliedPromo.type === 'fixed') {
        discount = Math.min(appliedPromo.value, subtotal);
      }
    }

    // Shipping calculation
    const isFreeShippingByThreshold = subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0;
    const isFreeShippingByPromo = appliedPromo?.type === 'shipping';
    const shipping =
      subtotal === 0 || isFreeShippingByThreshold || isFreeShippingByPromo
        ? 0
        : STANDARD_SHIPPING_RATE;

    // Free shipping progress
    const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const progressToFreeShipping =
      subtotal >= FREE_SHIPPING_THRESHOLD
        ? 100
        : Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

    // Sales Tax calculation (on subtotal after discount)
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * ESTIMATED_TAX_RATE;

    // Total Price
    const total = Math.max(0, taxableAmount + shipping + tax);

    return {
      subtotal,
      shipping,
      discount,
      tax,
      total,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      progressToFreeShipping,
      amountNeededForFreeShipping,
    };
  }, [cartItems, appliedPromo]);

  // Apply promo code with validation
  const handleApplyPromo = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const promo = AVAILABLE_PROMOS.find((p) => p.code === trimmed);

    if (!promo) {
      return {
        success: false,
        message: `Promo code "${trimmed}" is not recognized. Try SAVE10, OFF25, or FREESHIP.`,
      };
    }

    if (orderSummary.subtotal < promo.minSubtotal) {
      return {
        success: false,
        message: `Promo "${promo.code}" requires a minimum order of $${promo.minSubtotal}. Current subtotal is $${orderSummary.subtotal.toFixed(2)}.`,
      };
    }

    setAppliedPromo(promo);
    showToast(`Promo code ${promo.code} applied!`, 'success');
    return {
      success: true,
      message: `Promo "${promo.code}" applied: ${promo.label}!`,
    };
  };

  const handleRemovePromo = () => {
    setAppliedPromo(undefined);
    showToast('Promo code removed', 'info');
  };

  // Checkout handling
  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const newOrder: CompletedOrder = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      items: [...cartItems],
      summary: { ...orderSummary },
      appliedPromo: appliedPromo ? { ...appliedPromo } : undefined,
    };

    setCompletedOrder(newOrder);
    setIsDrawerOpen(false);
  };

  const handleNewOrder = () => {
    setCompletedOrder(null);
    setCartItems([]);
    setAppliedPromo(undefined);
    showToast('Ready for your next shopping run!', 'info');
  };

  // Filtered & Sorted Catalog
  const categories = ['All', 'Tech', 'Audio', 'Home', 'Accessories'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured default
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Quick helper to check if a product is in cart
  const getProductQuantityInCart = (productId: string) => {
    const item = cartItems.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div id="app-root" className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Navigation */}
      <Navbar
        cartCount={totalCartCount}
        cartSubtotal={orderSummary.subtotal}
        onOpenCart={() => setIsDrawerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column: Product Catalog & Filters */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filter & Sort Bar */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`category-filter-${cat.toLowerCase()}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <label htmlFor="sort-dropdown" className="text-xs font-medium text-neutral-500">
                  Sort by:
                </label>
                <select
                  id="sort-dropdown"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating')
                  }
                  className="bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 text-neutral-800 text-xs rounded-xl px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900/10 cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Catalog Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                  Products ({filteredProducts.length})
                </h2>
                {searchQuery && (
                  <span className="text-xs text-neutral-400">
                    Results matching "{searchQuery}"
                  </span>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 mb-3">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 text-base">No products found</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Try adjusting your search query or selecting another category filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-4 px-3.5 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantityInCart={getProductQuantityInCart(product.id)}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Desktop Sticky Cart Panel */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-5 space-y-4">
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm">Shopping Cart</h3>
                    <p className="text-[11px] text-neutral-400">
                      {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {cartItems.length > 0 && (
                  <button
                    id="desktop-clear-cart-btn"
                    onClick={handleClearCart}
                    className="text-xs font-medium text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
                {cartItems.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-neutral-700 text-xs">Your cart is empty</p>
                    <p className="text-[11px] text-neutral-400 max-w-[180px] mx-auto">
                      Add items from the catalog to see live price calculations.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {cartItems.map((item) => (
                      <CartItemRow
                        key={item.product.id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Order Summary & Checkout */}
              {cartItems.length > 0 && (
                <div className="pt-2 border-t border-neutral-100">
                  <CartSummary
                    summary={orderSummary}
                    appliedPromo={appliedPromo}
                    onApplyPromo={handleApplyPromo}
                    onRemovePromo={handleRemovePromo}
                    onCheckout={handleCheckout}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Bar on Mobile/Tablet when items in cart */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-4 inset-x-4 z-40">
          <button
            id="mobile-bottom-cart-bar"
            onClick={() => setIsDrawerOpen(true)}
            className="w-full bg-neutral-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-neutral-800 cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span className="absolute -top-2 -right-2 bg-amber-400 text-neutral-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold block">View Cart</span>
                <span className="text-[11px] text-neutral-400">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-neutral-400 block">Total</span>
              <span className="text-sm font-bold text-white">
                {orderSummary.total > 0
                  ? `$${orderSummary.total.toFixed(2)}`
                  : '$0.00'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Mobile Slide-over Drawer */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        items={cartItems}
        summary={orderSummary}
        appliedPromo={appliedPromo}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onApplyPromo={handleApplyPromo}
        onRemovePromo={handleRemovePromo}
        onCheckout={handleCheckout}
      />

      {/* Checkout Order Confirmation Receipt Modal */}
      <CheckoutModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}
