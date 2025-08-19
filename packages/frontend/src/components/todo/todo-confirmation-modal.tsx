"use client"

import { memo, lazy, Suspense } from "react"
import { Todo } from "@/types/todo"

// Lazy load the modal
const ConfirmationModal = lazy(() => import("@/components/ui/confirmation-modal").then(module => ({ default: module.ConfirmationModal })))

interface TodoConfirmationModalProps {
  todoToDelete: Todo | null
  onConfirm: () => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export const TodoConfirmationModal = memo(function TodoConfirmationModal({
  todoToDelete,
  onConfirm,
  onCancel,
  isLoading
}: TodoConfirmationModalProps) {
  if (!todoToDelete) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <ConfirmationModal
        isOpen={!!todoToDelete}
        onClose={onCancel}
        onConfirm={onConfirm}
        title="Delete Todo"
        message={`Are you sure you want to delete "${todoToDelete.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isLoading}
      />
    </Suspense>
  )
})

TodoConfirmationModal.displayName = "TodoConfirmationModal"