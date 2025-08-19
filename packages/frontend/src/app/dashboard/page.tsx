"use client"

import { lazy, Suspense } from "react"
import { LazyDashboardLayout } from "@/components/layout/lazy-dashboard-layout"
import { DashboardLoadingSkeleton } from "@/components/ui/dashboard-loading-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"

// Lazy load the todo dashboard
const TodoDashboard = lazy(() => import("@/components/todo/todo-dashboard").then(module => ({ 
  default: module.TodoDashboard 
})))

export default function DashboardPage() {
  return (
    <LazyDashboardLayout>
      <ErrorBoundary>
        <Suspense fallback={<DashboardLoadingSkeleton />}>
          <TodoDashboard />
        </Suspense>
      </ErrorBoundary>
    </LazyDashboardLayout>
  )
}