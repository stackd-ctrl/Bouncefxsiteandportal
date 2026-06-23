export type Category = "inflatable" | "table" | "chair" | "tent" | "bundle";

export interface Product {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  category: Category;
  image_url: string;
  /** Additional photos beyond the primary `image_url`. */
  images?: string[];
  is_available: boolean;
  /** How many of this item Bounce FX owns (for quantity-aware availability). */
  quantity?: number;
  /** Footprint in feet [width, depth] — powers the space/fit checker. */
  footprint?: [number, number];
  created_at?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  event_type: string;
  city: string;
  date: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  product_ids: string[];
  bundle_price: number;
  individual_value: number;
  tier?: "bronze" | "silver" | "gold";
  /** Optional marketing flag shown as a corner badge, e.g. "Highly Requested". */
  badge?: string;
  highlights?: string[];
  /** Optional primary photo for the bundle. */
  image_url?: string;
  /** Additional bundle photos. */
  images?: string[];
  created_at?: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  product_ids: string[];
  event_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_address: string;
  event_type: string;
  special_requests: string | null;
  total_amount: number;
  deposit_amount: number;
  delivery_fee: number;
  stripe_payment_intent_id: string | null;
  status: BookingStatus;
  created_at: string;
}

export interface DeliveryQuote {
  miles: number;
  fee: number;
  free: boolean;
  origin: string;
  destination: string;
  estimated: boolean;
}
