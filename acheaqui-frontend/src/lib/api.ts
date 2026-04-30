// ── src/lib/api.ts ────────────────────────────────────────────────────────────
// Central API layer — every call to the FastAPI backend goes through here.
// Essentially: the backend code but in TypeScript
// This means if your API URL changes, you change it in ONE place.
//
// Pattern:
//   - Each function maps to one backend endpoint
//   - Throws an Error with the detail message if the response is not ok
//   - Returns typed data matching src/types/index.ts

import { authHeader } from "@/lib/auth";
import type {
  LoginResponse,
  CurrentUser,
  Product,
  ProductImage,
  Category,
  CartItem,
  Order,
  Payment,
  Review,
  PaginatedResponse,
} from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ── Helper: handle response errors consistently ────────────────────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(err.detail || `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

export async function login(email: string, password: string): Promise<LoginResponse> {
  // OAuth2 requires form-encoded body, not JSON
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return handleResponse<LoginResponse>(res);
}

export async function register(data: {
  first_name: string;
  last_name: string;
  doc_cpf: string;
  email: string;
  client_phone: string;
  birthdate: string;
  password: string;
}): Promise<CurrentUser> {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<CurrentUser>(res);
}

export async function registerEntrepreneur(data: {
  doc_cnpj: string;
  phone: string;
}): Promise<{ message: string; entrepreneur_id: number }> {
  const res = await fetch(`${API}/auth/register/entrepreneur`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Updated getMe — accepts optional token parameter
export async function getMe(token?: string): Promise<CurrentUser> {
  const res = await fetch(`${API}/me`, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : authHeader(),
  });
  return handleResponse<CurrentUser>(res);
}

// ══════════════════════════════════════════════════════════════════════════════
// INVENTORY — PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  status?: boolean;
  min_price?: number;
  max_price?: number;
  entrepreneur_id?: number;
}): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.search) query.set("search", params.search);
  if (params?.category_id) query.set("category_id", params.category_id.toString());
  if (params?.status !== undefined) query.set("status", params.status.toString());
  if (params?.min_price) query.set("min_price", params.min_price.toString());
  if (params?.max_price) query.set("max_price", params.max_price.toString());
  if (params?.entrepreneur_id) query.set("entrepreneur_id", params.entrepreneur_id.toString());

  const res = await fetch(`${API}/inventory/products?${query.toString()}`);
  return handleResponse<PaginatedResponse<Product>>(res);
}

export async function getProduct(product_id: number): Promise<Product> {
  const res = await fetch(`${API}/inventory/products/${product_id}`);
  return handleResponse<Product>(res);
}

export async function getProductImages(product_id: number): Promise<ProductImage[]> {
  const res = await fetch(`${API}/inventory/product_images/${product_id}`);
  return handleResponse<ProductImage[]>(res);
}

export async function uploadProductImage(
  product_id: number,
  file: File
): Promise<ProductImage> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/inventory/products/${product_id}/upload`, {
    method: "POST",
    headers: authHeader(),
    body: form,
  });
  return handleResponse<ProductImage>(res);
}

export async function createProduct(data: Omit<Product, "product_id">): Promise<Product> {
  const res = await fetch(`${API}/inventory/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse<Product>(res);
}

export async function updateProduct(
  product_id: number,
  data: Partial<Product>
): Promise<Product> {
  const res = await fetch(`${API}/inventory/products/${product_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse<Product>(res);
}

export async function deleteProduct(product_id: number): Promise<void> {
  const res = await fetch(`${API}/inventory/products/${product_id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  return handleResponse(res);
}

// ══════════════════════════════════════════════════════════════════════════════
// INVENTORY — CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════

export async function getCategories(): Promise<PaginatedResponse<Category>> {
  const res = await fetch(`${API}/inventory/category?limit=100`);
  return handleResponse<PaginatedResponse<Category>>(res);
}

// export async function createCategory(category_name: string): Promise<Category> {
//   const res = await fetch(`${API}/inventory/category`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...authHeader() },
//     body: JSON.stringify({ category_name }),
//   });
//   return handleResponse<Category>(res);
// }

// ══════════════════════════════════════════════════════════════════════════════
// ORDERING — CART
// ══════════════════════════════════════════════════════════════════════════════

export async function getCart(): Promise<CartItem[]> {
  const res = await fetch(`${API}/ordering/cart`, {
    headers: authHeader(),
  });
  return handleResponse<CartItem[]>(res);
}

export async function addToCart(data: {
  product_id: number;
  quantity: number;
  total_value: number;
}): Promise<CartItem> {
  const res = await fetch(`${API}/ordering/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse<CartItem>(res);
}

export async function updateCartItem(
  cart_id: number,
  data: { quantity?: number; total_value?: number }
): Promise<CartItem> {
  const res = await fetch(`${API}/ordering/cart/${cart_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse<CartItem>(res);
}

export async function removeFromCart(cart_id: number): Promise<void> {
  const res = await fetch(`${API}/ordering/cart/${cart_id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  return handleResponse(res);
}

// ══════════════════════════════════════════════════════════════════════════════
// ORDERING — ORDERS
// ══════════════════════════════════════════════════════════════════════════════

export async function getOrders(params?: {
  page?: number;
  status?: boolean;
}): Promise<PaginatedResponse<Order>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.status !== undefined) query.set("status", params.status.toString());
  const res = await fetch(`${API}/ordering/orders?${query.toString()}`, {
    headers: authHeader(),
  });
  return handleResponse<PaginatedResponse<Order>>(res);
}

export async function createOrder(data: {
  order_total: number;
  status: boolean;
}): Promise<Order> {
  const res = await fetch(`${API}/ordering/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse<Order>(res);
}

// ══════════════════════════════════════════════════════════════════════════════
// ORDERING — PAYMENTS
// ══════════════════════════════════════════════════════════════════════════════

export async function createPayment(data: {
  payment_method: string;
  payment_date: string;
  status: boolean;
  order_id: number;
}): Promise<Payment> {
  const res = await fetch(`${API}/ordering/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse<Payment>(res);
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS — REVIEWS
// ══════════════════════════════════════════════════════════════════════════════

export async function getReviews(params?: {
  product_id?: number;
  min_rating?: number;
  page?: number;
}): Promise<PaginatedResponse<Review>> {
  const query = new URLSearchParams();
  if (params?.product_id) query.set("product_id", params.product_id.toString());
  if (params?.min_rating) query.set("min_rating", params.min_rating.toString());
  if (params?.page) query.set("page", params.page.toString());
  const res = await fetch(`${API}/analytics/reviews?${query.toString()}`);
  return handleResponse<PaginatedResponse<Review>>(res);
}

export async function createReview(data: {
  rating: number;
  comment: string;
  review_date: string;
  product_id: number;
}): Promise<Review> {
  const res = await fetch(`${API}/analytics/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse<Review>(res);
}

// ══════════════════════════════════════════════════════════════════════════════
// REGISTERS — ENTREPRENEUR
// ══════════════════════════════════════════════════════════════════════════════

export async function getEntrepreneur(entrepreneur_id: number) {
  const res = await fetch(`${API}/registers/entrepreneurs/${entrepreneur_id}`);
  return handleResponse(res);
}

// ══════════════════════════════════════════════════════════════════════════════
// Store Pagination — ENTREPRENEUR
// ══════════════════════════════════════════════════════════════════════════════

export async function getEntrepreneurs(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: Entrepreneur[]; total: number; pages: number }> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  const res = await fetch(`${API}/registers/entrepreneurs?${query.toString()}`);
  return handleResponse(res);
}