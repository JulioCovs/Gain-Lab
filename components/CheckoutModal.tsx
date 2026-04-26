"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useCartStore } from "@/lib/cart-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const WHATSAPP_PHONE = "528682302453"

type PaymentMethod = "spei" | "cash"

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const LAST_ORDER_STORAGE_KEY = "gainlab-last-order"

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("spei")
  const [confirming, setConfirming] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const total = getTotal()
  const serializedItems = useMemo(
    () =>
      items.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        line_total: item.product.price * item.quantity,
      })),
    [items]
  )

  const paymentLabel =
    paymentMethod === "spei" ? "Transferencia SPEI" : "Pago en Efectivo / Entrega Personal"

  const buildWhatsappMessage = (customerName: string) => {
    const lines = serializedItems.map((item) => {
      return `- ${item.name} x${item.quantity} ($${item.line_total.toLocaleString()} MXN)`
    })

    return [
      "Hola, quiero confirmar mi pedido de GAIN LAB.",
      `Cliente: ${customerName}`,
      "Productos:",
      ...lines,
      `Total: $${total.toLocaleString()} MXN`,
      `Metodo de pago: ${paymentLabel}`,
    ].join("\n")
  }

  const createOrderRecord = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const user = session?.user ?? null
    const firstName = String(user?.user_metadata?.first_name ?? "").trim()
    const lastName = String(user?.user_metadata?.last_name ?? "").trim()
    const fullName = [firstName, lastName].filter(Boolean).join(" ")
    const customerName = fullName || user?.email || "Cliente sin nombre"

    if (!user) {
      throw new Error("Debes iniciar sesion para confirmar tu pedido.")
    }

    const payloadCandidates = [
      {
        user_id: user.id,
        total_amount: total,
        status: "procesando",
        payment_method: paymentLabel,
        customer_name: customerName,
        customer_email: user?.email ?? null,
        items: serializedItems,
      },
      {
        user_id: user.id,
        total_amount: total,
        status: "procesando",
        payment_method: paymentLabel,
        order_items: serializedItems,
        customer_name: customerName,
        customer_email: user?.email ?? null,
      },
      {
        user_id: user.id,
        total_amount: total,
        status: "procesando",
        payment_method: paymentLabel,
      },
      {
        user_id: user.id,
        total_amount: total,
        status: "procesando",
      },
    ]

    let createdOrderId: string | null = null
    let lastError: Error | null = null

    for (const payload of payloadCandidates) {
      const { data, error } = await supabase.from("orders").insert(payload).select("id").single()
      if (!error && data?.id) {
        createdOrderId = String(data.id)
        break
      }
      if (error) {
        lastError = new Error(`No se pudo insertar en orders: ${error.message}`)
      }
    }

    if (!createdOrderId) {
      throw lastError ?? new Error("No se pudo crear el pedido.")
    }

    const orderItemsCandidates = [
      serializedItems.map((item) => ({
        order_id: createdOrderId,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      serializedItems.map((item) => ({
        order_id: createdOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
      serializedItems.map((item) => ({
        order_id: createdOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    ]

    for (const orderItemsPayload of orderItemsCandidates) {
      const { error } = await supabase.from("order_items").insert(orderItemsPayload)
      if (!error) {
        break
      }
    }

    return { customerName }
  }

  const handleConfirmOrder = async () => {
    if (!items.length || confirming) return

    setConfirming(true)
    setErrorMessage("")

    try {
      const { customerName } = await createOrderRecord()
      const orderSnapshot = {
        orderNumber: `GL-${Date.now().toString(36).toUpperCase()}`,
        customerName,
        paymentMethod: paymentLabel,
        total,
        items: serializedItems,
        createdAt: new Date().toISOString(),
      }
      window.sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(orderSnapshot))

      const whatsappMessage = buildWhatsappMessage(customerName)
      const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappMessage)}`
      window.open(whatsappUrl, "_blank", "noopener,noreferrer")

      clearCart()
      onOpenChange(false)
      router.push("/confirmacion")
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo confirmar el pedido."
      setErrorMessage(message)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Finalizar pedido</DialogTitle>
          <DialogDescription>
            Elige un metodo de pago para generar tu pedido y abrir WhatsApp con el resumen.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod("spei")}
            className={`rounded-lg border p-4 text-left transition-colors ${
              paymentMethod === "spei" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
            }`}
          >
            <p className="font-semibold">Transferencia SPEI</p>
            <p className="mt-1 text-sm text-muted-foreground">Confirma el pago por transferencia bancaria.</p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("cash")}
            className={`rounded-lg border p-4 text-left transition-colors ${
              paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
            }`}
          >
            <p className="font-semibold">Pago en Efectivo / Entrega Personal</p>
            <p className="mt-1 text-sm text-muted-foreground">Acuerda el punto de entrega y paga al recibir.</p>
          </button>
        </div>

        {paymentMethod === "spei" && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="font-semibold">Datos para transferencia:</p>
            <p className="mt-2">Banco: Nu Mexico</p>
            <p>CLABE: 638180000180998285</p>
            <p>Nombre: Julio Covarrubias</p>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Resumen</p>
          <p className="mt-1 text-lg font-semibold">Total: ${total.toLocaleString()} MXN</p>
          <p className="mt-1 text-xs text-muted-foreground">{items.length} producto(s) en el pedido</p>
        </div>

        {errorMessage && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmOrder} disabled={!items.length || confirming}>
            {confirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar Pedido"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
