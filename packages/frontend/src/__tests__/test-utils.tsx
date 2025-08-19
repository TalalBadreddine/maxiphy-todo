import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a test-specific query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data helpers
export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  isActive: true,
  lastLoginAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export const mockTodo = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  title: 'Test Todo',
  description: 'Test Description',
  priority: 'MEDIUM' as const,
  status: 'TODO' as const,
  completed: false,
  pinned: false,
  dueDate: '2024-12-31T23:59:59.000Z',
  userId: mockUser.id,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export const mockAuthResponse = {
  success: true,
  message: 'Login successful',
  data: {
    user: mockUser,
    accessToken: 'mock-jwt-token',
  },
}

// Form test helpers
export const fillForm = async (user: any, formData: Record<string, string>) => {
  for (const [name, value] of Object.entries(formData)) {
    const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement
    if (input) {
      await user.clear(input)
      await user.type(input, value)
    }
  }
}

export const submitForm = async (user: any, formSelector = 'form') => {
  const form = document.querySelector(formSelector) as HTMLFormElement
  if (form) {
    await user.click(form.querySelector('button[type="submit"]') as HTMLButtonElement)
  }
}

// Wait helpers
export const waitForRequest = () => new Promise(resolve => setTimeout(resolve, 100))
export const waitForElement = () => new Promise(resolve => setTimeout(resolve, 50))

// Test to satisfy Jest requirement
describe('Test utilities', () => {
  it('should create test query client with correct options', () => {
    const queryClient = createTestQueryClient()
    
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false)
    expect(queryClient.getDefaultOptions().queries?.gcTime).toBe(0)
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false)
  })
})