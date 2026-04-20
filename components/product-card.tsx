"use client"

import { ShoppingCart, Check, Sparkles, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import type { Product } from "@/lib/store-data"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  const isInCart = items.some((item) => item.product.id === product.id)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Badge */}
      {product.badge && (
        <div className="absolute left-3 top-3 z-10">
          <Badge
            className={`${
              product.isBundle
                ? "bg-primary text-primary-foreground"
                : "bg-foreground text-background"
            }`}
          >
            {product.isBundle && <Sparkles className="mr-1 h-3 w-3" />}
            {product.badge}
          </Badge>
        </div>
      )}

      {/* Low Stock Warning */}
      {product.stock < 10 && product.stock > 0 && (
        <div className="absolute right-3 top-3 z-10">
          <Badge variant="outline" className="border-warning text-warning">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Quedan {product.stock}
          </Badge>
        </div>
      )}

      {/* Image Placeholder */}
      <div className="relative aspect-square bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-secondary/50" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        {/* Benefits */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.benefits.slice(0, 3).map((benefit) => (
            <span
              key={benefit}
              className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              <Check className="mr-1 h-3 w-3 text-primary" />
              {benefit}
            </span>
          ))}
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="text-2xl font-bold text-foreground">
              ${product.price.toLocaleString()} MXN
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                ${product.originalPrice.toLocaleString()} MXN
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={isInCart ? "secondary" : "default"}
            onClick={() => addItem(product)}
            className="gap-2"
          >
            {isInCart ? (
              <>
                <Check className="h-4 w-4" />
                Añadido
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Añadir
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
