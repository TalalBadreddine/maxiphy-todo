"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations/auth"
import { useResetPassword } from "@/hooks/auth/use-auth"
import { PasswordStrengthIndicator } from "./password-strength-indicator"
import { CheckCircleIcon } from "lucide-react"

export function ResetPasswordForm() {
  const [isSuccess, setIsSuccess] = React.useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const resetPasswordMutation = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  React.useEffect(() => {
    if (!token) {
      setError("root", { message: "Invalid or missing reset token" })
    }
  }, [token, setError])

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const result = await resetPasswordMutation.mutateAsync(data)
      if (result.success) {
        setIsSuccess(true)
      } else {
        setError("root", { message: result.message || "Failed to reset password" })
      }
    } catch (error: any) {
      if (error?.code === "INVALID_TOKEN") {
        setError("root", { message: "Invalid or expired reset token" })
      } else if (error?.code === "TOKEN_EXPIRED") {
        setError("root", { message: "Reset token has expired. Please request a new one." })
      } else if (error?.code === "WEAK_PASSWORD") {
        setError("password", { message: "Password is too weak. Please choose a stronger password." })
      } else {
        setError("root", { message: error?.message || "An unexpected error occurred" })
      }
    }
  }

  if (isSuccess) {
    return (
      <>
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Password Reset Successful</CardTitle>
          <CardDescription className="text-center">
            Your password has been successfully updated. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Link href="/login" className="w-full">
            <Button className="w-full">
              Continue to Sign In
            </Button>
          </Link>
        </CardFooter>
      </>
    )
  }

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <input type="hidden" {...register("token")} />

          <div className="space-y-3">
            <FormField
              label="New Password"
              type="password"
              placeholder="Create a strong password"
              error={errors.password?.message}
              required
              {...register("password")}
            />
            <PasswordStrengthIndicator
              password={password}
              showFeedback={true}
            />
          </div>

          <FormField
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            error={errors.confirmPassword?.message}
            required
            {...register("confirmPassword")}
          />

          {(errors.root || resetPasswordMutation.error) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {errors.root?.message || resetPasswordMutation.error?.message || "An error occurred"}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || resetPasswordMutation.isPending || !token}
          >
            {isSubmitting || resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </>
  )
}