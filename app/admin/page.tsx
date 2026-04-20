"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { supabase } from "@/lib/supabase"

const ADMIN_EMAILS = new Set(["juliocov@icloud.com", "juancajurs@gmail.com"])

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [detectedEmail, setDetectedEmail] = useState("sin-correo")

  useEffect(() => {
    const validateAdmin = async () => {
      setLoading(true)

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        const message = error.message ?? ""
        if (message.includes("Invalid Refresh Token") || message.includes("Refresh Token Not Found")) {
          // Session storage is corrupt/missing refresh token; clear it and continue as logged out.
          try {
            await supabase.auth.signOut()
          } catch {
            // ignore
          }
        }
      }

      const email = user?.email?.toLowerCase() ?? "sin-correo"
      setDetectedEmail(email)
      setAuthorized(ADMIN_EMAILS.has(email))
      setLoading(false)
    }

    validateAdmin()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Validando acceso al dashboard...
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          Acceso Denegado para el correo: {detectedEmail}
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
