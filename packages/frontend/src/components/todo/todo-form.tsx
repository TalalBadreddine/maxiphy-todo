"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Card } from "@/components/ui/card"
import { 
  createTodoSchema, 
  updateTodoSchema, 
  CreateTodoFormData,
  UpdateTodoFormData 
} from "@/lib/validations/todo"
import { Todo } from "@/types/todo"
import { cn } from "@/lib/utils/cn"

interface TodoFormProps {
  todo?: Todo | null
  onSubmit: (data: CreateTodoFormData | UpdateTodoFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  mode: "create" | "edit"
}

export function TodoForm({ 
  todo, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  mode 
}: TodoFormProps) {
  const isEditing = mode === "edit" && todo

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<CreateTodoFormData | UpdateTodoFormData>({
    resolver: zodResolver(isEditing ? updateTodoSchema : createTodoSchema),
    defaultValues: isEditing ? {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      status: todo.status || "TODO",
      dueDate: new Date(todo.dueDate),
    } : {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // default to tomorrow
    },
  })

  const watchedDueDate = watch("dueDate")

  const handleFormSubmit = async (data: CreateTodoFormData | UpdateTodoFormData) => {
    try {
      await onSubmit(data)
    } catch (err: any) {
      // handle form errors
      if (err?.field) {
        setError(err.field, { message: err.message })
      } else {
        setError("root", { message: err?.message || "Something went wrong" })
      }
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      setValue("dueDate", new Date(value))
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? "Edit Todo" : "New Todo"}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditing ? "Make your changes below" : "Add a new task to your list"}
            </p>
          </div>

          {/* Title */}
          <FormField
            label="Title"
            type="text"
            placeholder="Enter todo title..."
            error={errors.title?.message}
            required
            {...register("title")}
          />

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className={cn(
                "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm",
                "placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                "disabled:cursor-not-allowed disabled:opacity-50",
                errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
              placeholder="Enter todo description (optional)..."
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              {...register("priority")}
              className={cn(
                "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm",
                "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                "disabled:cursor-not-allowed disabled:opacity-50",
                errors.priority && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
            {errors.priority && (
              <p className="text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              {...register("status")}
              className={cn(
                "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm",
                "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                "disabled:cursor-not-allowed disabled:opacity-50",
                errors.status && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                onChange={handleDateChange}
                value={watchedDueDate ? format(new Date(watchedDueDate), 'yyyy-MM-dd') : ''}
                className={cn(
                  "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm",
                  "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  errors.dueDate && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.dueDate && (
              <p className="text-sm text-red-600">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Global Error */}
          {errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {errors.root.message}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading 
              ? (isEditing ? "Updating..." : "Creating...") 
              : (isEditing ? "Update Todo" : "Create Todo")
            }
          </Button>
        </div>
      </form>
    </Card>
  )
}