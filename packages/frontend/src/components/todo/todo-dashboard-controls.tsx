"use client"

import { memo, lazy, Suspense } from "react"
import { TodoControls } from "./todo-controls"
import { TodoModeTabs } from "./todo-mode-tabs"
import { TodoFilters as TodoFiltersType } from "@/types/todo"

// Lazy load filters
const TodoFilters = lazy(() => import("./todo-filters").then(module => ({ default: module.TodoFilters })))

type ViewMode = "list" | "grid" | "kanban"
type TodoMode = "all" | "active" | "completed"

interface TodoCounts {
  active: number
  completed: number
  all: number
}

interface TodoDashboardControlsProps {
  search: string
  onSearchChange: (search: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  showFilters: boolean
  onToggleFilters: () => void
  todoMode: TodoMode
  onModeChange: (mode: TodoMode) => void
  counts: TodoCounts
  isLoading: boolean
  filters: TodoFiltersType
  onFiltersChange: (filters: Partial<TodoFiltersType>) => void
  onCloseFilters: () => void
}

export const TodoDashboardControls = memo(function TodoDashboardControls({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  todoMode,
  onModeChange,
  counts,
  isLoading,
  filters,
  onFiltersChange,
  onCloseFilters
}: TodoDashboardControlsProps) {
  return (
    <div className="space-y-4">
      <TodoControls
        search={search}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
      />

      <TodoModeTabs
        todoMode={todoMode}
        onModeChange={onModeChange}
        counts={counts}
        isLoading={isLoading}
      />

      {showFilters && (
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg" />}>
          <TodoFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClose={onCloseFilters}
          />
        </Suspense>
      )}
    </div>
  )
})

TodoDashboardControls.displayName = "TodoDashboardControls"