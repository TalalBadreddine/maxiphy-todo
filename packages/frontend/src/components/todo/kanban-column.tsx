"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Todo, TodoStatus } from "@/types/todo"
import { KanbanCard } from "./kanban-card"
import { cn } from "@/lib/utils/cn"

interface KanbanColumnProps {
  id: TodoStatus
  title: string
  color: string
  todos: Todo[]
  onToggleComplete: (id: string) => Promise<void>
  onTogglePin: (id: string) => Promise<void>
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
  isLoading?: boolean
}

export function KanbanColumn({
  id,
  title,
  color,
  todos,
  onToggleComplete,
  onTogglePin,
  onEdit,
  onDelete,
  isLoading = false,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-lg border-2 border-dashed p-4 transition-colors",
        color,
        isOver && "ring-2 ring-blue-500 ring-opacity-50"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-white rounded-full border">
          {todos.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
        <SortableContext
          items={todos.map(todo => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          {todos.map((todo) => (
            <KanbanCard
              key={todo.id}
              todo={todo}
              onToggleComplete={onToggleComplete}
              onTogglePin={onTogglePin}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={isLoading}
            />
          ))}
        </SortableContext>
        
        {todos.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Drop todos here
          </div>
        )}
      </div>
    </div>
  )
}