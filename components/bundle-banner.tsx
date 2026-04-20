"use client"

import { Sparkles, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { getBundles } from "@/lib/store-data"

export function BundleBanner() {
  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  const bundles = getBundles()
  const bundle = bundles[0] // Combo Bienestar

  if (!bundle) return null

  const isInCart = items.some((item) => item.product.id === bundle.id)
  const savings = bundle.originalPrice
    ? (bundle.originalPrice - bundle.price).toLocaleString()
    : "0"
  const discountPercent = bundle.bundleDiscount || 0

  return (
    <section className="relative overflow-hidden bg-card border-y border-border">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Oferta Especial
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground lg:text-4xl text-balance">
              {bundle.name}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              {bundle.description}
            </p>

            {/* Bundle Items */}
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Incluye:
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Magnesio Bisglicinato</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Omega-3 Ultra</span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    ${bundle.price.toLocaleString()} MXN
                  </span>
                  {bundle.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${bundle.originalPrice.toLocaleString()} MXN
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-primary font-medium">
                  Ahorras ${savings} MXN ({discountPercent}% dto.)
                </p>
              </div>
              <Button
                size="lg"
                className="gap-2"
                onClick={() => addItem(bundle)}
                disabled={isInCart}
              >
                {isInCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    Añadido al carrito
                  </>
                ) : (
                  <>
                    Añadir Combo
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="aspect-square rounded-2xl bg-muted/50 border border-border">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
