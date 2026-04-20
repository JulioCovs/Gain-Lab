import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  description: string
  variant?: "default" | "warning" | "success"
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: StatsCardProps) {
  const variants = {
    default: "border-border bg-card",
    warning: "border-warning/50 bg-warning/5",
    success: "border-success/50 bg-success/5",
  }

  const iconVariants = {
    default: "bg-muted text-muted-foreground",
    warning: "bg-warning/20 text-warning",
    success: "bg-success/20 text-success",
  }

  return (
    <div className={`rounded-xl border p-6 ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={`rounded-lg p-2 ${iconVariants[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
