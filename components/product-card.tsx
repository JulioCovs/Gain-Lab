"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
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
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    let timeoutId: number | undefined
    if (isAdding) {
      timeoutId = window.setTimeout(() => setIsAdding(false), 1200)
    }
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [isAdding])

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem(product)
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("cart:item-added"))
    }, 350)
  }

  return (
    <div className="group relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
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
      {product.stock > 0 && product.stock < 5 && (
        <div className="absolute bottom-3 left-3 z-10">
          <Badge variant="secondary" className="bg-foreground/90 text-background">
            ¡Ultimas unidades!
          </Badge>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={product.image}
          alt={`${product.name} suplemento premium Gain Lab`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        {/* Benefits */}
        <div className="mt-4 flex flex-wrap gap-1.5">
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
        <div className="mt-auto flex items-end justify-between pt-6">
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
            variant={isAdding || isInCart ? "secondary" : "default"}
            onClick={handleAddToCart}
            className="gap-2"
          >
            {isAdding ? (
              <>
                <Check className="h-4 w-4" />
                Agregado
              </>
            ) : isInCart ? (
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
