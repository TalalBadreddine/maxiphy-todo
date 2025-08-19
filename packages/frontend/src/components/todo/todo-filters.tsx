"use client"

import { useState } from "react"
import { X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TodoFilters as TodoFiltersType } from "@/types/todo"
import { cn } from "@/lib/utils/cn"

interface TodoFiltersProps {
  filters: TodoFiltersType
  onFiltersChange: (filters: Partial<TodoFiltersType>) => void
  onClose: () => void
}

export function TodoFilters({ filters, onFiltersChange, onClose }: TodoFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TodoFiltersType>(filters)

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleResetFilters = () => {
    const resetFilters: TodoFiltersType = {
      sortBy: "date",
      sortOrder: "desc",
      priority: "ALL",
      page: 1,
      limit: 20
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const handleLocalFilterChange = (key: keyof TodoFiltersType, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Priority Filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "ALL", label: "All Priorities" },
              { value: "HIGH", label: "High Priority" },
              { value: "MEDIUM", label: "Medium Priority" },
              { value: "LOW", label: "Low Priority" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleLocalFilterChange("priority", option.value)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                  localFilters.priority === option.value
                    ? "bg-primary-50 border-primary-200 text-primary-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: "date", label: "Creation Date" },
              { value: "dueDate", label: "Due Date" },
              { value: "priority", label: "Priority" },
              { value: "title", label: "Title" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleLocalFilterChange("sortBy", option.value)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg border transition-colors text-left",
                  localFilters.sortBy === option.value
                    ? "bg-primary-50 border-primary-200 text-primary-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Order */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Sort Order
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "asc", label: "Ascending" },
              { value: "desc", label: "Descending" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleLocalFilterChange("sortOrder", option.value)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                  localFilters.sortOrder === option.value
                    ? "bg-primary-50 border-primary-200 text-primary-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items Per Page */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Items Per Page
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 50].map((limit) => (
              <button
                key={limit}
                onClick={() => handleLocalFilterChange("limit", limit)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                  localFilters.limit === limit
                    ? "bg-primary-50 border-primary-200 text-primary-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t mt-6">
        <Button
          variant="outline"
          onClick={handleResetFilters}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </Card>
  )
}