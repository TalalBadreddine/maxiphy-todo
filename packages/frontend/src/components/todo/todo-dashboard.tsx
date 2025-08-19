"use client"

import { useState, useMemo, useCallback } from "react"
import { TodoDashboardHeader } from "./todo-dashboard-header"
import { TodoDashboardControls } from "./todo-dashboard-controls"
import { TodoDashboardContent } from "./todo-dashboard-content"
import { TodoDashboardForm } from "./todo-dashboard-form"
import { TodoConfirmationModal } from "./todo-confirmation-modal"
import { useTodos, useTodoCounts, useTodoActions } from "@/hooks/todo/use-todos"
import { useDebounce } from "@/hooks/use-debounce"
import { Todo, TodoFilters as TodoFiltersType, TodoStatus } from "@/types/todo"
import { CreateTodoFormData, UpdateTodoFormData } from "@/lib/validations/todo"

type ViewMode = "list" | "grid" | "kanban"
type TodoMode = "all" | "active" | "completed"

export function TodoDashboard() {
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [todoMode, setTodoMode] = useState<TodoMode>("active")
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null)

  const [search, setSearch] = useState<string>("")
  const [filters, setFilters] = useState<TodoFiltersType>({
    sortBy: "date",
    sortOrder: "desc",
    page: 1,
    limit: 20
  })

  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
    completed: todoMode === "all" ? "ALL" : todoMode === "completed",
  }), [filters, debouncedSearch, todoMode])


  const { data: todoData, isLoading, error, refetch } = useTodos(queryFilters)
  const { data: counts, isLoading: isCountsLoading } = useTodoCounts()
  const { actions, isLoading: isActionLoading } = useTodoActions()
  const todos = useMemo(() => todoData?.todos || [], [todoData?.todos])

  const handleCreateTodo = useCallback(async (data: CreateTodoFormData) => {
    await actions.create(data)
    setShowForm(false)
  }, [actions])

  const handleUpdateTodo = useCallback(async (data: UpdateTodoFormData) => {
    await actions.update(data)
    setEditingTodo(null)
    setShowForm(false)
  }, [actions])

  const handleDeleteTodo = useCallback((id: string) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      setTodoToDelete(todo)
    }
  }, [todos])

  const handleDeleteTodoByObject = useCallback((todo: Todo) => {
    setTodoToDelete(todo)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (todoToDelete) {
      try {
        await actions.delete(todoToDelete.id)
        setTodoToDelete(null)
      } catch (error) {
        console.error('Failed to delete todo:', error)
      }
    }
  }, [actions, todoToDelete])

  const handleCancelDelete = useCallback(() => {
    setTodoToDelete(null)
  }, [])

  const handleToggleComplete = useCallback(async (id: string) => {
    await actions.toggleComplete(id)
  }, [actions])

  const handleTogglePin = useCallback(async (id: string) => {
    await actions.togglePin(id)
  }, [actions])

  const handleStatusChange = useCallback(async (todoId: string, newStatus: TodoStatus) => {
    await actions.updateStatus({ id: todoId, status: newStatus })
  }, [actions])

  const handleEditTodo = useCallback((todo: Todo) => {
    setEditingTodo(todo)
    setShowForm(true)
  }, [])

  const handleCancelForm = useCallback(() => {
    setShowForm(false)
    setEditingTodo(null)
  }, [])

  const handleFilterChange = useCallback((newFilters: Partial<TodoFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  const totalCount = todoData?.total || 0
  const todoCounts = counts || { active: 0, completed: 0, all: 0 }

  const hasSearch = Boolean(search)
  const hasFilters = filters.priority !== "ALL"

  if (showForm) {
    return (
      <TodoDashboardForm
        editingTodo={editingTodo}
        onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
        onCancel={handleCancelForm}
        isLoading={isActionLoading}
      />
    )
  }

  return (
    <div className="space-y-6">
      <TodoDashboardHeader
        totalCount={totalCount}
        onAddClick={() => setShowForm(true)}
      />

      <TodoDashboardControls
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        todoMode={todoMode}
        onModeChange={setTodoMode}
        counts={todoCounts}
        isLoading={isCountsLoading}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onCloseFilters={() => setShowFilters(false)}
      />

      <div className="space-y-6">
        <TodoDashboardContent
          isLoading={isLoading}
          error={error}
          todos={todos}
          todoData={todoData}
          viewMode={viewMode}
          hasSearch={hasSearch}
          hasFilters={hasFilters}
          filters={filters}
          isActionLoading={isActionLoading}
          onAddClick={() => setShowForm(true)}
          onRefresh={refetch}
          onToggleComplete={handleToggleComplete}
          onTogglePin={handleTogglePin}
          onEdit={handleEditTodo}
          onDelete={handleDeleteTodo}
          onDeleteByObject={handleDeleteTodoByObject}
          onStatusChange={handleStatusChange}
          onPageChange={handlePageChange}
        />
      </div>

      <TodoConfirmationModal
        todoToDelete={todoToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isActionLoading}
      />
    </div>
  )
}