"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Package, ArrowLeft, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const LAST_ORDER_STORAGE_KEY = "gainlab-last-order"

interface StoredOrderItem {
  product_id: string
  name: string
  quantity: number
  unit_price: number
  line_total: number
}

interface StoredOrderSnapshot {
  orderNumber: string
  customerName: string
  paymentMethod: string
  total: number
  items: StoredOrderItem[]
  createdAt: string
}

export default function ConfirmacionPage() {
  const [order, setOrder] = useState<StoredOrderSnapshot | null>(null)

  useEffect(() => {
    const raw = window.sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as StoredOrderSnapshot
      const hasItems = Array.isArray(parsed.items) && parsed.items.length > 0
      const hasTotal = Number(parsed.total) > 0
      if (hasItems && hasTotal) {
        setOrder(parsed)
      }
    } catch {
      // Ignore invalid data and render empty state.
    }
  }, [])

  const displayItems = order?.items ?? []
  const displayTotal = order?.total ?? 0
  const orderNumber = order?.orderNumber ?? "SIN-REFERENCIA"

  const whatsappMessage = encodeURIComponent(
    `Hola! Acabo de realizar mi pedido #${orderNumber} en GAIN LAB por un total de $${displayTotal.toLocaleString()} MXN. Me gustaría confirmar los detalles de mi envío.`
  )
  const whatsappLink = `https://wa.me/521234567890?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute right-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute left-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-black tracking-tighter uppercase">
              GAIN <span className="text-primary drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">LAB</span>
            </span>
          </Link>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 animate-ping bg-green-500/20 rounded-full scale-150" />
              <div className="relative h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-14 w-14 text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]" />
              </div>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-2">
              Pago Exitoso
            </h1>
            <p className="text-muted-foreground">
              Tu pedido ha sido procesado correctamente
            </p>
            {order?.customerName && (
              <p className="mt-2 text-sm font-medium text-foreground">
                {`Gracias por tu compra, ${order.customerName}!`}
              </p>
            )}
          </div>

          {order?.paymentMethod === "Transferencia SPEI" && (
            <Card className="mb-6 border-primary/40 bg-primary/5 shadow-md shadow-primary/10">
              <CardContent className="space-y-1 p-4">
                <p className="text-sm font-semibold text-primary">Datos para Transferencia SPEI</p>
                <p className="text-sm">Banco: Nu Mexico</p>
                <p className="text-sm">CLABE: 638180000180998285</p>
                <p className="text-sm">Nombre: Julio Covarrubias</p>
              </CardContent>
            </Card>
          )}

          {/* Order Summary Card */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5 mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Resumen de Compra
                </CardTitle>
                <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                  {orderNumber}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              {displayItems.length > 0 ? (
                <div className="space-y-3">
                  {displayItems.map((item, index) => (
                    <div key={`${item.product_id}-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{item.quantity}x</span>
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold">${item.line_total.toLocaleString()} MXN</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  No hay productos para mostrar en este pedido.
                </div>
              )}

              <Separator className="bg-border/50" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${displayTotal.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-green-500 font-medium">GRATIS</span>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${displayTotal.toLocaleString()} MXN</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Button */}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button 
              size="lg"
              className="w-full gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold uppercase tracking-wide py-7 text-base shadow-lg shadow-[#25D366]/30 transition-all hover:shadow-xl hover:shadow-[#25D366]/40"
            >
              <MessageCircle className="h-6 w-6" />
              Finalizar Pedido por WhatsApp
            </Button>
          </a>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Serás redirigido a WhatsApp para confirmar tu dirección de envío y método de pago final
          </p>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline" className="border-border/50 hover:bg-secondary/50">
                Seguir Comprando
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} GAIN LAB. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
