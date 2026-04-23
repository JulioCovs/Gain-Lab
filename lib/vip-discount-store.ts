"use client"

import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import { clampDiscountPercentage } from "@/lib/pricing"

type VipDiscountState = {
  loading: boolean
  email: string | null
  discountPercentage: number
  refreshForEmail: (email: string | null | undefined) => Promise<void>
  clear: () => void
}

export const useVipDiscountStore = create<VipDiscountState>((set, get) => ({
  loading: false,
  email: null,
  discountPercentage: 0,

  refreshForEmail: async (email) => {
    const normalizedEmail = (email ?? "").trim().toLowerCase()
    if (!normalizedEmail) {
      set({ loading: false, email: null, discountPercentage: 0 })
      return
    }

    if (get().loading && get().email === normalizedEmail) return

    set({ loading: true, email: normalizedEmail })

    const { data, error } = await supabase
      .from("exclusive_discounts")
      .select("discount_percentage")
      .eq("email", normalizedEmail)
      .maybeSingle()

    if (error) {
      set({ loading: false, discountPercentage: 0 })
      return
    }

    const pct = clampDiscountPercentage(data?.discount_percentage ?? 0)
    set({ loading: false, discountPercentage: pct })
  },

  clear: () => {
    set({ loading: false, email: null, discountPercentage: 0 })
  },
}))

