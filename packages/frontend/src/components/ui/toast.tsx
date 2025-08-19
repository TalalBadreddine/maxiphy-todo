"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
}

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200 text-green-900",
    iconClassName: "text-green-500"
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-200 text-red-900",
    iconClassName: "text-red-500"
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-900",
    iconClassName: "text-yellow-500"
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-900",
    iconClassName: "text-blue-500"
  }
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, action, type = "info", onClose, ...props }, ref) => {
    const variant = toastVariants[type]
    const Icon = variant.icon

    React.useEffect(() => {
      if (props.duration && props.duration > 0) {
        const timer = setTimeout(() => {
          onClose?.()
        }, props.duration)

        return () => clearTimeout(timer)
      }
    }, [props.duration, onClose])

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
          "animate-in slide-in-from-top-full duration-300",
          variant.className
        )}
        {...props}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={cn("h-5 w-5", variant.iconClassName)} />
            </div>
            <div className="ml-3 w-0 flex-1">
              {title && (
                <p className="text-sm font-medium">{title}</p>
              )}
              {description && (
                <p className={cn("text-sm", title ? "mt-1" : "")}>{description}</p>
              )}
              {action && (
                <div className="mt-3">{action}</div>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

Toast.displayName = "Toast"

export const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))

ToastViewport.displayName = "ToastViewport"