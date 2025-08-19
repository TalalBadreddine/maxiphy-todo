import { apiClient } from "@/services/api/client"
import { SimpleErrorService } from "@/lib/errors/simple-error-service"
import { 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  TodoFilters, 
  TodoResponse,
  ApiResponse,
  TodoStatus 
} from "@/types/todo"

export class TodoService {
  // API endpoints
  private static readonly ENDPOINTS = {
    TODOS: "/todos",
    TODOS_COUNTS: "/todos/counts",
    TODO_BY_ID: (id: string) => `/todos/${id}`,
    TOGGLE_COMPLETE: (id: string) => `/todos/${id}/toggle`,
    TOGGLE_PIN: (id: string) => `/todos/${id}/pin`,
    UPDATE_STATUS: (id: string) => `/todos/${id}/status`,
  } as const

  static async getTodoCounts(): Promise<TodoCounts> {
    try {
      const response = await apiClient.get<TodoCounts>(
        this.ENDPOINTS.TODOS_COUNTS,
        {
          withCredentials: true,
        }
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch todo counts')
      }
      
      return response.data
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }

  static async getTodos(filters?: TodoFilters): Promise<TodoResponse> {
    try {
      const params = new URLSearchParams()
      
      // build query params
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null && value !== "ALL") {
            params.append(key, String(value))
          }
        }
      }

      const response = await apiClient.get<TodoResponse>(
        `${this.ENDPOINTS.TODOS}?${params.toString()}`,
        {
          withCredentials: true,
        }
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch todos')
      }
      
      return response.data
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }

  static async getTodoById(id: string): Promise<Todo> {
    try {
      const response = await apiClient.get<Todo>(
        this.ENDPOINTS.TODO_BY_ID(id),
        {
          withCredentials: true,
        }
      )

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Failed to fetch todo')
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }

  static async createTodo(todoData: CreateTodoRequest): Promise<Todo> {
    try {
      const response = await apiClient.post<Todo>(
        this.ENDPOINTS.TODOS,
        todoData,
        { withCredentials: true }
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create todo')
      }
      
      return response.data
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }

  static async updateTodo(todoData: UpdateTodoRequest): Promise<Todo> {
    try {
      const { id, ...updateData } = todoData
      
      const response = await apiClient.put<Todo>(
        this.ENDPOINTS.TODO_BY_ID(id),
        updateData,
        {
          withCredentials: true,
        }
      )

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Failed to update todo')
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }

  static async deleteTodo(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        this.ENDPOINTS.TODO_BY_ID(id),
        {
          withCredentials: true,
        }
      )

      return response.data || { success: false, message: 'Failed to delete todo' }
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }

  static async toggleComplete(id: string): Promise<Todo> {
    try {
      const response = await apiClient.patch<Todo>(
        this.ENDPOINTS.TOGGLE_COMPLETE(id),
        {},
        {
          withCredentials: true,
        }
      )

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Failed to toggle todo completion')
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }

  static async togglePin(id: string): Promise<Todo> {
    try {
      const response = await apiClient.patch<Todo>(
        this.ENDPOINTS.TOGGLE_PIN(id),
        {},
        {
          withCredentials: true,
        }
      )

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Failed to toggle todo pin')
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }

  static async updateStatus(id: string, status: TodoStatus): Promise<Todo> {
    try {
      const response = await apiClient.patch<Todo>(
        this.ENDPOINTS.UPDATE_STATUS(id),
        { status },
        {
          withCredentials: true,
        }
      )

      if (response.success && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Failed to update todo status')
    } catch (error) {
      const simpleError = SimpleErrorService.handle(error)
      throw simpleError
    }
  }
}