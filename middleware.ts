import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "./supabase/middleware"

const ADMIN_DASHBOARD_PATH = "/admin-dashboard"
const ADMIN_FALLBACK_PATH = "/admin"
const LOGIN_PATH = "/login"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Excepciones extra (por seguridad) para evitar tocar rutas estáticas.
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next()
  }

  const isLoginRoute = pathname === LOGIN_PATH
  const isProtectedAdminRoute =
    pathname === ADMIN_DASHBOARD_PATH ||
    pathname.startsWith(`${ADMIN_DASHBOARD_PATH}/`) ||
    pathname === ADMIN_FALLBACK_PATH ||
    pathname.startsWith(`${ADMIN_FALLBACK_PATH}/`)
  const { user, response } = await getSessionUser(request)
  const isAuthenticated = Boolean(user)

  if (isLoginRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(ADMIN_FALLBACK_PATH, request.url))
    }
    return response
  }

  if (isProtectedAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  return response
}

export const config = {
  // Solo correr en rutas relevantes (incluye /login para redirigir si ya hay sesión).
  // /auth y assets estáticos quedan fuera del matcher.
  matcher: ["/login", "/admin/:path*", "/admin-dashboard/:path*"],
}
