"use client"

import { memo } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle } from "lucide-react"

interface RegistrationSuccessProps {
  email: string
  onResendEmail?: () => void
  isResending?: boolean
}

const RegistrationSuccess = memo(({ email, onResendEmail, isResending }: RegistrationSuccessProps) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            Registration Successful!
          </h2>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              We&apos;ve sent a verification email to:
            </p>
            <p className="text-sm font-medium text-gray-900 break-all">
              {email}
            </p>
          </div>
          <div className="w-full space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Check your email</p>
                  <p>
                    Click the verification link in your email to activate your account. 
                    If you don&apos;t see it, check your spam folder.
                  </p>
                </div>
              </div>
            </div>
            
            {onResendEmail && (
              <Button
                variant="outline"
                onClick={onResendEmail}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? "Sending..." : "Resend verification email"}
              </Button>
            )}
            
            <Button asChild className="w-full">
              <Link href="/login">
                Continue to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
})

RegistrationSuccess.displayName = "RegistrationSuccess"

export { RegistrationSuccess }