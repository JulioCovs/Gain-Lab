import type { MetadataRoute } from "next"
import { products } from "@/lib/store-data"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gainlab.mx"

  const staticRoutes: MetadataRoute.Sitemap = ["", "/faqs", "/auth", "/login", "/perfil", "/confirmacion"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: route === "" ? 1 : 0.7,
    })
  )

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/productos/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
