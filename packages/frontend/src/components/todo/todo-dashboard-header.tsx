"use client"

import { memo } from "react"
import { TodoHeader } from "./todo-header"
import { TodoStats } from "./todo-stats"

interface TodoDashboardHeaderProps {
  totalCount: number
  onAddClick: () => void
}

export const TodoDashboardHeader = memo(function TodoDashboardHeader({
  totalCount,
  onAddClick
}: TodoDashboardHeaderProps) {
  return (
    <>
      <TodoHeader
        totalCount={totalCount}
        onAddClick={onAddClick}
      />
      <TodoStats />
    </>
  )
})

TodoDashboardHeader.displayName = "TodoDashboardHeader"