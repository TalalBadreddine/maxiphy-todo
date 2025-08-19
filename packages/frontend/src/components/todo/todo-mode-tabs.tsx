import { memo, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils/cn"
import { TodoCounts } from "@/types/todo"

type TodoMode = "all" | "active" | "completed"

interface TodoModeTabsProps {
  todoMode: TodoMode
  onModeChange: (mode: TodoMode) => void
  counts: TodoCounts
  isLoading?: boolean
}

const TodoModeTabsComponent = function TodoModeTabs({ 
  todoMode, 
  onModeChange, 
  counts, 
  isLoading = false 
}: TodoModeTabsProps) {
  // Static tabs structure - never changes
  const tabs = useMemo(() => [
    { key: "active" as const, label: "Active" },
    { key: "completed" as const, label: "Completed" },
    { key: "all" as const, label: "All" }
  ], [])

  const formatCount = useCallback((count: number) => {
    if (isLoading) return "..."
    return count.toString()
  }, [isLoading])

  // Get count for specific tab key
  const getCount = useCallback((key: TodoMode) => {
    return counts[key]
  }, [counts])

  return (
    <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          disabled={isLoading}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            todoMode === key
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900",
            isLoading && "opacity-60 cursor-not-allowed"
          )}
        >
          {label} ({formatCount(getCount(key))})
        </button>
      ))}
    </div>
  )
}

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: TodoModeTabsProps, 
  nextProps: TodoModeTabsProps
): boolean => {
  return (
    prevProps.todoMode === nextProps.todoMode &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.onModeChange === nextProps.onModeChange &&
    prevProps.counts.active === nextProps.counts.active &&
    prevProps.counts.completed === nextProps.counts.completed &&
    prevProps.counts.all === nextProps.counts.all
  )
}

export const TodoModeTabs = memo(TodoModeTabsComponent, arePropsEqual)

TodoModeTabs.displayName = "TodoModeTabs"