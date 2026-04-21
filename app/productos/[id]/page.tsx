import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Beaker, CheckCircle2, ChevronLeft, HeartPulse } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { products } from "@/lib/store-data"

type ProductPageProps = {
  params: Promise<{ id: string }>
}

const usageById: Record<string, string> = {
  "pre-workout-extreme": "Tomar 1 scoop 20-30 min antes de entrenar.",
  "creatina-monohidrato": "Tomar 5g diarios con agua o tu bebida post-entreno.",
  "whey-protein-isolate": "Tomar 1 scoop despues de entrenar o entre comidas.",
}

const keyBenefitsById: Record<string, string[]> = {
  "pre-workout-extreme": ["Enfoque elevado", "Rendimiento explosivo", "Mayor bombeo"],
  "creatina-monohidrato": ["Mas fuerza", "Mejor recuperacion", "Aumento de volumen"],
  "whey-protein-isolate": ["Sintesis muscular", "Absorcion rapida", "Alta pureza"],
}

export async function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = products.find((item) => item.id === id)

  if (!product) {
    return {
      title: "Producto no encontrado | Gain Lab México",
      description: "Este suplemento no esta disponible en Gain Lab Mexico.",
    }
  }

  return {
    title: `${product.name} | Gain Lab México`,
    description: `Compra ${product.name} en Gain Lab Mexico. ${product.description} Envio nacional y suplementos autenticos de alto rendimiento.`,
    alternates: {
      canonical: `/productos/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | Gain Lab México`,
      description: `Suplemento premium: ${product.name}. ${product.description}`,
      images: [{ url: product.image, alt: `${product.name} suplemento Gain Lab Mexico` }],
      type: "website",
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((item) => item.id === id)

  if (!product) {
    notFound()
  }

  const usage = usageById[product.id] ?? "Tomar 1 porcion diaria siguiendo las indicaciones de la etiqueta."
  const keyBenefits = keyBenefitsById[product.id] ?? product.benefits

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7]">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>

        <section className="mt-6 grid gap-8 rounded-2xl border border-border bg-white p-6 lg:grid-cols-2 lg:p-10">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={product.image}
              alt={`${product.name} suplemento premium de alto rendimiento`}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{product.category}</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
            <p className="text-muted-foreground">{product.description}</p>
            <p className="text-2xl font-bold">${product.price.toLocaleString()} MXN</p>

            <div className="rounded-xl border border-border p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Beaker className="h-4 w-4 text-primary" />
                Modo de uso
              </p>
              <p className="text-sm text-muted-foreground">{usage}</p>
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <HeartPulse className="h-4 w-4 text-primary" />
                Beneficios clave
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {keyBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
