export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="aspect-square animate-pulse rounded-none bg-muted" />
      <div className="space-y-3 p-6">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-9 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
