"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingCart, Check, Sparkles, AlertTriangle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import { applyPercentageDiscount } from "@/lib/pricing"
import { useVipDiscountStore } from "@/lib/vip-discount-store"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/store-data"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  const { toast } = useToast()
  const isInCart = items.some((item) => item.product.id === product.id)
  const [isAdding, setIsAdding] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteBusy, setFavoriteBusy] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const vipDiscountPercentage = useVipDiscountStore((s) => s.discountPercentage)
  const hasVipDiscount = vipDiscountPercentage > 0
  const vipPrice = hasVipDiscount ? applyPercentageDiscount(product.price, vipDiscountPercentage) : product.price

  useEffect(() => {
    let isMounted = true
    const loadFavoriteState = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const currentUserId = session?.user?.id ?? null
      if (!isMounted) return
      setUserId(currentUserId)

      if (!currentUserId) {
        setIsFavorite(false)
        return
      }

      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", currentUserId)
        .eq("product_id", product.id)
        .maybeSingle()

      if (!isMounted) return
      setIsFavorite(Boolean(data))
    }

    void loadFavoriteState()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUserId = session?.user?.id ?? null
      if (!isMounted) return
      setUserId(nextUserId)

      if (!nextUserId) {
        setIsFavorite(false)
        return
      }

      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", nextUserId)
        .eq("product_id", product.id)
        .maybeSingle()

      if (!isMounted) return
      setIsFavorite(Boolean(data))
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [product.id])

  useEffect(() => {
    setImageLoaded(false)
  }, [product.id, product.image])

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

  const toggleFavorite = async () => {
    if (favoriteBusy) return

    if (!userId) {
      toast({
        title: "Favoritos",
        description: "Inicia sesión para guardar favoritos",
      })
      return
    }

    const nextValue = !isFavorite
    setIsFavorite(nextValue)
    setFavoriteBusy(true)

    if (nextValue) {
      const { error } = await supabase.from("favorites").insert({
        user_id: userId,
        product_id: product.id,
      })
      if (error) {
        setIsFavorite(false)
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", product.id)
      if (error) {
        setIsFavorite(true)
      }
    }

    setFavoriteBusy(false)
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
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && <div className="absolute inset-0 animate-pulse rounded-none bg-muted" />}
        <button
          type="button"
          aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          onClick={toggleFavorite}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/20 backdrop-blur transition-colors hover:bg-black/35"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-600 text-red-600" : "text-gray-400"}`} />
        </button>
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
        {product.benefits.length > 0 && (
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
        )}

        {/* Price & Add to Cart */}
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <div className="flex flex-col">
              {hasVipDiscount ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      ${vipPrice.toLocaleString()} MXN
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.price.toLocaleString()} MXN
                    </span>
                  </div>
                  <span className="mt-1 inline-flex w-fit rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground">
                    Descuento VIP: {vipDiscountPercentage}% aplicado
                  </span>
                </>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    ${product.price.toLocaleString()} MXN
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice.toLocaleString()} MXN
                    </span>
                  )}
                </div>
              )}
            </div>
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
