"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Loader2 } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { categories, type Category, type Product } from "@/lib/store-data"

function isValidCategory(value: unknown): value is Category {
  if (typeof value !== "string") return false
  return categories.some((category) => category.id === value)
}

function normalizeDbProduct(row: Record<string, unknown>): Product | null {
  const id = String(row?.id ?? "").trim()
  const name = String(row?.name ?? "").trim()
  if (!id || !name) return null

  const categoryRaw = row?.category_id ?? row?.category ?? null
  const category: Category = isValidCategory(categoryRaw) ? categoryRaw : "rendimiento"

  return {
    id,
    name,
    slug: String(row?.slug ?? id),
    category,
    goals: [],
    price: Number(row?.price ?? 0),
    originalPrice: row?.original_price != null ? Number(row?.original_price) : undefined,
    description: String(row?.description ?? ""),
    benefits: [],
    stock: Number(row?.stock ?? 0),
    image: String(row?.image_url ?? row?.image ?? "/placeholder.png"),
    badge: row?.badge ? String(row.badge) : undefined,
  }
}

export default function PerfilFavoritosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const userId = session?.user?.id ?? null
      if (!userId) {
        router.push("/auth")
        return
      }

      const favoritesResult = await supabase.from("favorites").select("product_id").eq("user_id", userId)
      if (favoritesResult.error) {
        console.warn("No se pudieron obtener favoritos:", favoritesResult.error.message)
        setFavoriteProducts([])
        setLoading(false)
        return
      }

      const productIds = (favoritesResult.data ?? [])
        .map((row) => String((row as Record<string, unknown>)?.product_id ?? ""))
        .filter(Boolean)

      if (productIds.length === 0) {
        setFavoriteProducts([])
        setLoading(false)
        return
      }

      const productsResult = await supabase.from("products").select("*").in("id", productIds)
      if (productsResult.error) {
        console.warn("No se pudieron obtener productos favoritos:", productsResult.error.message)
        setFavoriteProducts([])
        setLoading(false)
        return
      }

      const byId = new Map(
        ((productsResult.data ?? []) as Record<string, unknown>[])
          .map((row) => normalizeDbProduct(row))
          .filter((product): product is Product => product !== null)
          .map((product) => [product.id, product])
      )

      // Keep DB favorites order consistent in UI
      const orderedProducts = productIds.map((id) => byId.get(id)).filter((product): product is Product => Boolean(product))

      setFavoriteProducts(orderedProducts)
      setLoading(false)
    }

    void loadFavorites()
  }, [router])

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Favoritos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Cargando favoritos..."
              : favoriteProducts.length > 0
                ? `Tienes ${favoriteProducts.length} producto(s) guardado(s).`
                : "Tu lista de favoritos está vacía. Guarda los suplementos que más te gusten aquí."}
          </p>
        </div>
        <Link href="/perfil">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al perfil
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando favoritos...
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 text-base font-medium text-foreground">Aún no tienes favoritos guardados.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Explora productos y toca el corazón para agregarlos aquí.
          </p>
          <Link href="/" className="mt-5 inline-block">
            <Button>Explorar productos</Button>
          </Link>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </main>
  )
}
