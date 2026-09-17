export interface Product {
  id: string;
  name: string;
  category: 'Tech' | 'Home' | 'Accessories' | 'Audio';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  stock: number;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PromoCode {
  code: string;
  label: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number; // e.g., 10 for 10%, 15 for $15 off
  minSubtotal: number;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  freeShippingThreshold: number;
  progressToFreeShipping: number;
  amountNeededForFreeShipping: number;
}

export interface CompletedOrder {
  orderId: string;
  date: string;
  items: CartItem[];
  summary: OrderSummary;
  appliedPromo?: PromoCode;
}
