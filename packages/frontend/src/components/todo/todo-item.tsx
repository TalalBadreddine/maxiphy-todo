"use client"

import { memo, useState } from "react"
import { format } from "date-fns"
import { 
  CheckCircle2, 
  Circle, 
  Pin, 
  PinOff, 
  Edit3, 
  Trash2, 
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Todo, Priority } from "@/types/todo"
import { cn } from "@/lib/utils/cn"

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string) => void
  onTogglePin: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const priorityConfig: Record<Priority, { 
  color: string
  bgColor: string
  textColor: string
  icon: React.ReactNode
}> = {
  HIGH: {
    color: "border-red-200",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    icon: <AlertCircle className="h-3 w-3" />
  },
  MEDIUM: {
    color: "border-yellow-200", 
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    icon: <AlertCircle className="h-3 w-3" />
  },
  LOW: {
    color: "border-green-200",
    bgColor: "bg-green-50", 
    textColor: "text-green-700",
    icon: <Circle className="h-3 w-3" />
  }
}

const TodoItem = memo(({ 
  todo, 
  onToggleComplete, 
  onTogglePin, 
  onEdit, 
  onDelete, 
  isLoading = false 
}: TodoItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const priorityStyle = priorityConfig[todo.priority]
  
  const isOverdue = new Date(todo.dueDate) < new Date() && !todo.completed
  const isDueToday = format(new Date(todo.dueDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <Card className={cn(
      "p-4 transition-all duration-200 hover:shadow-md border-l-4",
      priorityStyle.color,
      todo.completed && "opacity-75",
      todo.pinned && "ring-2 ring-blue-200 ring-opacity-50",
      isOverdue && !todo.completed && "border-l-red-500",
      isLoading && "pointer-events-none opacity-50"
    )}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Complete Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0 mt-0.5"
              onClick={() => onToggleComplete(todo.id)}
              disabled={isLoading}
              aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {todo.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 hover:text-green-500" />
              )}
            </Button>

            {/* Title and Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "font-medium truncate",
                  todo.completed && "line-through text-gray-500"
                )}>
                  {todo.title}
                </h3>
                
                {/* Priority Badge */}
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs px-2 py-0.5 shrink-0",
                    priorityStyle.bgColor,
                    priorityStyle.textColor
                  )}
                >
                  {priorityStyle.icon}
                  <span className="ml-1">{todo.priority}</span>
                </Badge>

                {/* Pin Indicator */}
                {todo.pinned && (
                  <Pin className="h-4 w-4 text-blue-500 shrink-0" />
                )}
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span className={cn(
                  isOverdue && !todo.completed && "text-red-500 font-medium",
                  isDueToday && !todo.completed && "text-orange-500 font-medium"
                )}>
                  {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                  {isOverdue && !todo.completed && " (Overdue)"}
                  {isDueToday && !todo.completed && " (Due Today)"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Expand/Collapse */}
            {todo.description && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse description" : "Expand description"}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Pin Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onTogglePin(todo.id)}
              disabled={isLoading}
              aria-label={todo.pinned ? "Unpin todo" : "Pin todo"}
            >
              {todo.pinned ? (
                <PinOff className="h-4 w-4 text-blue-500" />
              ) : (
                <Pin className="h-4 w-4 text-gray-400 hover:text-blue-500" />
              )}
            </Button>

            {/* Edit */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(todo)}
              disabled={isLoading}
              aria-label="Edit todo"
            >
              <Edit3 className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onDelete(todo.id)}
              disabled={isLoading}
              aria-label="Delete todo"
            >
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </Button>
          </div>
        </div>

        {/* Description (Expandable) */}
        {todo.description && isExpanded && (
          <div className="ml-9 pl-3 border-l-2 border-gray-100">
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {todo.description}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="ml-9 flex items-center justify-between text-xs text-gray-400">
          <span>Created {format(new Date(todo.createdAt), 'MMM dd, yyyy')}</span>
          {todo.updatedAt !== todo.createdAt && (
            <span>Updated {format(new Date(todo.updatedAt), 'MMM dd, yyyy')}</span>
          )}
        </div>
      </div>
    </Card>
  )
})

TodoItem.displayName = "TodoItem"

export { TodoItem }