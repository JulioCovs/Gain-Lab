import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const ALLOWED_EMAILS = new Set(["juliocov@icloud.com", "juancajurs@gmail.com"])

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  return atob(padded)
}

function extractTokenFromCookie(rawCookieValue: string | undefined): string | null {
  if (!rawCookieValue) return null

  // Some setups store the raw access token directly.
  if (rawCookieValue.split(".").length === 3) return rawCookieValue

  // Some setups store JSON with access_token.
  try {
    const parsed = JSON.parse(rawCookieValue) as { access_token?: string }
    if (parsed.access_token) return parsed.access_token
  } catch {
    // Ignore, we try other formats below.
  }

  // Supabase SSR can store cookie as base64-encoded JSON.
  if (rawCookieValue.startsWith("base64-")) {
    try {
      const decoded = decodeBase64Url(rawCookieValue.replace("base64-", ""))
      const parsed = JSON.parse(decoded) as { access_token?: string }
      if (parsed.access_token) return parsed.access_token
    } catch {
      return null
    }
  }

  return null
}

function readSupabaseAccessToken(request: NextRequest): string | null {
  const cookieStore = request.cookies.getAll()

  const directToken = extractTokenFromCookie(request.cookies.get("sb-access-token")?.value)
  if (directToken) return directToken

  const authCookie = cookieStore.find((cookie) =>
    /^sb-[a-z0-9]+-auth-token$/.test(cookie.name)
  )
  if (authCookie) {
    const token = extractTokenFromCookie(authCookie.value)
    if (token) return token
  }

  const chunkedCookies = cookieStore
    .filter((cookie) => /^sb-[a-z0-9]+-auth-token\.\d+$/.test(cookie.name))
    .sort((a, b) => Number(a.name.split(".").pop()) - Number(b.name.split(".").pop()))

  if (chunkedCookies.length > 0) {
    const combined = chunkedCookies.map((cookie) => cookie.value).join("")
    const token = extractTokenFromCookie(combined)
    if (token) return token
  }

  return null
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const accessToken = readSupabaseAccessToken(request)
  if (!accessToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  console.log("Correo del usuario intentando entrar:", user.email)

  const normalizedEmail = user.email?.toLowerCase()
  if (!normalizedEmail || !ALLOWED_EMAILS.has(normalizedEmail)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
