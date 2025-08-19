import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TodoHeaderProps {
  totalCount: number
  onAddClick: () => void
}

export function TodoHeader({ totalCount, onAddClick }: TodoHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600">
          {totalCount} {totalCount === 1 ? 'task' : 'tasks'} total
        </p>
      </div>

      <Button onClick={onAddClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Task
      </Button>
    </div>
  )
}