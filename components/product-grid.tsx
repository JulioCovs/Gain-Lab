"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "./product-card"
import { FilterBar } from "./filter-bar"
import { BundleBanner } from "./bundle-banner"
import { supabase } from "@/lib/supabase"
import { categories, type Category, type Goal, type Product } from "@/lib/store-data"

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="overflow-hidden rounded-2xl border border-border/80 bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-3 p-6">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductGrid() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .gt("stock", 0)

      if (error) {
        console.error("Error loading products from Supabase:", error.message)
        setProducts([])
        setLoading(false)
        return
      }

      setProducts((data ?? []) as Product[])
      setLoading(false)
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    const queryCategory = searchParams.get("category")
    const isValidCategory = categories.some((category) => category.id === queryCategory)
    setSelectedCategory(isValidCategory ? (queryCategory as Category) : null)
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedCategory) {
      params.set("category", selectedCategory)
    } else {
      params.delete("category")
    }
    const nextCategory = params.get("category")
    const currentCategory = searchParams.get("category")
    if (nextCategory !== currentCategory) {
      router.replace(params.toString() ? `/?${params.toString()}` : "/", { scroll: false })
    }
  }, [selectedCategory, router, searchParams])

  const filteredProducts = products.filter((product) => {
    // Exclude bundles from regular grid
    if (product.isBundle || product.stock <= 0) return false

    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesGoals =
      selectedGoals.length === 0 ||
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
        onCategoryChange={setSelectedCategory}
        onGoalsChange={setSelectedGoals}
      />

      {/* Products by Category */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {loading && <ProductGridSkeleton />}

        {!loading &&
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

        {!loading && selectedCategory && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="max-w-xl text-lg text-muted-foreground">
              Próximamente más stock en esta categoría. Explora otros suplementos.
            </p>
          </div>
        )}

        {!loading && !selectedCategory && filteredProducts.length === 0 && (
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
