"use client"

import { AlertTriangle, Mail, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { type Product } from "@/lib/store-data"

// Short category names
const shortCategories = [
  { id: "rendimiento", name: "Rendimiento" },
  { id: "recuperacion", name: "Recuperación" },
  { id: "bienestar", name: "Bienestar" },
  { id: "adaptogenos", name: "Adaptógenos" },
]
import { useState } from "react"

interface StockAlertCardProps {
  product: Product
}

export function StockAlertCard({ product }: StockAlertCardProps) {
  const [message, setMessage] = useState(
    `Estimado proveedor,\n\nSolicito reabastecimiento del producto "${product.name}" (SKU: ${product.id}).\n\nStock actual: ${product.stock} unidades\nCantidad solicitada: 100 unidades\n\nPor favor, confirmar disponibilidad y tiempo de entrega.\n\nSaludos.`
  )
  const [sent, setSent] = useState(false)

  const isCritical = product.stock < 5
  const category = shortCategories.find((c) => c.id === product.category)

  const handleSend = () => {
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        isCritical
          ? "border-destructive/50 bg-destructive/5"
          : "border-warning/50 bg-warning/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-lg p-2 ${
            isCritical ? "bg-destructive/20" : "bg-warning/20"
          }`}
        >
          <AlertTriangle
            className={`h-5 w-5 ${
              isCritical ? "text-destructive" : "text-warning"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground">{product.id}</p>
            </div>
            <Badge
              variant="outline"
              className={
                isCritical ? "border-destructive text-destructive" : "border-warning text-warning"
              }
            >
              {isCritical ? "Crítico" : "Bajo"}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <TrendingDown
                className={`h-4 w-4 ${
                  isCritical ? "text-destructive" : "text-warning"
                }`}
              />
              <span
                className={`font-mono font-semibold ${
                  isCritical ? "text-destructive" : "text-warning"
                }`}
              >
                {product.stock}
              </span>
              <span className="text-muted-foreground">unidades</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {category?.name}
            </Badge>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={isCritical ? "destructive" : "outline"}
                size="sm"
                className="mt-4 w-full gap-2"
              >
                <Mail className="h-4 w-4" />
                Contactar Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Solicitud de Reabastecimiento</DialogTitle>
                <DialogDescription>
                  Envía un mensaje al proveedor para reabastecer {product.name}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Producto:</span>
                      <p className="font-medium">{product.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SKU:</span>
                      <p className="font-mono">{product.id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock actual:</span>
                      <p
                        className={`font-semibold ${
                          isCritical ? "text-destructive" : "text-warning"
                        }`}
                      >
                        {product.stock} unidades
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Categoría:</span>
                      <p>{category?.name}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Mensaje
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button onClick={handleSend} disabled={sent}>
                  {sent ? "Enviado" : "Enviar solicitud"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
