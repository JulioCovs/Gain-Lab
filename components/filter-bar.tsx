"use client"

import { useState } from "react"
import { Filter, X, Dumbbell, Zap, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { goals, type Category, type Goal } from "@/lib/store-data"

// Short names for filter buttons
const filterCategories = [
  { id: "rendimiento" as Category, name: "Rendimiento" },
  { id: "recuperacion" as Category, name: "Recuperación" },
  { id: "bienestar" as Category, name: "Bienestar" },
  { id: "adaptogenos" as Category, name: "Adaptógenos" },
]

interface FilterBarProps {
  selectedCategory: Category | null
  selectedGoals: Goal[]
  onCategoryChange: (category: Category | null) => void
  onGoalsChange: (goals: Goal[]) => void
}

const goalIcons = {
  musculo: Dumbbell,
  energia: Zap,
  "salud-mental": Brain,
}

export function FilterBar({
  selectedCategory,
  selectedGoals,
  onCategoryChange,
  onGoalsChange,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const toggleGoal = (goal: Goal) => {
    if (selectedGoals.includes(goal)) {
      onGoalsChange(selectedGoals.filter((g) => g !== goal))
    } else {
      onGoalsChange([...selectedGoals, goal])
    }
  }

  const clearFilters = () => {
    onCategoryChange(null)
    onGoalsChange([])
  }

  const hasActiveFilters = selectedCategory || selectedGoals.length > 0

  return (
    <div className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge className="ml-1 h-5 w-5 rounded-full bg-primary p-0 text-xs">
                {(selectedCategory ? 1 : 0) + selectedGoals.length}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Desktop & Expanded Mobile Filters */}
        <div className={`${showFilters ? "mt-4 block" : "hidden"} md:block`}>
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-medium text-muted-foreground">
              Categoría:
            </span>
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(null)}
            >
              Todos
            </Button>
            {filterCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Goals */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-medium text-muted-foreground">
              Objetivo:
            </span>
            {goals.map((goal) => {
              const Icon = goalIcons[goal.id]
              const isSelected = selectedGoals.includes(goal.id)
              return (
                <Button
                  key={goal.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleGoal(goal.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {goal.name}
                </Button>
              )
            })}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 hidden items-center gap-2 md:flex">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {filterCategories.find((c) => c.id === selectedCategory)?.name}
                  <button onClick={() => onCategoryChange(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedGoals.map((goalId) => (
                <Badge key={goalId} variant="secondary" className="gap-1">
                  {goals.find((g) => g.id === goalId)?.name}
                  <button onClick={() => toggleGoal(goalId)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-2 h-6 text-xs"
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
