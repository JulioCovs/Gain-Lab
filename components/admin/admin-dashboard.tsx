"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Boxes,
  DollarSign,
  Loader2,
  Plus,
  ShoppingBag,
  Trash2,
  UserPlus,
  RefreshCw,
  Pencil,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatsCard } from "./stats-card"

const LOW_STOCK_THRESHOLD = 10

const PRODUCT_CATEGORIES = ["Rendimiento", "Recuperación", "Bienestar", "Adaptógenos"] as const

interface AdminProduct {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image: string | null
}

interface AdminOrder {
  id: string
  createdAt: string
  status: "procesando" | "en-camino" | "entregado"
  total: number
}

interface AdminClient {
  id: string
  firstName: string
  lastName: string
  phone: string
  createdAt: string
}

interface ProductFormState {
  id: string
  name: string
  category: string
  price: string
  stock: string
  image: string
}

const initialProductForm: ProductFormState = {
  id: "",
  name: "",
  category: "",
  price: "",
  stock: "",
  image: "",
}

type AdminTab = "resumen" | "inventario" | "pedidos" | "clientes"

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AdminTab>("resumen")
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [newClients, setNewClients] = useState(0)
  const [clients, setClients] = useState<AdminClient[]>([])
  const [form, setForm] = useState<ProductFormState>(initialProductForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const lowStockCount = products.filter((product) => product.stock < LOW_STOCK_THRESHOLD).length
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0)

  const uploadProductImage = async (file: File) => {
    setUploadingImage(true)
    setFormError(null)

    const safeName = file.name.replace(/[^\w.\-]+/g, "-").toLowerCase()
    const filePath = `products/${Date.now()}-${safeName}`

    const candidateBuckets = ["product-images", "products", "images"] as const
    let lastError: string | null = null

    for (const bucket of candidateBuckets) {
      const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || undefined,
      })

      if (error) {
        lastError = error.message
        continue
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      const publicUrl = data?.publicUrl ?? ""

      if (!publicUrl) {
        lastError = "No se pudo obtener URL pública de la imagen."
        continue
      }

      setForm((prev) => ({ ...prev, image: publicUrl }))
      setUploadingImage(false)
      return
    }

    setUploadingImage(false)
    setFormError(lastError ?? "No se pudo subir la imagen. Puedes pegar una URL directa.")
  }

  const loadDashboardData = async () => {
    setLoading(true)

    const [productsResult, ordersResult, clientsCountResult, clientsListResult] = await Promise.all([
      supabase.from("products").select("id, name, category, price, stock, image"),
      supabase
        .from("orders")
        .select("id, created_at, status, total_amount")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ])

    if (productsResult.error) {
      console.warn("No se pudieron obtener productos:", productsResult.error.message)
      setProducts([])
    } else {
      const mappedProducts = (productsResult.data ?? []).map((item) => {
        const row = item as Record<string, unknown>
        return {
          id: String(row.id ?? ""),
          name: String(row.name ?? ""),
          category: String(row.category ?? ""),
          price: Number(row.price ?? 0),
          stock: Number(row.stock ?? 0),
          image: row.image ? String(row.image) : null,
        }
      })
      setProducts(mappedProducts)
    }

    if (ordersResult.error) {
      console.warn("No se pudieron obtener pedidos:", ordersResult.error.message)
      setOrders([])
    } else {
      const mappedOrders = (ordersResult.data ?? []).map((item) => {
        const row = item as Record<string, unknown>
        const rawStatus = String(row.status ?? "procesando")
        const normalizedStatus =
          rawStatus === "entregado" || rawStatus === "en-camino" ? rawStatus : "procesando"

        return {
          id: String(row.id ?? ""),
          createdAt: String(row.created_at ?? ""),
          status: normalizedStatus,
          total: Number(row.total_amount ?? 0),
        } as AdminOrder
      })
      setOrders(mappedOrders)
    }

    if (clientsCountResult.error) {
      console.warn("No se pudieron obtener clientes nuevos:", clientsCountResult.error.message)
      setNewClients(0)
    } else {
      setNewClients(clientsCountResult.count ?? 0)
    }

    if (clientsListResult.error) {
      console.warn("No se pudieron obtener clientes:", clientsListResult.error.message)
      setClients([])
    } else {
      const mappedClients = (clientsListResult.data ?? []).map((item) => {
        const row = item as Record<string, unknown>
        return {
          id: String(row.id ?? ""),
          firstName: String(row.first_name ?? ""),
          lastName: String(row.last_name ?? ""),
          phone: String(row.phone ?? ""),
          createdAt: String(row.created_at ?? ""),
        } as AdminClient
      })
      setClients(mappedClients)
    }

    setLoading(false)
  }

  const resetForm = () => {
    setForm(initialProductForm)
    setEditingId(null)
    setFormError(null)
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleProductSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSavingProduct(true)
    setFormError(null)

    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image.trim() || null,
    }

    if (!payload.id || !payload.name || !payload.category) {
      setSavingProduct(false)
      setFormError("Completa ID, nombre y categoría.")
      return
    }

    if (!Number.isFinite(payload.price) || !Number.isFinite(payload.stock)) {
      setSavingProduct(false)
      setFormError("Precio y stock deben ser números válidos.")
      return
    }

    const { error } = editingId
      ? await supabase
          .from("products")
          .update({
            name: payload.name,
            category: payload.category,
            price: payload.price,
            stock: payload.stock,
            image: payload.image,
          })
          .eq("id", editingId)
      : await supabase.from("products").insert(payload)

    if (error) {
      console.warn("No se pudo guardar el producto:", error.message)
      setSavingProduct(false)
      setFormError(error.message)
      return
    }

    await loadDashboardData()
    resetForm()
    setProductDialogOpen(false)
    setSavingProduct(false)
  }

  const handleEditProduct = (product: AdminProduct) => {
    setEditingId(product.id)
    setFormError(null)
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image ?? "",
    })
    setProductDialogOpen(true)
  }

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) {
      console.warn("No se pudo eliminar el producto:", error.message)
      return
    }
    await loadDashboardData()
  }

  const handleChangeOrderStatus = async (orderId: string, currentStatus: AdminOrder["status"]) => {
    const nextStatus =
      currentStatus === "procesando"
        ? "en-camino"
        : currentStatus === "en-camino"
          ? "entregado"
          : "procesando"

    const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId)
    if (error) {
      console.warn("No se pudo actualizar el estado del pedido:", error.message)
      return
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)))
  }

  const statusBadgeClass = (status: AdminOrder["status"]) => {
    if (status === "entregado") return "bg-emerald-100 text-emerald-700"
    if (status === "en-camino") return "bg-blue-100 text-blue-700"
    return "bg-yellow-100 text-yellow-800"
  }

  const filteredProducts = useMemo(() => products.filter((product) => !product.id.includes("bundle")), [products])

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Dashboard de Administración</h1>
              <p className="text-xs text-slate-500">GainLab</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Navegación</p>
          <nav className="space-y-2">
            <button
              type="button"
              className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                activeTab === "resumen" ? "bg-slate-100 font-semibold" : ""
              }`}
              onClick={() => setActiveTab("resumen")}
            >
              Resumen
            </button>
            <button
              type="button"
              className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                activeTab === "inventario" ? "bg-slate-100 font-semibold" : ""
              }`}
              onClick={() => setActiveTab("inventario")}
            >
              Inventario
            </button>
            <button
              type="button"
              className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                activeTab === "pedidos" ? "bg-slate-100 font-semibold" : ""
              }`}
              onClick={() => setActiveTab("pedidos")}
            >
              Pedidos
            </button>
            <button
              type="button"
              className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                activeTab === "clientes" ? "bg-slate-100 font-semibold" : ""
              }`}
              onClick={() => setActiveTab("clientes")}
            >
              Clientes
            </button>
          </nav>
        </aside>

        <main className="space-y-6">
          {activeTab === "resumen" && (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatsCard
                title="Ventas Totales"
                value={`$${totalSales.toLocaleString()} MXN`}
                icon={DollarSign}
                description="Suma de pedidos"
              />
              <StatsCard
                title="Número de Pedidos"
                value={orders.length.toString()}
                icon={ShoppingBag}
                description="Últimos registros"
              />
              <StatsCard
                title="Clientes Nuevos"
                value={newClients.toString()}
                icon={UserPlus}
                description="Últimos 30 días"
              />
              <StatsCard
                title="Stock Bajo"
                value={lowStockCount.toString()}
                icon={Boxes}
                description="Productos por debajo de 10"
                variant={lowStockCount > 0 ? "warning" : "default"}
              />
            </section>
          )}

          {activeTab === "inventario" && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Gestión de Inventario</h2>
                <Dialog
                  open={productDialogOpen}
                  onOpenChange={(open) => {
                    setProductDialogOpen(open)
                    if (!open) resetForm()
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="gap-2"
                      onClick={() => {
                        resetForm()
                        setProductDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Nuevo Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-3" onSubmit={handleProductSubmit}>
                      <Input
                        placeholder="ID/SKU"
                        value={form.id}
                        onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
                        disabled={Boolean(editingId)}
                        required
                      />
                      <Input
                        placeholder="Nombre"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />

                      <Select
                        value={form.category}
                        onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          placeholder="Precio"
                          value={form.price}
                          onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={form.stock}
                          onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Input
                          placeholder="URL de foto (opcional)"
                          value={form.image}
                          onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            id="product-image-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) void uploadProductImage(file)
                              e.currentTarget.value = ""
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            disabled={uploadingImage}
                            onClick={() => document.getElementById("product-image-input")?.click()}
                          >
                            {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Subir Imagen
                          </Button>
                          {form.image ? (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="truncate">Imagen lista</span>
                            </div>
                          ) : null}
                        </div>
                        {formError ? (
                          <p className="text-sm text-red-600">{formError}</p>
                        ) : null}
                      </div>

                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline" disabled={savingProduct || uploadingImage}>
                            Cancelar
                          </Button>
                        </DialogClose>
                        <Button type="submit" disabled={savingProduct || uploadingImage}>
                          {savingProduct ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : editingId ? (
                            "Guardar Cambios"
                          ) : (
                            "Crear Producto"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando inventario...
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Foto</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-slate-100" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell className="text-right">${product.price.toLocaleString()} MXN</TableCell>
                          <TableCell
                            className={`text-right ${product.stock < LOW_STOCK_THRESHOLD ? "text-red-600" : ""}`}
                          >
                            {product.stock}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                <Pencil className="mr-1 h-3 w-3" />
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="mr-1 h-3 w-3" />
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          )}

          {activeTab === "pedidos" && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Gestión de Pedidos</h2>
              {loading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando pedidos...
                </div>
              ) : orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay pedidos disponibles.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString("es-MX")} - $
                            {order.total.toLocaleString()} MXN
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusBadgeClass(order.status)}>
                            {order.status === "en-camino"
                              ? "En camino"
                              : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeOrderStatus(order.id, order.status)}
                          >
                            Cambiar estado
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "clientes" && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Clientes</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Clientes nuevos en los últimos 30 días: <strong>{newClients}</strong>
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando clientes...
                </div>
              ) : clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay clientes registrados para mostrar.</p>
              ) : (
                <div className="rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead className="text-right">Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => {
                        const name = `${client.firstName} ${client.lastName}`.trim() || "(Sin nombre)"
                        return (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{name}</TableCell>
                            <TableCell>{client.phone || "-"}</TableCell>
                            <TableCell className="font-mono text-xs text-slate-600">{client.id}</TableCell>
                            <TableCell className="text-right text-sm text-slate-600">
                              {client.createdAt ? new Date(client.createdAt).toLocaleDateString("es-MX") : "-"}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
