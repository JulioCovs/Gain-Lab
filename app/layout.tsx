import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react' // 1. Importamos Suspense
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: 'Gain Lab | Suplementos Premium',
  description: 'La mejor selección de suplementos para potenciar tu entrenamiento. Calidad de laboratorio para tus ganancias.',
  keywords: ['suplementos', 'fitness', 'proteína', 'creatina', 'pre-entreno', 'ashwagandha', 'gain lab'],
  icons: {
    icon: '/gainlab_logo.PNG',
  },
  openGraph: {
    title: 'Gain Lab | Suplementos Premium',
    description: 'La mejor selección de suplementos para potenciar tu entrenamiento. Calidad de laboratorio para tus ganancias.',
    type: 'website',
    locale: 'es_MX',
    images: [
      {
        url: '/gainlab_logo.PNG',
        width: 1024,
        height: 1024,
        alt: 'Gain Lab',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {/* 2. Envolvemos el children en Suspense. 
            Esto es como un escudo: si una página falla al pre-renderizarse, 
            el Suspense la atrapa y permite que el build continúe. */}
        <Suspense fallback={null}>
          {children}
        </Suspense>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}