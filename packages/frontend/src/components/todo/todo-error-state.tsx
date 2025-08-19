import { Button } from "@/components/ui/button"

interface TodoErrorStateProps {
  onRetry: () => void
}

export function TodoErrorState({ onRetry }: TodoErrorStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">Failed to load todos</p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  )
}