"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingCart, Menu, Dumbbell, Shield, User as UserIcon } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCartStore } from "@/lib/cart-store"
import { supabase } from "@/lib/supabase"
import { CartDrawer } from "./cart-drawer"

// Short names for navigation
const navCategories = [
  { id: "rendimiento", name: "Rendimiento", shortName: "Rendimiento" },
  { id: "recuperacion", name: "Recuperación", shortName: "Recuperación" },
  { id: "bienestar", name: "Bienestar", shortName: "Bienestar" },
  { id: "adaptogenos", name: "Adaptógenos", shortName: "Adaptógenos" },
]

const ADMIN_EMAILS = new Set(["juliocov@icloud.com", "juancajurs@gmail.com"])

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [firstName, setFirstName] = useState("")
  const itemCount = useCartStore((state) => state.getItemCount())
  const isAdmin = user?.email ? ADMIN_EMAILS.has(user.email) : false

  useEffect(() => {
    const loadProfileName = async (userId: string, metadataName?: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        setFirstName(metadataName ?? "")
        return
      }

      setFirstName((data?.first_name as string | null) ?? metadataName ?? "")
    }

    const loadUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        const message = error.message ?? ""
        if (message.includes("Invalid Refresh Token") || message.includes("Refresh Token Not Found")) {
          try {
            await supabase.auth.signOut()
          } catch {
            // ignore
          }
        }
      }
      setUser(user)

      if (user) {
        await loadProfileName(user.id, user.user_metadata?.first_name as string | undefined)
      } else {
        setFirstName("")
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)

      if (sessionUser) {
        await loadProfileName(
          sessionUser.id,
          sessionUser.user_metadata?.first_name as string | undefined
        )
      } else {
        setFirstName("")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F5F5F7]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="h-7 w-7 text-primary" />
          <span className="text-xl font-black tracking-tighter uppercase text-foreground">
            GAIN <span className="text-primary">LAB</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navCategories.map((category) => (
            <Link
              key={category.id}
              href={`/#${category.id}`}
              className="text-sm font-semibold uppercase tracking-wide text-[#000000] transition-colors hover:text-[#000000]"
            >
              {category.shortName}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Auth Link */}
          {user ? (
            <Link href="/perfil" className="hidden md:block">
              <Button
                variant="ghost"
                className="max-w-[180px] gap-2 text-[#000000] hover:text-[#000000] hover:bg-black/5"
              >
                <UserIcon className="h-5 w-5" />
                <span className="truncate text-sm font-medium">
                  {firstName || "Mi Perfil"}
                </span>
              </Button>
            </Link>
          ) : (
            <Link href="/auth" className="hidden md:block">
              <Button
                variant="ghost"
                className="text-[#000000] hover:text-[#000000] hover:bg-black/5"
              >
                Iniciar Sesion
              </Button>
            </Link>
          )}

          {/* Admin Link - Distinct styling for restricted access */}
          {isAdmin && (
            <Link href="/admin" className="hidden md:block">
              <Button variant="ghost" size="icon" className="text-[#000000] hover:text-[#000000] hover:bg-black/5">
                <Shield className="h-5 w-5" />
                <span className="sr-only">Admin</span>
              </Button>
            </Link>
          )}

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#000000] hover:text-[#000000] hover:bg-black/5"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground"
              >
                {itemCount}
              </Badge>
            )}
            <span className="sr-only">Carrito</span>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-[#000000] hover:text-[#000000] hover:bg-black/5">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white">
              <div className="flex flex-col gap-8 pt-8 px-2">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Dumbbell className="h-7 w-7 text-primary" />
                  <span className="text-xl font-black tracking-tighter uppercase text-foreground">
                    GAIN <span className="text-primary">LAB</span>
                  </span>
                </Link>
                <nav className="flex flex-col space-y-6 py-4">
                  {navCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/#${category.id}`}
                      className="py-1 text-lg font-semibold uppercase tracking-wide text-[#000000] transition-colors hover:text-[#000000]"
                      onClick={() => setIsOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 pt-6 mt-2">
                    <Link
                      href={user ? "/perfil" : "/auth"}
                      className="flex items-center gap-3 py-2 text-lg font-medium text-[#000000] transition-colors hover:text-[#000000]"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserIcon className="h-5 w-5" />
                      {user ? firstName || "Mi Perfil" : "Iniciar Sesion"}
                    </Link>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium text-[#000000] transition-colors hover:text-[#000000] hover:bg-black/5"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="h-5 w-5" />
                      Admin Dashboard
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  )
}
