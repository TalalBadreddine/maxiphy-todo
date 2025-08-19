"use client"

import { memo } from "react"
import { Card } from "./card"

const LoadingSkeleton = memo(() => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Icon skeleton */}
          <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
          
          {/* Title skeleton */}
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          
          {/* Subtitle skeleton */}
          <div className="space-y-2 w-full">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 mx-auto bg-gray-200 rounded animate-pulse" />
          </div>
          
          {/* Button skeleton */}
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  )
})

LoadingSkeleton.displayName = "LoadingSkeleton"

export { LoadingSkeleton }