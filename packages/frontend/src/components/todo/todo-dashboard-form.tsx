"use client"

import { memo, lazy, Suspense } from "react"
import { TodoLoadingState } from "./todo-loading-state"
import { Todo } from "@/types/todo"
import { CreateTodoFormData, UpdateTodoFormData } from "@/lib/validations/todo"

// Lazy load the form
const TodoForm = lazy(() => import("./todo-form").then(module => ({ default: module.TodoForm })))

interface TodoDashboardFormProps {
  editingTodo: Todo | null
  onSubmit: (data: CreateTodoFormData | UpdateTodoFormData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export const TodoDashboardForm = memo(function TodoDashboardForm({
  editingTodo,
  onSubmit,
  onCancel,
  isLoading
}: TodoDashboardFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {editingTodo ? "Edit Todo" : "Create Todo"}
        </h1>
      </div>

      <Suspense fallback={<TodoLoadingState />}>
        <TodoForm
          todo={editingTodo}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          mode={editingTodo ? "edit" : "create"}
        />
      </Suspense>
    </div>
  )
})

TodoDashboardForm.displayName = "TodoDashboardForm"