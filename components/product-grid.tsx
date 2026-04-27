"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "./product-card"
import { FilterBar } from "./filter-bar"
import { BundleBanner } from "./bundle-banner"
import { LabLoader } from "./lab-loader"
import { supabase } from "@/lib/supabase"
import { categories, type Category, type Goal, type Product } from "@/lib/store-data"

const MIN_LAB_LOADER_MS = 2000
const LAB_FADE_OUT_MS = 500

function isValidCategory(value: unknown): value is Category {
  if (typeof value !== "string") return false
  return categories.some((c) => c.id === value)
}

function normalizeCategoryName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function resolveCategoryId(categoryIdRaw: unknown, categoryNameRaw: unknown): Category {
  const defaultCategory = categories[0]?.id ?? ("rendimiento" as Category)

  // If it already matches our local ids, use it.
  if (isValidCategory(categoryIdRaw)) return categoryIdRaw

  // Try mapping by category name from Supabase join: categories(name)
  const name = typeof categoryNameRaw === "string" ? normalizeCategoryName(categoryNameRaw) : ""
  if (name) {
    const mapped =
      categories.find((c) => normalizeCategoryName(c.name) === name)?.id ??
      categories.find((c) => normalizeCategoryName(c.id) === name)?.id ??
      null
    if (mapped) return mapped
  }

  return defaultCategory
}

function mapDbProductToStoreProduct(row: Record<string, unknown>): Product | null {
  const id = String(row?.id ?? "").trim()
  const name = String(row?.name ?? "").trim()
  const description = String(row?.description ?? "").trim()
  const price = Number(row?.price ?? 0)
  const stock = Number(row?.stock ?? 0)
  const imageUrl = String(row?.image_url ?? row?.imageUrl ?? "/placeholder.png").trim()
  const categoryIdRaw = row?.category_id ?? row?.categoryId ?? ""
  const categoryNameRaw = (row as any)?.categories?.name ?? (row as any)?.category?.name ?? null

  if (!id || !name || !Number.isFinite(price)) return null

  const category: Category = resolveCategoryId(categoryIdRaw, categoryNameRaw)

  return {
    id,
    name,
    slug: id,
    category,
    goals: [],
    price,
    description,
    benefits: [],
    stock: Number.isFinite(stock) ? stock : 0,
    image: imageUrl || "/placeholder.png",
  }
}

export function ProductGrid() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [showLabLoader, setShowLabLoader] = useState(true)
  const [readyToRenderStore, setReadyToRenderStore] = useState(false)

  useEffect(() => {
    if (isDataLoading) {
      setShowLabLoader(true)
      setReadyToRenderStore(false)
      return
    }
    const timeoutId = window.setTimeout(() => {
      setShowLabLoader(false)
      setReadyToRenderStore(true)
    }, LAB_FADE_OUT_MS)
    return () => window.clearTimeout(timeoutId)
  }, [isDataLoading])

  const handleCategoryChange = (category: Category | null) => {
    const currentCategory = searchParams.get("category")
    const nextCategory = category ?? null

    // Strict compare: if URL already matches desired state, do nothing.
    if ((currentCategory ?? null) === nextCategory) {
      setSelectedCategory(category)
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set("category", category)
    } else {
      params.delete("category")
    }

    const nextQuery = params.toString()
    router.push(nextQuery ? `/?${nextQuery}` : "/")
    setSelectedCategory(category)
  }

  useEffect(() => {
    const fetchProducts = async () => {
      setIsDataLoading(true)
      const loaderStartAt = Date.now()

      let { data, error: dbError } = await supabase
        .from("products")
        .select("*, categories(name)")

      if (dbError) {
        // Fallback: if relation lookup fails, load products without category join.
        const fallback = await supabase.from("products").select("*")
        data = fallback.data
        dbError = fallback.error
      }

      if (dbError) {
        const message = typeof dbError === "object" ? JSON.stringify(dbError) : String(dbError)
        console.warn("Detalle del error:", message)
        const elapsed = Date.now() - loaderStartAt
        if (elapsed < MIN_LAB_LOADER_MS) {
          await new Promise((resolve) => window.setTimeout(resolve, MIN_LAB_LOADER_MS - elapsed))
        }
        setProducts([])
        setIsDataLoading(false)
        return
      }

      const mapped = (data ?? [])
        .map((row) => mapDbProductToStoreProduct(row as any))
        .filter((p): p is Product => p !== null)
      setProducts(mapped)
      const elapsed = Date.now() - loaderStartAt
      if (elapsed < MIN_LAB_LOADER_MS) {
        await new Promise((resolve) => window.setTimeout(resolve, MIN_LAB_LOADER_MS - elapsed))
      }
      setIsDataLoading(false)
    }

    void fetchProducts()

    const channel = supabase
      .channel("products-storefront")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          // Re-fetch so the UI reflects admin saves instantly.
          void fetchProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const queryCategory = searchParams.get("category")
    setSelectedCategory(isValidCategory(queryCategory) ? (queryCategory as Category) : null)
  }, [searchParams])

  const filteredProducts = products.filter((product) => {
    // Exclude bundles from regular grid
    if (product.isBundle) return false

    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesGoals =
      selectedGoals.length === 0 ||
      product.goals.length === 0 ||
      selectedGoals.some((goal) => product.goals.includes(goal))

    return matchesCategory && matchesGoals
  })

  // Group products by category for section display
  const groupedProducts = selectedCategory
    ? { [selectedCategory]: filteredProducts }
    : filteredProducts.reduce(
        (acc, product) => {
          if (!acc[product.category]) {
            acc[product.category] = []
          }
          acc[product.category].push(product)
          return acc
        },
        {} as Record<Category, typeof filteredProducts>
      )

  return (
    <>
      <FilterBar
        selectedCategory={selectedCategory}
        selectedGoals={selectedGoals}
        onCategoryChange={handleCategoryChange}
        onGoalsChange={setSelectedGoals}
      />

      {/* Products by Category */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <LabLoader active={showLabLoader || isDataLoading} />

        {readyToRenderStore &&
          Object.entries(groupedProducts).map(([categoryId, categoryProducts]) => {
            const category = categories.find((c) => c.id === categoryId)
            if (!category || categoryProducts.length === 0) return null

            return (
              <section key={categoryId} id={categoryId} className="mb-16 scroll-mt-32">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
                    {category.name}
                  </h2>
                  <p className="mt-2 text-muted-foreground">{category.description}</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )
          })}

        {readyToRenderStore && selectedCategory && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="max-w-xl text-lg text-muted-foreground">
              Próximamente más stock en esta categoría. Explora otros suplementos.
            </p>
          </div>
        )}

        {readyToRenderStore && !selectedCategory && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg text-muted-foreground">
              No se encontraron productos con los filtros seleccionados
            </p>
          </div>
        )}
      </div>

      {/* Bundle Banner - Show between sections */}
      {!selectedCategory && <BundleBanner />}
    </>
  )
}
