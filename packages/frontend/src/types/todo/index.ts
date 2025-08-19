export interface Todo {
  id: string
  title: string
  description: string
  priority: Priority
  status: TodoStatus
  completed: boolean
  pinned: boolean
  dueDate: Date
  createdAt: Date
  updatedAt: Date
  userId: string
}

export type Priority = "LOW" | "MEDIUM" | "HIGH"
export type TodoStatus = "TODO" | "IN_PROGRESS" | "DONE"

export interface CreateTodoRequest {
  title: string
  description: string
  priority: Priority
  status: TodoStatus
  dueDate: Date
}

export interface UpdateTodoRequest {
  id: string
  title?: string
  description?: string
  priority?: Priority
  status?: TodoStatus
  completed?: boolean
  pinned?: boolean
  dueDate?: Date
}

export interface TodoFilters {
  search?: string
  priority?: Priority | "ALL"
  completed?: boolean | "ALL"
  sortBy?: "date" | "priority" | "title"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export interface TodoCounts {
  active: number
  completed: number
  all: number
}

export interface TodoResponse {
  todos: Todo[]
  total: number
  page: number
  limit: number
  totalPages: number
  counts: TodoCounts
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  statusCode?: number
}