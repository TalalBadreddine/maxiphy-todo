"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { format } from "date-fns"
import { Todo } from "@/types/todo"
import { cn } from "@/lib/utils/cn"
import { Calendar, Pin, MoreHorizontal, Edit, Trash2 } from "lucide-react"

interface KanbanCardProps {
  todo: Todo
  onToggleComplete: (id: string) => Promise<void>
  onTogglePin: (id: string) => Promise<void>
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
  isLoading?: boolean
  isDragging?: boolean
}

export function KanbanCard({
  todo,
  onToggleComplete,
  onTogglePin,
  onEdit,
  onDelete,
  isLoading = false,
  isDragging = false,
}: KanbanCardProps) {
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  
  // dnd-kit setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = (priority: string) => {
    if (priority === "HIGH") return "border-l-red-500 bg-red-50"
    if (priority === "MEDIUM") return "border-l-yellow-500 bg-yellow-50"
    if (priority === "LOW") return "border-l-green-500 bg-green-50"
    return "border-l-gray-500 bg-gray-50"
  }

  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), "MMM dd")
    } catch (err) {
      // sometimes date formatting fails
      return "Invalid date"
    }
  }

  const isOverdue = () => {
    if (todo.completed) return false
    try {
      return new Date(todo.dueDate) < new Date()
    } catch {
      return false
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative group cursor-grab active:cursor-grabbing",
        "bg-white rounded-lg border border-gray-200 p-4 shadow-sm",
        "hover:shadow-md transition-shadow duration-200",
        "border-l-4",
        getPriorityColor(todo.priority),
        (isSortableDragging || isDragging) && "opacity-50 shadow-lg",
        isLoading && "opacity-60 pointer-events-none"
      )}
    >
      {/* Pin indicator */}
      {todo.pinned && (
        <div className="absolute top-2 right-2">
          <Pin className="h-4 w-4 text-yellow-500 fill-current" />
        </div>
      )}

      {/* Actions dropdown */}
      {!isDragging && (
        <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActionsMenu(!showActionsMenu)
              }}
              className="p-1 rounded hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
            
            {showActionsMenu && (
              <div className="absolute top-6 right-0 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(todo)
                    setShowActionsMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePin(todo.id)
                    setShowActionsMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Pin className="h-4 w-4 mr-2" />
                  {todo.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(todo)
                    setShowActionsMenu(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h4 className={cn(
          "font-medium text-gray-900 leading-5",
          todo.completed && "line-through text-gray-500"
        )}>
          {todo.title}
        </h4>

        {/* Description */}
        {todo.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {todo.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {/* Due date */}
          <div className={cn(
            "flex items-center space-x-1",
            isOverdue() && "text-red-600"
          )}>
            <Calendar className="h-3 w-3" />
            <span>{formatDate(todo.dueDate)}</span>
          </div>

          {/* Priority badge */}
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            todo.priority === "HIGH" && "bg-red-100 text-red-800",
            todo.priority === "MEDIUM" && "bg-yellow-100 text-yellow-800",
            todo.priority === "LOW" && "bg-green-100 text-green-800"
          )}>
            {todo.priority}
          </span>
        </div>

        {/* Completion checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => {
              e.stopPropagation()
              onToggleComplete(todo.id)
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-600">
            {todo.completed ? "Completed" : "Mark as complete"}
          </label>
        </div>
      </div>
    </div>
  )
}