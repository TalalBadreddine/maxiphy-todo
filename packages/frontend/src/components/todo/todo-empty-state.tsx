import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Priority } from "@/types/todo"

interface TodoEmptyStateProps {
  hasSearch: boolean
  hasFilters: boolean
  onAddClick: () => void
}

export function TodoEmptyState({ hasSearch, hasFilters, onAddClick }: TodoEmptyStateProps) {
  const isFiltered = hasSearch || hasFilters

  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">
        {isFiltered
          ? "No todos match your search criteria"
          : "No todos yet. Create your first task!"
        }
      </p>
      {!isFiltered && (
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Todo
        </Button>
      )}
    </div>
  )
}