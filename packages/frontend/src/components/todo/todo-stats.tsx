"use client"

import { useMemo } from "react"
import { CheckCircle, Clock, AlertTriangle, Pin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useTodos } from "@/hooks/todo/use-todos"

export function TodoStats() {
  const { data: todoData } = useTodos({
    sortBy: "date",
    sortOrder: "desc",
    page: 1,
    limit: 100,
  })

  const stats = useMemo(() => {
    const todos = todoData?.todos || []

    const completed = todos.filter(todo => todo.completed).length
    const active = todos.filter(todo => !todo.completed).length
    const overdue = todos.filter(todo =>
      !todo.completed && new Date(todo.dueDate) < new Date()
    ).length
    const pinned = todos.filter(todo => todo.pinned).length

    return {
      total: todos.length,
      completed,
      active,
      overdue,
      pinned,
      completionRate: todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0
    }
  }, [todoData])

  const statItems = [
    {
      label: "Active Tasks",
      value: stats.active,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Pinned",
      value: stats.pinned,
      icon: Pin,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}