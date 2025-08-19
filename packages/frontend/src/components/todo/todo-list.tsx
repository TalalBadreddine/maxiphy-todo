import { Todo } from "@/types/todo"
import { TodoItem } from "./todo-item"
import { cn } from "@/lib/utils/cn"

type ViewMode = "list" | "grid"

interface TodoSectionProps {
  title: string
  todos: Todo[]
  viewMode: ViewMode
  onToggleComplete: (id: string) => void
  onTogglePin: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function TodoSection({
  title,
  todos,
  viewMode,
  onToggleComplete,
  onTogglePin,
  onEdit,
  onDelete,
  isLoading
}: TodoSectionProps) {
  if (todos.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {title} ({todos.length})
      </h2>
      <div className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
      )}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleComplete={onToggleComplete}
            onTogglePin={onTogglePin}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  )
}

interface TodoListProps {
  pinnedTodos: Todo[]
  regularTodos: Todo[]
  viewMode: ViewMode
  onToggleComplete: (id: string) => void
  onTogglePin: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

export function TodoList({
  pinnedTodos,
  regularTodos,
  viewMode,
  onToggleComplete,
  onTogglePin,
  onEdit,
  onDelete,
  isLoading
}: TodoListProps) {
  return (
    <div className="space-y-6">
      <TodoSection
        title="📌 Pinned Tasks"
        todos={pinnedTodos}
        viewMode={viewMode}
        onToggleComplete={onToggleComplete}
        onTogglePin={onTogglePin}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
      />

      <TodoSection
        title={pinnedTodos.length > 0 ? "All Tasks" : ""}
        todos={regularTodos}
        viewMode={viewMode}
        onToggleComplete={onToggleComplete}
        onTogglePin={onTogglePin}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    </div>
  )
}