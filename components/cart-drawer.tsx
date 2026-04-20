"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag, Sparkles } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { checkBundleEligibility } from "@/lib/store-data"
import Link from "next/link"

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotal, clearCart, addItem } = useCartStore()
  const bundleCheck = checkBundleEligibility(items)

  const handleApplyBundle = () => {
    if (bundleCheck.bundle) {
      // Remove individual items and add bundle
      bundleCheck.bundle.bundleItems?.forEach(id => {
        removeItem(id)
      })
      addItem(bundleCheck.bundle)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col bg-background sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Tu Carrito ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">Tu carrito está vacío</p>
            <Button onClick={() => onOpenChange(false)}>Explorar productos</Button>
          </div>
        ) : (
          <>
            {/* Bundle Suggestion */}
            {bundleCheck.eligible && bundleCheck.bundle && (
              <div className="mx-4 rounded-lg border border-primary/50 bg-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold text-primary">Combo disponible</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Convierte tus productos en el Combo Bienestar y ahorra ${bundleCheck.savings.toLocaleString()} MXN
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={handleApplyBundle}
                    >
                      Aplicar Combo -15%
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col gap-4 px-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 rounded-lg bg-card p-3"
                  >
                    <div className="h-20 w-20 flex-shrink-0 rounded-md bg-muted" />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium leading-tight">
                            {item.product.name}
                          </h4>
                          {item.product.isBundle && (
                            <span className="mt-1 inline-block rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">
                              Bundle
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border border-border transition-colors hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border border-border transition-colors hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.product.price * item.quantity).toLocaleString()} MXN
                          </p>
                          {item.product.originalPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              ${(item.product.originalPrice * item.quantity).toLocaleString()} MXN
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold">${getTotal().toLocaleString()} MXN</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Envío gratis en pedidos mayores a $999 MXN
              </p>
              <Link href="/confirmacion" onClick={() => onOpenChange(false)}>
                <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wide shadow-lg shadow-primary/30" size="lg">
                  Proceder al pago
                </Button>
              </Link>
              <button
                onClick={clearCart}
                className="mt-2 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
