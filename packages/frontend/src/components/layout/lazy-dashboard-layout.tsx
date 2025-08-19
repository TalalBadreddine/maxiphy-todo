"use client"

import { lazy, Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { DashboardLoadingSkeleton } from "../ui/dashboard-loading-skeleton"

// Lazy load the dashboard layout
const DashboardLayout = lazy(() => import("./dashboard-layout").then(module => ({
  default: module.DashboardLayout
})))

interface LazyDashboardLayoutProps {
  children: React.ReactNode
}

export function LazyDashboardLayout({ children }: LazyDashboardLayoutProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardLoadingSkeleton />}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </Suspense>
    </ErrorBoundary>
  )
}