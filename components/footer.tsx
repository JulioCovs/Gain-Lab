"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { FormEvent, useState } from "react"
import { Dumbbell, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Short category names for footer
const footerCategories = [
  { id: "rendimiento", name: "Rendimiento" },
  { id: "recuperacion", name: "Recuperación" },
  { id: "bienestar", name: "Bienestar" },
  { id: "adaptogenos", name: "Adaptógenos" },
]

export function Footer() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [storedEmail, setStoredEmail] = useState("")
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category")

  // Keep highlight consistent with Header when navigating from footer.
  // This avoids bringing in routing hooks just for styling.
  const handleCategoryClick = (categoryId: string) => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) return
    const normalizedEmail = email.trim().toLowerCase()
    setStoredEmail(normalizedEmail)
    const existing = JSON.parse(localStorage.getItem("gainlab-newsletter-leads") ?? "[]") as string[]
    localStorage.setItem("gainlab-newsletter-leads", JSON.stringify([...new Set([...existing, normalizedEmail])]))
    setSubmitted(true)
    setEmail("")
  }

  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-10 rounded-2xl border border-slate-700 bg-slate-800/60 p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Mision</p>
          <p className="mt-3 max-w-5xl text-sm leading-relaxed text-slate-200">
            En Gain Lab, nuestra mision es democratizar la suplementacion de alto rendimiento en todo Mexico.
            Disenamos una experiencia de compra inteligente para atletas que no aceptan excusas y buscan
            resultados reales a traves de ciencia y calidad superior.
          </p>
          <div className="mt-5">
            <p className="mb-3 text-sm text-slate-300">
              Únete al Laboratorio. Recibe lanzamientos exclusivos y descuentos.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Suscribirme al Newsletter</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Newsletter Gain Lab</DialogTitle>
                </DialogHeader>
                <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Recibir novedades
                  </Button>
                  {submitted && (
                    <p className="text-xs text-muted-foreground">
                      Correo capturado: {storedEmail}. Gracias por unirte.
                    </p>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Dumbbell className="h-7 w-7 text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
              <span className="text-xl font-black tracking-tighter uppercase">
                GAIN <span className="text-primary">LAB</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-300">
              Suplementos premium para atletas que exigen lo mejor.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="#"
                className="text-slate-300 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-300 transition-colors hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-slate-100">Categorías</h3>
            <ul className="mt-4 space-y-3">
              {footerCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/?category=${category.id}`}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`text-sm transition-colors hover:text-white ${
                      activeCategory === category.id ? "text-sky-300" : "text-slate-300"
                    }`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-slate-100">Soporte</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/faqs"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Envíos
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-slate-100">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Términos de uso
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700 pt-8">
          <p className="text-center text-sm text-slate-300">
            © {new Date().getFullYear()} GAIN LAB. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
