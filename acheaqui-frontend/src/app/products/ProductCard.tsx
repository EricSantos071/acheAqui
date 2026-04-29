"use client";

// ── ProductCard.tsx ────────────────────────────────────────────────────────────
// Displays a single product in the grid.
// Receives product data as props — no fetching here.

import Link from "next/link";
import Image from "next/image";

export interface Product {
  product_id: number;
  product_name: string;
  description: string;
  price: number;
  in_stock: number;
  status: boolean;
  category_id: number | null;
  entrepreneur_id: number;
  barcode: string;
  // images come from a separate endpoint — optional here
  image_url?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  const isAvailable = product.status && product.in_stock > 0;

  return (
    <Link
      href={`/products/${product.product_id}`}
      className="group block"
    >
      <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full flex flex-col">

        {/* ── Product image ──────────────────────────────────────────────── */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.product_name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            // Placeholder when no image is uploaded yet
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span className="text-xs">Sem imagem</span>
            </div>
          )}

          {/* Stock badge */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground text-xs font-medium px-3 py-1 rounded-full">
                Esgotado
              </span>
            </div>
          )}
        </div>

        {/* ── Product info ───────────────────────────────────────────────── */}
        <div className="p-4 flex flex-col gap-2 flex-1">

          {/* Name */}
          <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.product_name}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-xs line-clamp-2 flex-1">
            {product.description}
          </p>

          {/* Price + stock */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
            <span className="text-primary font-semibold text-base">
              {formattedPrice}    
            </span>
              <Link
                href={`/loja/${product.entrepreneur_id}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Ver loja →
              </Link>
            {isAvailable && (
              <span className="text-muted-foreground text-xs">
                {product.in_stock} disponíveis
              </span>             
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}