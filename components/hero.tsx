"use client"

import { ArrowRight, Zap, Shield, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background Elements - Subtle for light mode */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gray-100 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Content */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              <Zap className="h-4 w-4" />
              Suplementación de Élite
            </div>

            <h1 className="mt-8 text-5xl font-black uppercase tracking-tight text-gray-900 sm:text-6xl lg:text-7xl text-balance">
              Potencia
              <span className="block text-primary">Sin Límites</span>
            </h1>

            <p className="mt-6 max-w-lg text-2xl font-semibold text-gray-700 leading-relaxed">
              Fórmulas de élite. Dosis clínicas. Resultados reales.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="#rendimiento">
                <Button 
                  size="lg" 
                  className="gap-2 bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-wide px-8 py-6 text-base shadow-md transition-all hover:shadow-lg"
                >
                  Explorar productos
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#bienestar">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-400 font-bold uppercase tracking-wide px-8 py-6 text-base"
                >
                  Ver combos
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center md:items-start md:text-left group">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-wide text-gray-900">100% Natural</p>
                <p className="text-xs text-gray-500">Sin aditivos</p>
              </div>
              <div className="flex flex-col items-center text-center md:items-start md:text-left group">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-wide text-gray-900">Dosis Clínicas</p>
                <p className="text-xs text-gray-500">Comprobadas</p>
              </div>
              <div className="flex flex-col items-center text-center md:items-start md:text-left group">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-3 text-sm font-bold uppercase tracking-wide text-gray-900">Envío 24h</p>
                <p className="text-xs text-gray-500">Gratis +$999 MXN</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#F5F5F7] via-white to-primary/5 border border-gray-200 shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="h-72 w-72 rounded-full bg-primary/5 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-56 w-56 rounded-full bg-primary/10 border-2 border-primary/20" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-primary tracking-tighter">GAIN</span>
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">LAB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
