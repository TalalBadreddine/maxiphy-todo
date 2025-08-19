import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockTodo } from '@/__tests__/test-utils'
import { TodoItem } from '../todo-item'
import { Todo } from '@/types/todo'

describe('TodoItem', () => {
  const user = userEvent.setup()
  
  const mockProps = {
    onToggleComplete: jest.fn(),
    onTogglePin: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  }

  const todoWithDescription: Todo = {
    ...mockTodo,
    description: 'This is a detailed description of the todo item',
  }

  const completedTodo: Todo = {
    ...mockTodo,
    completed: true,
  }

  const pinnedTodo: Todo = {
    ...mockTodo,
    pinned: true,
  }

  const overdueTodo: Todo = {
    ...mockTodo,
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    completed: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders todo item with basic information', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    expect(screen.getByText(mockTodo.title)).toBeInTheDocument()
    expect(screen.getByText(mockTodo.priority)).toBeInTheDocument()
    expect(screen.getByText(/Jan 01, 2025/)).toBeInTheDocument() // Due date display
  })

  it('displays completed state correctly', () => {
    render(<TodoItem todo={completedTodo} {...mockProps} />)

    const title = screen.getByText(completedTodo.title)
    expect(title).toHaveClass('line-through', 'text-gray-500')
    
    const checkIcon = screen.getByRole('button', { name: /mark as incomplete/i })
    expect(checkIcon.querySelector('svg')).toHaveClass('text-green-500')
  })

  it('displays pinned state correctly', () => {
    render(<TodoItem todo={pinnedTodo} {...mockProps} />)

    const pinIcon = screen.getByRole('button', { name: /unpin todo/i })
    expect(pinIcon.querySelector('svg')).toHaveClass('text-blue-500')
  })

  it('displays overdue state correctly', () => {
    render(<TodoItem todo={overdueTodo} {...mockProps} />)

    expect(screen.getByText(/Overdue/)).toBeInTheDocument()
    expect(screen.getByText(/Overdue/)).toHaveClass('text-red-500')
  })

  it('toggles completion when complete button is clicked', async () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    const completeButton = screen.getByRole('button', { name: /mark as complete/i })
    await user.click(completeButton)

    expect(mockProps.onToggleComplete).toHaveBeenCalledWith(mockTodo.id)
  })

  it('toggles pin when pin button is clicked', async () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    const pinButton = screen.getByRole('button', { name: /pin todo/i })
    await user.click(pinButton)

    expect(mockProps.onTogglePin).toHaveBeenCalledWith(mockTodo.id)
  })

  it('calls onEdit when edit button is clicked', async () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    const editButton = screen.getByRole('button', { name: /edit todo/i })
    await user.click(editButton)

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockTodo)
  })

  it('calls onDelete when delete button is clicked', async () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    const deleteButton = screen.getByRole('button', { name: /delete todo/i })
    await user.click(deleteButton)

    expect(mockProps.onDelete).toHaveBeenCalledWith(mockTodo.id)
  })

  it('shows expand button when todo has description', () => {
    render(<TodoItem todo={todoWithDescription} {...mockProps} />)

    const expandButton = screen.getByRole('button', { name: /expand description/i })
    expect(expandButton).toBeInTheDocument()
  })

  it('hides expand button when todo has no description', () => {
    const todoWithoutDescription = { ...mockTodo, description: '' }
    render(<TodoItem todo={todoWithoutDescription} {...mockProps} />)

    const expandButton = screen.queryByRole('button', { name: /expand description/i })
    expect(expandButton).not.toBeInTheDocument()
  })

  it('expands and shows description when expand button is clicked', async () => {
    render(<TodoItem todo={todoWithDescription} {...mockProps} />)

    const expandButton = screen.getByRole('button', { name: /expand description/i })
    await user.click(expandButton)

    expect(screen.getByText(todoWithDescription.description!)).toBeInTheDocument()
  })

  it('collapses description when expand button is clicked again', async () => {
    render(<TodoItem todo={todoWithDescription} {...mockProps} />)

    const expandButton = screen.getByRole('button', { name: /expand description/i })
    
    // Expand
    await user.click(expandButton)
    expect(screen.getByText(todoWithDescription.description!)).toBeInTheDocument()
    
    // Collapse
    await user.click(expandButton)
    expect(screen.queryByText(todoWithDescription.description!)).not.toBeInTheDocument()
  })

  it('displays priority with correct styling', () => {
    const highPriorityTodo = { ...mockTodo, priority: 'HIGH' as const }
    render(<TodoItem todo={highPriorityTodo} {...mockProps} />)

    const priorityBadge = screen.getByText('HIGH').closest('div')
    expect(priorityBadge).toHaveClass('text-red-700', 'bg-red-50')
  })

  it('displays creation and update dates', () => {
    const todoWithDifferentDates = {
      ...mockTodo,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    }
    
    render(<TodoItem todo={todoWithDifferentDates} {...mockProps} />)

    expect(screen.getByText(/Created Jan 01, 2024/)).toBeInTheDocument()
    expect(screen.getByText(/Updated Jan 02, 2024/)).toBeInTheDocument()
  })

  it('disables actions when loading', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} isLoading={true} />)

    const completeButton = screen.getByRole('button', { name: /mark as complete/i })
    const pinButton = screen.getByRole('button', { name: /pin todo/i })
    const editButton = screen.getByRole('button', { name: /edit todo/i })
    const deleteButton = screen.getByRole('button', { name: /delete todo/i })

    expect(completeButton).toBeDisabled()
    expect(pinButton).toBeDisabled()
    expect(editButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })

  it('applies loading styles when loading', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} isLoading={true} />)

    const card = screen.getByText('Test Todo').closest('.p-4')
    expect(card).toHaveClass('pointer-events-none', 'opacity-50')
  })
})