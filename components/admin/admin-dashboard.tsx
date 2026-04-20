"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Mail,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { products, type Category } from "@/lib/store-data"

// Short category names for admin
const adminCategories = [
  { id: "rendimiento" as Category, name: "Rendimiento" },
  { id: "recuperacion" as Category, name: "Recuperación" },
  { id: "bienestar" as Category, name: "Bienestar" },
  { id: "adaptogenos" as Category, name: "Adaptógenos" },
]
import { StockAlertCard } from "./stock-alert-card"
import { StatsCard } from "./stats-card"

const LOW_STOCK_THRESHOLD = 10

export function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all")
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "normal">("all")
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  // Filter out bundles for inventory management
  const inventoryProducts = products.filter((p) => !p.isBundle)

  const filteredProducts = useMemo(() => {
    return inventoryProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock < LOW_STOCK_THRESHOLD) ||
        (stockFilter === "normal" && product.stock >= LOW_STOCK_THRESHOLD)

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [inventoryProducts, searchQuery, categoryFilter, stockFilter])

  const lowStockProducts = inventoryProducts.filter(
    (p) => p.stock < LOW_STOCK_THRESHOLD
  )
  const criticalStockProducts = inventoryProducts.filter((p) => p.stock < 5)
  const totalStock = inventoryProducts.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = inventoryProducts.reduce(
    (sum, p) => sum + p.stock * p.price,
    0
  )

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Sin stock", color: "bg-destructive" }
    if (stock < 5) return { label: "Crítico", color: "bg-destructive" }
    if (stock < LOW_STOCK_THRESHOLD) return { label: "Bajo", color: "bg-warning" }
    return { label: "Normal", color: "bg-success" }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Gestión de inventario</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Productos"
            value={inventoryProducts.length.toString()}
            icon={Package}
            description="En catálogo"
          />
          <StatsCard
            title="Stock Total"
            value={totalStock.toLocaleString()}
            icon={TrendingUp}
            description="Unidades"
          />
          <StatsCard
            title="Valor Inventario"
            value={`$${totalValue.toLocaleString()} MXN`}
            icon={TrendingUp}
            description="Precio venta"
          />
          <StatsCard
            title="Alertas Stock"
            value={lowStockProducts.length.toString()}
            icon={AlertTriangle}
            description={`${criticalStockProducts.length} críticos`}
            variant={lowStockProducts.length > 0 ? "warning" : "default"}
          />
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Alertas de Reabastecimiento
              </h2>
              <Badge variant="outline" className="border-destructive text-destructive">
                {lowStockProducts.length} productos
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((product) => (
                <StockAlertCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Inventory Table */}
        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Inventario Completo
            </h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:w-64"
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v as Category | "all")}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {adminCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={stockFilter}
                onValueChange={(v) => setStockFilter(v as "all" | "low" | "normal")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo</SelectItem>
                  <SelectItem value="low">Stock bajo</SelectItem>
                  <SelectItem value="normal">Stock normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Producto</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="hidden sm:table-cell">Estado</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock)
                  const isLowStock = product.stock < LOW_STOCK_THRESHOLD

                  return (
                    <TableRow
                      key={product.id}
                      className={isLowStock ? "bg-destructive/5" : ""}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">
                          {adminCategories.find((c) => c.id === product.category)?.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-mono font-semibold ${
                            isLowStock ? "text-destructive" : "text-foreground"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          className={`${status.color} text-${status.color === "bg-success" ? "success" : status.color === "bg-warning" ? "warning" : "destructive"}-foreground`}
                          variant="secondary"
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${product.price.toLocaleString()} MXN
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${(product.stock * product.price).toLocaleString()} MXN
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant={isLowStock ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => setSelectedProduct(product.id)}
                            >
                              <Mail className="mr-1 h-3 w-3" />
                              {isLowStock ? "Reabastecer" : "Contactar"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Contactar Proveedor</DialogTitle>
                              <DialogDescription>
                                Enviar solicitud de reabastecimiento para {product.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="rounded-lg bg-muted p-4">
                                <p className="text-sm">
                                  <strong>Producto:</strong> {product.name}
                                </p>
                                <p className="text-sm">
                                  <strong>SKU:</strong> {product.id}
                                </p>
                                <p className="text-sm">
                                  <strong>Stock actual:</strong>{" "}
                                  <span
                                    className={
                                      isLowStock ? "text-destructive" : ""
                                    }
                                  >
                                    {product.stock} unidades
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <strong>Cantidad sugerida:</strong> 100 unidades
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Cancelar</Button>
                              <Button>Enviar solicitud</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  No se encontraron productos
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
