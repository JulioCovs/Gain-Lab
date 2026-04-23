"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product, CartItem } from "./store-data"
import { applyPercentageDiscount, clampDiscountPercentage } from "./pricing"
import { useVipDiscountStore } from "./vip-discount-store"

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  repriceAll: (vipDiscountPercentage: number) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      repriceAll: (vipDiscountPercentage) => {
        const pct = clampDiscountPercentage(vipDiscountPercentage)
        set((state) => ({
          items: state.items.map((item) => {
            const base = item.product.vipBasePrice ?? item.product.price
            if (pct <= 0) {
              const { vipBasePrice, vipDiscountPercentage, ...rest } = item.product
              return { ...item, product: { ...rest, price: base } }
            }
            return {
              ...item,
              product: {
                ...item.product,
                vipBasePrice: base,
                vipDiscountPercentage: pct,
                price: applyPercentageDiscount(base, pct),
              },
            }
          }),
        }))
      },

      addItem: (product: Product) => {
        set((state) => {
          const activeVipPct = clampDiscountPercentage(
            useVipDiscountStore.getState().discountPercentage ?? product.vipDiscountPercentage ?? 0
          )
          const base = product.vipBasePrice ?? product.price
          const normalizedProduct: Product =
            activeVipPct > 0
              ? {
                  ...product,
                  vipBasePrice: base,
                  vipDiscountPercentage: activeVipPct,
                  price: applyPercentageDiscount(base, activeVipPct),
                }
              : {
                  ...product,
                  price: base,
                }

          const existingItem = state.items.find(
            (item) => item.product.id === normalizedProduct.id
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === normalizedProduct.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { product: normalizedProduct, quantity: 1 }],
          }
        })
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "apex-cart-storage",
    }
  )
)
