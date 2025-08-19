"use client"

import { useState, useMemo } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Todo, TodoStatus } from "@/types/todo"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"

interface TodoKanbanProps {
  todos: Todo[]
  onStatusChange: (todoId: string, newStatus: TodoStatus) => Promise<void>
  onToggleComplete: (id: string) => Promise<void>
  onTogglePin: (id: string) => Promise<void>
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
  isLoading?: boolean
}

const COLUMNS: { id: TodoStatus; title: string; color: string }[] = [
  { id: "TODO", title: "To Do", color: "bg-gray-100 border-gray-300" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-50 border-blue-300" },
  { id: "DONE", title: "Done", color: "bg-green-50 border-green-300" },
]

export function TodoKanban({
  todos,
  onStatusChange,
  onToggleComplete,
  onTogglePin,
  onEdit,
  onDelete,
  isLoading = false,
}: TodoKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<Todo | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const todosByStatus = useMemo(() => {
    const grouped = todos.reduce((acc, todo) => {
      const status = todo.status || "TODO"
      if (!acc[status]) {
        acc[status] = []
      }
      acc[status].push(todo)
      return acc
    }, {} as Record<TodoStatus, Todo[]>)

    // Ensure all columns exist even if empty
    COLUMNS.forEach(column => {
      if (!grouped[column.id]) {
        grouped[column.id] = []
      }
    })

    return grouped
  }, [todos])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    const todo = todos.find(t => t.id === active.id)
    setDraggedItem(todo || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // This is handled by the columns themselves
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      setDraggedItem(null)
      return
    }

    const todoId = active.id as string
    const overId = over.id as string

    // Check if dropped over a column
    const newStatus = COLUMNS.find(col => col.id === overId)?.id
    
    if (newStatus) {
      const todo = todos.find(t => t.id === todoId)
      if (todo && todo.status !== newStatus) {
        try {
          await onStatusChange(todoId, newStatus)
        } catch (error) {
          console.error('Failed to update todo status:', error)
        }
      }
    }

    setActiveId(null)
    setDraggedItem(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-300px)] overflow-hidden">
        {COLUMNS.map((column) => (
          <SortableContext
            key={column.id}
            items={todosByStatus[column.id].map(todo => todo.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              id={column.id}
              title={column.title}
              color={column.color}
              todos={todosByStatus[column.id]}
              onToggleComplete={onToggleComplete}
              onTogglePin={onTogglePin}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={isLoading}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeId && draggedItem ? (
          <div className="opacity-80 rotate-3 scale-105">
            <KanbanCard
              todo={draggedItem}
              onToggleComplete={onToggleComplete}
              onTogglePin={onTogglePin}
              onEdit={onEdit}
              onDelete={onDelete}
              isLoading={isLoading}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}