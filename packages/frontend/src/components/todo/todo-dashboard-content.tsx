"use client"

import { memo, lazy, Suspense } from "react"
import { TodoList } from "./todo-list"
import { TodoLoadingState } from "./todo-loading-state"
import { TodoEmptyState } from "./todo-empty-state"
import { TodoErrorState } from "./todo-error-state"
import { TodoPagination } from "./todo-pagination"
import { Todo, TodoStatus, TodoFilters as TodoFiltersType } from "@/types/todo"

// Lazy load heavy components
const TodoKanban = lazy(() => import("./todo-kanban").then(module => ({ default: module.TodoKanban })))

type ViewMode = "list" | "grid" | "kanban"

interface TodoData {
  todos: Todo[]
  total: number
  totalPages: number
}

interface TodoDashboardContentProps {
  isLoading: boolean
  error: any
  todos: Todo[]
  todoData: TodoData | undefined
  viewMode: ViewMode
  hasSearch: boolean
  hasFilters: boolean
  filters: TodoFiltersType
  isActionLoading: boolean
  onAddClick: () => void
  onRefresh: () => void
  onToggleComplete: (id: string) => Promise<void>
  onTogglePin: (id: string) => Promise<void>
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onDeleteByObject: (todo: Todo) => void
  onStatusChange: (todoId: string, newStatus: TodoStatus) => Promise<void>
  onPageChange: (page: number) => void
}

export const TodoDashboardContent = memo(function TodoDashboardContent({
  isLoading,
  error,
  todos,
  todoData,
  viewMode,
  hasSearch,
  hasFilters,
  filters,
  isActionLoading,
  onAddClick,
  onRefresh,
  onToggleComplete,
  onTogglePin,
  onEdit,
  onDelete,
  onDeleteByObject,
  onStatusChange,
  onPageChange
}: TodoDashboardContentProps) {
  const pinnedTodos = todos.filter(todo => todo.pinned)
  const regularTodos = todos.filter(todo => !todo.pinned)

  if (isLoading) {
    return <TodoLoadingState />
  }

  if (error) {
    return <TodoErrorState onRetry={onRefresh} />
  }

  if (todos.length === 0) {
    return (
      <TodoEmptyState
        hasSearch={hasSearch}
        hasFilters={hasFilters}
        onAddClick={onAddClick}
      />
    )
  }

  if (viewMode === "kanban") {
    return (
      <Suspense fallback={<TodoLoadingState />}>
        <TodoKanban
          todos={todos}
          onStatusChange={onStatusChange}
          onToggleComplete={onToggleComplete}
          onTogglePin={onTogglePin}
          onEdit={onEdit}
          onDelete={onDeleteByObject}
          isLoading={isActionLoading}
        />
      </Suspense>
    )
  }

  return (
    <>
      <TodoList
        pinnedTodos={pinnedTodos}
        regularTodos={regularTodos}
        viewMode={viewMode}
        onToggleComplete={onToggleComplete}
        onTogglePin={onTogglePin}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isActionLoading}
      />

      <TodoPagination
        currentPage={filters.page || 1}
        totalPages={todoData?.totalPages || 1}
        onPageChange={onPageChange}
      />
    </>
  )
})

TodoDashboardContent.displayName = "TodoDashboardContent"