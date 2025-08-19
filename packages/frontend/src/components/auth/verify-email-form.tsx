"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/services/auth/auth.service"
import { CheckCircle, XCircle, RefreshCw, Mail } from "lucide-react"

type VerificationState = "verifying" | "success" | "error" | "missing-token"

export function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<VerificationState>("verifying")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState<number | null>(null)

  const token = searchParams.get("token")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setState("missing-token")
        setMessage("No verification token found in the URL")
        return
      }

      try {
        const result = await AuthService.verifyEmail(token)

        if (result.isAlreadyVerified) {

          setState("error")
          setMessage(result.message || "Email already verified")
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)

        } else if (result.isVerified) {

          setState("success")
          setMessage(result.message || "Email verified successfully!")
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
        } else {
          setState("error")
          setMessage(result.message || "Email verification failed")
        }
      } catch (error: any) {
        setState("error")
        setMessage(error?.message || "An unexpected error occurred")
      }
    }

    verifyEmail()
  }, [token, router])


  const renderContent = () => {
    switch (state) {
      case "verifying":
        return (
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900">
              Verifying your email...
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Please wait while we verify your email address.
            </p>
          </div>
        )

      case "success":
        return (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Email Verified Successfully!
            </h2>
            <p className="text-sm text-gray-600 text-center">
              {message}
            </p>
            {countdown !== null && countdown > 0 ? (
              <p className="text-sm text-blue-600 text-center font-medium">
                Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            ) : (
              <p className="text-xs text-gray-500 text-center">
                Redirecting now...
              </p>
            )}
          </div>
        )

      case "error":
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Verification Failed
            </h2>
            <p className="text-sm text-gray-600 text-center">
              {message}
            </p>
            <p className="text-xs text-gray-500 text-center">
              Please check your email for a new verification link or contact support.
            </p>
          </div>
        )

      case "missing-token":
        return (
          <div className="flex flex-col items-center space-y-4">
            <Mail className="h-12 w-12 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Invalid Verification Link
            </h2>
            <p className="text-sm text-gray-600 text-center">
              {message}
            </p>
            <p className="text-xs text-gray-500 text-center">
              Please check your email for the correct verification link or contact support.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        {renderContent()}
      </div>
    </Card>
  )
}