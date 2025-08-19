"use client"

import { usePasswordStrength } from "@/hooks/auth/use-password-strength"
import { cn } from "@/lib/utils/cn"

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
  showFeedback?: boolean
}

export function PasswordStrengthIndicator({
  password,
  className,
  showFeedback = true
}: PasswordStrengthIndicatorProps) {
  const { strength, getStrengthText, getStrengthPercentage } = usePasswordStrength(password)

  if (!password || password.length < 1) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Password strength</span>
          <span className={cn(
            "font-medium",
            {
              "text-red-600": strength?.score === 0 || strength?.score === 1,
              "text-orange-600": strength?.score === 2,
              "text-yellow-600": strength?.score === 3,
              "text-green-600": strength?.score === 4,
            }
          )}>
            {getStrengthText()}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300 ease-in-out",
              {
                "bg-red-500": strength?.score === 0 || strength?.score === 1,
                "bg-orange-500": strength?.score === 2,
                "bg-yellow-500": strength?.score === 3,
                "bg-green-500": strength?.score === 4,
                "bg-gray-200": !strength || strength.score < 0,
              }
            )}
            style={{ width: `${getStrengthPercentage()}%` }}
          />
        </div>
      </div>

      {showFeedback && strength && (strength.feedback.warning || strength.feedback.suggestions.length > 0) && (
        <div className="space-y-1">
          {strength.feedback.warning && (
            <p className="text-sm text-orange-600 font-medium">
              {strength.feedback.warning}
            </p>
          )}

          {strength.feedback.suggestions.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">Suggestions:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {strength.feedback.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {strength.crackTime && (
            <p className="text-xs text-gray-500">
              Estimated crack time: {strength.crackTime}
            </p>
          )}
        </div>
      )}
    </div>
  )
}