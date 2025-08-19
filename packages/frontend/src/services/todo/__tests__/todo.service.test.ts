import { TodoService } from '../todo.service'
import { apiClient } from '@/services/api/client'
import { mockTodo } from '@/__tests__/test-utils'

// mock api client for testing
jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('TodoService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTodos', () => {
    const mockTodoResponse = {
      todos: [mockTodo],
      total: 1,
      filtered: 1,
      counts: {
        all: 1,
        active: 1,
        completed: 0,
      },
      page: 1,
      limit: 10,
      totalPages: 1,
    }

    it('gets todos without filters', async () => {
      const mockResponse = {
        success: true,
        data: mockTodoResponse,
        message: 'Todos retrieved',
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await TodoService.getTodos()

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/todos?',
        { withCredentials: true }
      )
      expect(result).toEqual(mockTodoResponse)
    })

    it('gets todos with filters applied', async () => {
      const filters = {
        search: 'test',
        priority: 'HIGH' as const,
        completed: false,
        page: 1,
        limit: 10,
      }

      const mockResponse = {
        success: true,
        data: mockTodoResponse,
        message: 'Todos retrieved',
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await TodoService.getTodos(filters)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/todos?search=test&priority=HIGH&completed=false&page=1&limit=10',
        { withCredentials: true }
      )
      expect(result).toEqual(mockTodoResponse)
    })

    it('excludes ALL values from query params', async () => {
      const filters = {
        priority: 'ALL' as const,
        completed: 'ALL' as const,
        search: 'test',
      }

      const mockResponse = {
        success: true,
        data: mockTodoResponse,
        message: 'Todos retrieved',
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      await TodoService.getTodos(filters)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/todos?search=test',
        { withCredentials: true }
      )
    })

    it('should exclude undefined and null values from filters', async () => {
      const filters = {
        search: undefined,
        priority: null as any,
        completed: false,
        page: 1,
      }

      const mockResponse = {
        success: true,
        data: mockTodoResponse,
        message: 'Todos retrieved',
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      await TodoService.getTodos(filters)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/todos?completed=false&page=1',
        { withCredentials: true }
      )
    })

    it('throws error on failed request', async () => {
      const mockResponse = {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      await expect(TodoService.getTodos()).rejects.toThrow('Unauthorized')
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network error')
      mockApiClient.get.mockRejectedValue(networkError)

      await expect(TodoService.getTodos()).rejects.toThrow('Network error')
    })
  })

  describe('getTodoById', () => {
    const todoId = 'todo-123'

    it('should get todo by id successfully', async () => {
      const mockResponse = {
        success: true,
        data: mockTodo,
        message: 'Todo retrieved',
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await TodoService.getTodoById(todoId)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/todos/${todoId}`,
        { withCredentials: true }
      )
      expect(result).toEqual(mockTodo)
    })

    it('should throw error when todo not found', async () => {
      const mockResponse = {
        success: false,
        message: 'Todo not found',
        data: null,
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      await expect(TodoService.getTodoById(todoId)).rejects.toThrow('Todo not found')
    })
  })

  describe('createTodo', () => {
    const createTodoData = {
      title: 'New Todo',
      description: 'New Description',
      priority: 'HIGH' as const,
      status: 'TODO' as const,
      dueDate: '2024-12-31T23:59:59.000Z',
    }

    it('should create todo successfully', async () => {
      const createdTodo = { ...mockTodo, ...createTodoData }
      const mockResponse = {
        success: true,
        data: createdTodo,
        message: 'Todo created',
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await TodoService.createTodo(createTodoData)

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/todos',
        createTodoData,
        { withCredentials: true }
      )
      expect(result).toEqual(createdTodo)
    })

    it('should throw error when creation fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Validation failed',
        data: null,
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      await expect(TodoService.createTodo(createTodoData)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateTodo', () => {
    const updateTodoData = {
      id: 'todo-123',
      title: 'Updated Todo',
      priority: 'LOW' as const,
      completed: true,
    }

    it('should update todo successfully', async () => {
      const updatedTodo = { ...mockTodo, ...updateTodoData }
      const mockResponse = {
        success: true,
        data: updatedTodo,
        message: 'Todo updated',
      }
      mockApiClient.put.mockResolvedValue(mockResponse)

      const result = await TodoService.updateTodo(updateTodoData)

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/todos/${updateTodoData.id}`,
        {
          title: updateTodoData.title,
          priority: updateTodoData.priority,
          completed: updateTodoData.completed,
        },
        { withCredentials: true }
      )
      expect(result).toEqual(updatedTodo)
    })

    it('should exclude id from request body', async () => {
      const mockResponse = {
        success: true,
        data: mockTodo,
        message: 'Todo updated',
      }
      mockApiClient.put.mockResolvedValue(mockResponse)

      await TodoService.updateTodo(updateTodoData)

      const requestBody = mockApiClient.put.mock.calls[0][1]
      expect(requestBody).not.toHaveProperty('id')
    })

    it('should throw error when update fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Todo not found',
        data: null,
      }
      mockApiClient.put.mockResolvedValue(mockResponse)

      await expect(TodoService.updateTodo(updateTodoData)).rejects.toThrow('Todo not found')
    })
  })

  describe('deleteTodo', () => {
    const todoId = 'todo-123'

    it('should delete todo successfully', async () => {
      const mockResponse = {
        success: true,
        data: { success: true, message: 'Todo deleted successfully' },
      }
      mockApiClient.delete.mockResolvedValue(mockResponse)

      const result = await TodoService.deleteTodo(todoId)

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/todos/${todoId}`,
        { withCredentials: true }
      )
      expect(result).toEqual({ success: true, message: 'Todo deleted successfully' })
    })

    it('should handle delete failure', async () => {
      const networkError = new Error('Network error')
      mockApiClient.delete.mockRejectedValue(networkError)

      await expect(TodoService.deleteTodo(todoId)).rejects.toThrow('Network error')
    })

    it('should return default response when data is missing', async () => {
      const mockResponse = {
        success: true,
        data: null,
      }
      mockApiClient.delete.mockResolvedValue(mockResponse)

      const result = await TodoService.deleteTodo(todoId)

      expect(result).toEqual({ success: false, message: 'Failed to delete todo' })
    })
  })

  describe('toggleComplete', () => {
    const todoId = 'todo-123'

    it('should toggle completion successfully', async () => {
      const toggledTodo = { ...mockTodo, completed: !mockTodo.completed }
      const mockResponse = {
        success: true,
        data: toggledTodo,
        message: 'Todo completion toggled',
      }
      mockApiClient.patch.mockResolvedValue(mockResponse)

      const result = await TodoService.toggleComplete(todoId)

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        `/todos/${todoId}/toggle`,
        {},
        { withCredentials: true }
      )
      expect(result).toEqual(toggledTodo)
    })

    it('should throw error when toggle fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Todo not found',
        data: null,
      }
      mockApiClient.patch.mockResolvedValue(mockResponse)

      await expect(TodoService.toggleComplete(todoId)).rejects.toThrow('Todo not found')
    })
  })

  describe('togglePin', () => {
    const todoId = 'todo-123'

    it('should toggle pin successfully', async () => {
      const pinnedTodo = { ...mockTodo, pinned: !mockTodo.pinned }
      const mockResponse = {
        success: true,
        data: pinnedTodo,
        message: 'Todo pin toggled',
      }
      mockApiClient.patch.mockResolvedValue(mockResponse)

      const result = await TodoService.togglePin(todoId)

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        `/todos/${todoId}/pin`,
        {},
        { withCredentials: true }
      )
      expect(result).toEqual(pinnedTodo)
    })

    it('should throw error when toggle fails', async () => {
      const mockResponse = {
        success: false,
        message: 'Todo not found',
        data: null,
      }
      mockApiClient.patch.mockResolvedValue(mockResponse)

      await expect(TodoService.togglePin(todoId)).rejects.toThrow('Todo not found')
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network error')
      mockApiClient.patch.mockRejectedValue(networkError)

      await expect(TodoService.togglePin(todoId)).rejects.toThrow('Network error')
    })
  })
})