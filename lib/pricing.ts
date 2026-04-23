export function clampDiscountPercentage(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, Math.round(n)))
}

export function applyPercentageDiscount(amount: number, discountPercentage: number): number {
  const pct = clampDiscountPercentage(discountPercentage)
  if (!Number.isFinite(amount)) return amount
  if (pct <= 0) return amount
  const discounted = amount * (1 - pct / 100)
  // Currency-friendly integer pesos (MXN) rounding.
  return Math.round(discounted)
}

