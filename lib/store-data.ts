export type Category = "rendimiento" | "recuperacion" | "bienestar" | "adaptogenos"
export type Goal = "musculo" | "energia" | "salud-mental"

export interface Product {
  id: string
  name: string
  slug: string
  category: Category
  goals: Goal[]
  price: number
  originalPrice?: number
  description: string
  benefits: string[]
  stock: number
  image: string
  badge?: string
  isBundle?: boolean
  bundleItems?: string[]
  bundleDiscount?: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export const categories: { id: Category; name: string; description: string }[] = [
  {
    id: "rendimiento",
    name: "MAXIMIZA TU RENDIMIENTO",
    description: "Pre-entrenos y creatinas para entrenamientos explosivos"
  },
  {
    id: "recuperacion",
    name: "RECUPERACIÓN ÉLITE",
    description: "Proteínas premium para una síntesis muscular óptima"
  },
  {
    id: "bienestar",
    name: "BIENESTAR TOTAL",
    description: "Magnesio, Omega-3 y micronutrientes esenciales"
  },
  {
    id: "adaptogenos",
    name: "DOMINA TU MENTE",
    description: "Adaptógenos para el control del estrés y rendimiento cognitivo"
  }
]

export const goals: { id: Goal; name: string; icon: string }[] = [
  { id: "musculo", name: "Músculo", icon: "💪" },
  { id: "energia", name: "Energía", icon: "⚡" },
  { id: "salud-mental", name: "Salud Mental", icon: "🧠" }
]

export const products: Product[] = [
  // Rendimiento
  {
    id: "pre-workout-extreme",
    name: "Pre-Workout Extreme",
    slug: "pre-workout-extreme",
    category: "rendimiento",
    goals: ["energia", "musculo"],
    price: 899,
    description: "Fórmula avanzada con 300mg de cafeína, beta-alanina y citrulina para un rendimiento explosivo.",
    benefits: ["Energía explosiva", "Mayor concentración", "Bombeo muscular"],
    stock: 45,
    image: "/products/pre-workout.jpg",
    badge: "Bestseller"
  },
  {
    id: "creatina-monohidrato",
    name: "Creatina Monohidrato",
    slug: "creatina-monohidrato",
    category: "rendimiento",
    goals: ["musculo", "energia"],
    price: 599,
    description: "Creatina micronizada de la más alta pureza. 5g por dosis para máxima absorción.",
    benefits: ["Fuerza máxima", "Volumen muscular", "Rendimiento atlético"],
    stock: 120,
    image: "/products/creatine.jpg"
  },
  {
    id: "pre-workout-stim-free",
    name: "Pre-Workout Sin Estimulantes",
    slug: "pre-workout-stim-free",
    category: "rendimiento",
    goals: ["musculo"],
    price: 799,
    description: "Toda la potencia sin cafeína. Perfecto para entrenamientos nocturnos.",
    benefits: ["Sin estimulantes", "Bombeo intenso", "Entrenamientos nocturnos"],
    stock: 8,
    image: "/products/stim-free.jpg"
  },

  // Recuperación
  {
    id: "whey-protein-isolate",
    name: "Whey Protein Isolate",
    slug: "whey-protein-isolate",
    category: "recuperacion",
    goals: ["musculo"],
    price: 1099,
    description: "Proteína de suero aislada con 27g de proteína por servicio y menos de 1g de grasa.",
    benefits: ["Rápida absorción", "Bajo en grasas", "27g proteína/servicio"],
    stock: 67,
    image: "/products/whey-isolate.jpg",
    badge: "Premium"
  },
  {
    id: "caseina-micelar",
    name: "Caseína Micelar",
    slug: "caseina-micelar",
    category: "recuperacion",
    goals: ["musculo"],
    price: 999,
    description: "Proteína de liberación lenta para mantener el anabolismo durante la noche.",
    benefits: ["Liberación lenta", "Ideal para dormir", "Anti-catabólico"],
    stock: 34,
    image: "/products/casein.jpg"
  },
  {
    id: "bcaa-essential",
    name: "BCAA Essential",
    slug: "bcaa-essential",
    category: "recuperacion",
    goals: ["musculo", "energia"],
    price: 699,
    description: "Aminoácidos ramificados en ratio 2:1:1 para una recuperación óptima.",
    benefits: ["Reduce fatiga", "Preserva músculo", "Mejora recuperación"],
    stock: 5,
    image: "/products/bcaa.jpg"
  },

  // Bienestar
  {
    id: "magnesio-bisglicinato",
    name: "Magnesio Bisglicinato",
    slug: "magnesio-bisglicinato",
    category: "bienestar",
    goals: ["salud-mental", "musculo"],
    price: 499,
    description: "La forma más biodisponible de magnesio. Ideal para relajación y recuperación muscular.",
    benefits: ["Mejor sueño", "Relajación muscular", "Reduce calambres"],
    stock: 89,
    image: "/products/magnesium.jpg"
  },
  {
    id: "omega-3-ultra",
    name: "Omega-3 Ultra",
    slug: "omega-3-ultra",
    category: "bienestar",
    goals: ["salud-mental"],
    price: 559,
    description: "Aceite de pescado ultra concentrado con 1000mg EPA y 500mg DHA por cápsula.",
    benefits: ["Salud cardiovascular", "Función cerebral", "Reduce inflamación"],
    stock: 156,
    image: "/products/omega3.jpg"
  },
  {
    id: "vitamina-d3-k2",
    name: "Vitamina D3 + K2",
    slug: "vitamina-d3-k2",
    category: "bienestar",
    goals: ["salud-mental", "musculo"],
    price: 399,
    description: "Combinación sinérgica para salud ósea, inmunidad y bienestar general.",
    benefits: ["Salud ósea", "Sistema inmune", "Absorción de calcio"],
    stock: 3,
    image: "/products/vitamind.jpg"
  },

  // Adaptógenos
  {
    id: "ashwagandha-ksm66",
    name: "Ashwagandha KSM-66",
    slug: "ashwagandha-ksm66",
    category: "adaptogenos",
    goals: ["salud-mental", "energia", "musculo"],
    price: 659,
    description: "Extracto patentado de raíz completa con la mayor concentración de withanólidos.",
    benefits: ["Reduce el estrés", "Mejora el sueño", "Aumenta testosterona"],
    stock: 78,
    image: "/products/ashwagandha.jpg",
    badge: "Más vendido"
  },
  {
    id: "rhodiola-rosea",
    name: "Rhodiola Rosea",
    slug: "rhodiola-rosea",
    category: "adaptogenos",
    goals: ["energia", "salud-mental"],
    price: 579,
    description: "Adaptógeno potente para combatir la fatiga y mejorar el rendimiento mental.",
    benefits: ["Anti-fatiga", "Claridad mental", "Resistencia al estrés"],
    stock: 12,
    image: "/products/rhodiola.jpg"
  },
  {
    id: "lions-mane",
    name: "Lion's Mane",
    slug: "lions-mane",
    category: "adaptogenos",
    goals: ["salud-mental"],
    price: 739,
    description: "Hongo nootrópico para la función cognitiva y la salud del sistema nervioso.",
    benefits: ["Función cognitiva", "Memoria", "Neuroprotección"],
    stock: 7,
    image: "/products/lionsmane.jpg"
  },

  // Bundle
  {
    id: "combo-bienestar",
    name: "Combo Bienestar",
    slug: "combo-bienestar",
    category: "bienestar",
    goals: ["salud-mental"],
    price: 899,
    originalPrice: 1058,
    description: "Magnesio Bisglicinato + Omega-3 Ultra. El dúo perfecto para tu bienestar diario.",
    benefits: ["15% de descuento", "Sinergia perfecta", "Bienestar completo"],
    stock: 25,
    image: "/products/combo-bienestar.jpg",
    badge: "Ahorra 15%",
    isBundle: true,
    bundleItems: ["magnesio-bisglicinato", "omega-3-ultra"],
    bundleDiscount: 15
  }
]

export function getProductsByCategory(category: Category): Product[] {
  return products.filter(p => p.category === category)
}

export function getProductsByGoal(goal: Goal): Product[] {
  return products.filter(p => p.goals.includes(goal))
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getLowStockProducts(threshold: number = 10): Product[] {
  return products.filter(p => p.stock < threshold && !p.isBundle)
}

export function getBundles(): Product[] {
  return products.filter(p => p.isBundle)
}

export function checkBundleEligibility(cartItems: CartItem[]): {
  eligible: boolean
  bundle: Product | null
  savings: number
} {
  const bundle = products.find(p => p.id === "combo-bienestar")
  if (!bundle || !bundle.bundleItems) {
    return { eligible: false, bundle: null, savings: 0 }
  }

  const cartProductIds = cartItems.map(item => item.product.id)
  const hasAllBundleItems = bundle.bundleItems.every(id => cartProductIds.includes(id))

  if (hasAllBundleItems && bundle.originalPrice) {
    return {
      eligible: true,
      bundle,
      savings: bundle.originalPrice - bundle.price
    }
  }

  return { eligible: false, bundle: null, savings: 0 }
}
