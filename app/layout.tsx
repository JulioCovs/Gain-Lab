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
  title: 'GAIN LAB | Suplementos Premium de Fitness',
  description: 'Suplementos premium formulados para atletas que exigen lo mejor. Pre-entrenos, proteínas, creatinas y adaptógenos de élite.',
  keywords: ['suplementos', 'fitness', 'proteína', 'creatina', 'pre-entreno', 'ashwagandha', 'gain lab'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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