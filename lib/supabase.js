import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables in .env.local")
}

const browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
const getUserWithValidation = browserClient.auth.getUser.bind(browserClient.auth)

// Fast path: reuse local session data on startup.
// This avoids waiting for a roundtrip to validate the user before rendering.
browserClient.auth.getUser = async (jwt) => {
  if (jwt) {
    return getUserWithValidation(jwt)
  }

  const {
    data: { session },
    error: sessionError,
  } = await browserClient.auth.getSession()

  if (sessionError) {
    return { data: { user: null }, error: sessionError }
  }

  if (session?.user) {
    return { data: { user: session.user }, error: null }
  }

  return getUserWithValidation()
}

export const supabase = browserClient
