"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations/auth"
import { useForgotPassword } from "@/hooks/auth/use-auth"
import { CheckCircleIcon } from "lucide-react"

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = React.useState(false)
  const forgotPasswordMutation = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const result = await forgotPasswordMutation.mutateAsync(data)
      if (result.success) {
        setIsSuccess(true)
      } else {
        setError("root", { message: result.message || "Failed to send reset email" })
      }
    } catch (error: any) {
      if (error?.code === "USER_NOT_FOUND") {
        setError("email", { message: "No account found with this email address" })
      } else if (error?.code === "TOO_MANY_REQUESTS") {
        setError("root", { message: "Too many requests. Please try again later." })
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
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent password reset instructions to <strong>{getValues("email")}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>Didn&apos;t receive the email? Check your spam folder or</p>
            <Button
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="text-primary-600"
            >
              Try again
            </Button>
          </div>
        </CardContent>

        <CardFooter>
          <div className="w-full text-center text-sm text-gray-600">
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </>
    )
  }

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we&apos;ll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            label="Email Address"
            type="email"
            placeholder="john.doe@example.com"
            error={errors.email?.message}
            required
            {...register("email")}
          />

          {(errors.root || forgotPasswordMutation.error) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {errors.root?.message || forgotPasswordMutation.error?.message || "An error occurred"}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || forgotPasswordMutation.isPending}
          >
            {isSubmitting || forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
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