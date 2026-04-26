"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CreditCard, Heart, Package, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCartStore } from "@/lib/cart-store"
import { products } from "@/lib/store-data"

interface ProfileFormState {
  nombre: string
  apellido: string
  telefono: string
  calle: string
  numero: string
  colonia: string
  ciudadEstado: string
  codigoPostal: string
}

interface OrderItem {
  id: string
  date: string
  status: "procesando" | "en-camino" | "entregado"
  productIds: string[]
}

interface PaymentMethodItem {
  id: string
  brand: string
  last4: string
  expMonth: number | null
  expYear: number | null
}

const initialForm: ProfileFormState = {
  nombre: "",
  apellido: "",
  telefono: "",
  calle: "",
  numero: "",
  colonia: "",
  ciudadEstado: "",
  codigoPostal: "",
}

const statusStyles = {
  procesando: "bg-yellow-100 text-yellow-800",
  "en-camino": "bg-blue-100 text-blue-800",
  entregado: "bg-emerald-100 text-emerald-800",
}

export default function PerfilPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState("")
  const [email, setEmail] = useState("")
  const [form, setForm] = useState<ProfileFormState>(initialForm)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([])
  const addItem = useCartStore((state) => state.addItem)
  const favorites = favoriteIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean)

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        const message = userError?.message ?? ""
        if (message.includes("Invalid Refresh Token") || message.includes("Refresh Token Not Found")) {
          try {
            await supabase.auth.signOut()
          } catch {
            // ignore
          }
        }
        router.push("/auth")
        return
      }

      setUserId(user.id)
      setEmail(user.email ?? "")
      setCreatedAt(user.created_at ?? "")

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "first_name, last_name, phone, street, address_number, neighborhood, city_state, postal_code"
        )
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        // Keep profile usable even if the profiles query fails.
        console.warn("No se pudo obtener el perfil:", profileError.message)
        setForm({
          nombre: (user.user_metadata?.first_name as string | undefined) ?? "",
          apellido: (user.user_metadata?.last_name as string | undefined) ?? "",
          telefono: "",
          calle: "",
          numero: "",
          colonia: "",
          ciudadEstado: "",
          codigoPostal: "",
        })
      } else {
        setForm({
          nombre:
            profile?.first_name ?? (user.user_metadata?.first_name as string | undefined) ?? "",
          apellido:
            profile?.last_name ?? (user.user_metadata?.last_name as string | undefined) ?? "",
          telefono: profile?.phone ?? "",
          calle: profile?.street ?? "",
          numero: profile?.address_number ?? "",
          colonia: profile?.neighborhood ?? "",
          ciudadEstado: profile?.city_state ?? "",
          codigoPostal: profile?.postal_code ?? "",
        })
      }

      setLoadingData(true)

      const [ordersResult, favoritesResult, paymentsResult] = await Promise.all([
        supabase
          .from("orders")
          .select("id, created_at, status, order_items(product_id)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("favorites").select("product_id").eq("user_id", user.id),
        supabase
          .from("payment_methods")
          .select("id, brand, last4, exp_month, exp_year")
          .eq("user_id", user.id),
      ])

      if (ordersResult.error) {
        console.warn("No se pudieron obtener pedidos:", ordersResult.error.message)
        setOrders([])
      } else {
        const mappedOrders = (ordersResult.data ?? []).map((order: any) => ({
          id: String(order.id),
          date: order.created_at,
          status: (order.status ?? "procesando") as OrderItem["status"],
          productIds: (order.order_items ?? [])
            .map((item: any) => item.product_id)
            .filter(Boolean),
        }))
        setOrders(mappedOrders)
      }

      if (favoritesResult.error) {
        console.warn("No se pudieron obtener favoritos:", favoritesResult.error.message)
        setFavoriteIds([])
      } else {
        setFavoriteIds(
          (favoritesResult.data ?? [])
            .map((favorite: any) => favorite.product_id)
            .filter(Boolean)
        )
      }

      if (paymentsResult.error) {
        console.warn("No se pudieron obtener métodos de pago:", paymentsResult.error.message)
        setPaymentMethods([])
      } else {
        setPaymentMethods(
          (paymentsResult.data ?? []).map((payment: any) => ({
            id: String(payment.id),
            brand: payment.brand ?? "Tarjeta",
            last4: payment.last4 ?? "----",
            expMonth: payment.exp_month ?? null,
            expYear: payment.exp_year ?? null,
          }))
        )
      }

      setLoadingData(false)
      setLoadingProfile(false)
    }

    loadProfile()
  }, [router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!userId) return

    setSaving(true)

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        first_name: form.nombre,
        last_name: form.apellido,
        phone: form.telefono,
        street: form.calle,
        address_number: form.numero,
        neighborhood: form.colonia,
        city_state: form.ciudadEstado,
        postal_code: form.codigoPostal,
      },
      { onConflict: "id" }
    )

    if (error) {
      console.error("Error al guardar perfil:", error.message)
      setSaving(false)
      return
    }

    await supabase.auth.updateUser({
      data: {
        first_name: form.nombre,
        last_name: form.apellido,
        full_name: `${form.nombre} ${form.apellido}`.trim(),
      },
    })

    setSaving(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    setUserId(null)
    router.push("/")
    router.refresh()
  }

  const handleReorder = (productIds: string[]) => {
    productIds.forEach((id) => {
      const product = products.find((item) => item.id === id)
      if (product) addItem(product)
    })
  }

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("es-MX", { year: "numeric", month: "long" })
    : "-"

  return (
    <div className="min-h-screen bg-[#F5F5F7] px-4 py-8">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
          </Button>
        </div>

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="py-5">
            <p className="text-sm text-muted-foreground">Miembro GainLab desde</p>
            <p className="text-xl font-semibold capitalize">{memberSince}</p>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="border-0 bg-white shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                Mi Perfil
              </CardTitle>
              <CardDescription>Administra tus datos personales y dirección de envío.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProfile ? (
                <div className="space-y-3">
                  <div className="h-10 animate-pulse rounded-md bg-slate-100" />
                  <div className="h-10 animate-pulse rounded-md bg-slate-100" />
                  <div className="h-10 animate-pulse rounded-md bg-slate-100" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={form.nombre}
                        onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Escribe tu nombre..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        value={form.apellido}
                        onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
                        placeholder="Escribe tu apellido..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input id="email" value={email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={form.telefono}
                        onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                        placeholder="Escribe tu teléfono..."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="calle">Calle</Label>
                      <Input
                        id="calle"
                        value={form.calle}
                        onChange={(e) => setForm((prev) => ({ ...prev, calle: e.target.value }))}
                        placeholder="Escribe tu calle..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={form.numero}
                        onChange={(e) => setForm((prev) => ({ ...prev, numero: e.target.value }))}
                        placeholder="Número exterior/interior"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="colonia">Colonia</Label>
                      <Input
                        id="colonia"
                        value={form.colonia}
                        onChange={(e) => setForm((prev) => ({ ...prev, colonia: e.target.value }))}
                        placeholder="Escribe tu colonia..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="ciudad-estado">Ciudad / Estado</Label>
                      <Input
                        id="ciudad-estado"
                        value={form.ciudadEstado}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, ciudadEstado: e.target.value }))
                        }
                        placeholder="Ciudad / Estado"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="codigo-postal">CP</Label>
                      <Input
                        id="codigo-postal"
                        value={form.codigoPostal}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, codigoPostal: e.target.value }))
                        }
                        placeholder="Código postal"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full md:w-auto" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Métodos de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingData ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    Cargando métodos de pago...
                  </div>
                ) : paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-medium">
                        {method.brand} terminación {method.last4}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {method.expMonth && method.expYear
                          ? `Expira ${String(method.expMonth).padStart(2, "0")}/${String(
                              method.expYear
                            ).slice(-2)}`
                          : "Fecha de expiración pendiente"}
                      </p>
                    </div>
                  ))
                ) : (
                  <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                    + Agregar método de pago
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Mis Pedidos
              </CardTitle>
              <CardDescription>Historial reciente y recompra rápida.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingData ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                  Cargando pedidos...
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{order.id}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                      >
                        {order.status === "en-camino"
                          ? "En camino"
                          : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("es-MX")}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {order.productIds
                        .map((id) => products.find((p) => p.id === id)?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleReorder(order.productIds)}
                    >
                      Volver a comprar
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-4">
                  <p className="text-sm text-muted-foreground">
                    Aún no has realizado ninguna compra. ¡Empieza tu transformación hoy!
                  </p>
                  <Button className="mt-3" onClick={() => router.push("/")}>
                    Ir a la tienda
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Link href="/perfil/favoritos" className="block">
            <Card className="border-0 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Mis Favoritos
                </CardTitle>
                <CardDescription>
                  {loadingData
                    ? "Cargando favoritos..."
                    : favorites.length > 0
                      ? `Tienes ${favorites.length} producto(s) guardado(s).`
                      : "Tu lista de favoritos está vacía. Guarda los suplementos que más te gusten aquí."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingData ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    Cargando favoritos...
                  </div>
                ) : favorites.length > 0 ? (
                  favorites.slice(0, 3).map((product) => (
                    <div
                      key={product?.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{product?.name}</p>
                        <p className="text-xs text-muted-foreground">${product?.price.toLocaleString()} MXN</p>
                      </div>
                      <Heart className="h-4 w-4 fill-red-600 text-red-600" />
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-4">
                    <p className="text-sm text-muted-foreground">
                      Tu lista de favoritos está vacía. Guarda los suplementos que más te gusten aquí
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
