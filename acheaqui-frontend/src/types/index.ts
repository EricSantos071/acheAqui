// ── src/types/index.ts ────────────────────────────────────────────────────────

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
  client_id: number;
  first_name: string;
  is_entrepreneur: boolean;
}

export interface CurrentUser {
  clients_id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_entrepreneur: boolean;
  entrepreneur_id: number | null;
}

// ── Registers ─────────────────────────────────────────────────────────────────

export interface Address {
  address_id: number;
  street: string;
  house_num: string;
  street_extra?: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
}

export interface Client {
  clients_id: number;
  first_name: string;
  last_name: string;
  doc_cpf: string;
  email: string;
  client_phone: string;
  birthdate: string;
  status: boolean;
  address_id: number | null;
  entrepreneur_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Entrepreneur {
  entrepreneurs_id: number;
  doc_cnpj: string;
  phone: string;
  store_name: string | null;   // ← added
  status: boolean;
  created_at: string;
  updated_at: string;
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export interface Category {
  category_id: number;
  category_name: string;
}

export interface Product {
  product_id: number;
  product_name: string;
  barcode: string;
  description: string;
  price: number;
  in_stock: number;
  status: boolean;
  entrepreneur_id: number;
  category_id: number | null;
  image_url?: string;
}

export interface ProductImage {
  product_img_id: number;
  image_url: string;
  product_id: number;
}

// ── Ordering ──────────────────────────────────────────────────────────────────

export interface CartItem {
  cart_id: number;
  quantity: number;
  total_value: number;
  product_id: number;
  client_id: number;
}

export interface Order {
  orders_id: number;
  order_total: number;
  status: boolean;
  client_id: number;
}

export interface Payment {
  payments_id: number;
  payment_method: string;
  payment_date: string;
  status: boolean;
  client_id: number;
  order_id: number;
}

export interface Promo {
  promos_id: number;
  promo_name: string;
  description: string;
  promo_value: number;
  start_date: string;
  end_date: string;
  status: boolean;
  entrepreneur_id: number;
  product_id: number;
  category_id: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface Review {
  reviews_id: number;
  rating: number;
  comment: string;
  review_date: string;
  product_id: number;
  client_id: number;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  avg_rating?: number;
}