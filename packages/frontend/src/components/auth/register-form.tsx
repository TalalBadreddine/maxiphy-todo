"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { registerSchema, RegisterFormData } from "@/lib/validations/auth"
import { useRegister } from "@/hooks/auth/use-auth"
import { PasswordStrengthIndicator } from "./password-strength-indicator"
import { RegistrationSuccess } from "./registration-success"

export function RegisterForm() {
  const registerMutation = useRegister()
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  })

  const password = watch("password")

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerMutation.mutateAsync(data)
      if (result && !result.user?.emailVerified) {
        setRegisteredEmail(data.email)
        setRegistrationSuccess(true)
      }
    } catch (error: any) {
      if (error?.code === "EMAIL_EXISTS" || error?.status === 409) {
        setError("email", { message: "Email address is already registered" })
      } else if (error?.code === "WEAK_PASSWORD") {
        setError("password", { message: "Password is too weak. Please choose a stronger password." })
      } else if (error?.code === "INVALID_EMAIL") {
        setError("email", { message: "Please enter a valid email address" })
      } else if (error?.field) {
        setError(error.field as keyof RegisterFormData, { message: error.message })
      } else {
        setError("root", { message: error?.message || "An unexpected error occurred" })
      }
    }
  }


  // Show success screen if registration completed but email verification needed
  if (registrationSuccess) {
    return <RegistrationSuccess email={registeredEmail} />
  }

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Enter your information to create your account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            required
            {...register("name")}
          />

          <FormField
            label="Email Address"
            type="email"
            placeholder="john.doe@example.com"
            error={errors.email?.message}
            required
            {...register("email")}
          />

          <div className="space-y-3">
            <FormField
              label="Password"
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
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            required
            {...register("confirmPassword")}
          />

          {(errors.root || registerMutation.error) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {errors.root?.message || registerMutation.error?.message || "An error occurred during registration"}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting || registerMutation.isPending}
            disabled={isSubmitting || registerMutation.isPending}
          >
            {isSubmitting || registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </form>
    </>
  )
}