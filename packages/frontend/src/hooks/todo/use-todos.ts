"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TodoService } from "@/services/todo/todo.service"
import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilters,
  TodoStatus
} from "@/types/todo"
import { useMemo } from "react"

export const TODO_KEYS = {
  all: ["todos"] as const,
  lists: () => [...TODO_KEYS.all, "list"] as const,
  list: (filters: TodoFilters) => [...TODO_KEYS.lists(), filters] as const,
  details: () => [...TODO_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TODO_KEYS.details(), id] as const,
  counts: () => [...TODO_KEYS.all, "counts"] as const,
} as const

export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: TODO_KEYS.list(filters || {}),
    queryFn: () => TodoService.getTodos(filters),
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function useTodoCounts() {
  return useQuery({
    queryKey: TODO_KEYS.counts(),
    queryFn: () => TodoService.getTodoCounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes - counts change less frequently
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: TODO_KEYS.detail(id),
    queryFn: () => TodoService.getTodoById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todoData: CreateTodoRequest) => TodoService.createTodo(todoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.counts() })
    },
    onError: (error: any) => {
      console.error('Todo operation error:', error)
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (todoData: UpdateTodoRequest) => TodoService.updateTodo(todoData),
    onSuccess: (updatedTodo: Todo) => {
      queryClient.setQueryData(TODO_KEYS.detail(updatedTodo.id), updatedTodo)
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.counts() })
    },
    onError: (error: any) => {
      console.error('Todo operation error:', error)
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TodoService.deleteTodo(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: TODO_KEYS.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.counts() })
    },
    onError: (error: any) => {
      console.error('Todo operation error:', error)
    },
  })
}

export function useToggleComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TodoService.toggleComplete(id),
    onSuccess: (updatedTodo: Todo) => {
      queryClient.setQueryData(TODO_KEYS.detail(updatedTodo.id), updatedTodo)
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.counts() })
    },
    onError: (error: any) => {
      console.error('Todo operation error:', error)
    },
  })
}

export function useTogglePin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TodoService.togglePin(id),
    onSuccess: (updatedTodo: Todo) => {
      queryClient.setQueryData(TODO_KEYS.detail(updatedTodo.id), updatedTodo)
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.counts() })
    },
    onError: (error: any) => {
      console.error('Todo operation error:', error)
    },
  })
}

export function useUpdateTodoStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TodoStatus }) => 
      TodoService.updateStatus(id, status),
    onSuccess: (updatedTodo: Todo) => {
      queryClient.setQueryData(TODO_KEYS.detail(updatedTodo.id), updatedTodo)
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TODO_KEYS.counts() })
    },
    onError: (error: any) => {
      console.error('Todo operation error:', error)
    },
  })
}

export function useTodoActions() {
  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const toggleComplete = useToggleComplete()
  const togglePin = useTogglePin()
  const updateStatus = useUpdateTodoStatus()

  const actions = useMemo(() => ({
    create: createTodo.mutateAsync,
    update: updateTodo.mutateAsync,
    delete: deleteTodo.mutateAsync,
    toggleComplete: toggleComplete.mutateAsync,
    togglePin: togglePin.mutateAsync,
    updateStatus: updateStatus.mutateAsync,
  }), [
    createTodo.mutateAsync,
    updateTodo.mutateAsync,
    deleteTodo.mutateAsync,
    toggleComplete.mutateAsync,
    togglePin.mutateAsync,
    updateStatus.mutateAsync,
  ])

  return {
    actions,
    isLoading: createTodo.isPending || updateTodo.isPending || deleteTodo.isPending ||
      toggleComplete.isPending || togglePin.isPending || updateStatus.isPending,
    errors: {
      create: createTodo.error,
      update: updateTodo.error,
      delete: deleteTodo.error,
      toggleComplete: toggleComplete.error,
      togglePin: togglePin.error,
      updateStatus: updateStatus.error,
    }
  }
}