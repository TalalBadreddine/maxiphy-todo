"use client"

import { lazy, Suspense } from "react"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"

// Lazy load
const LoginForm = lazy(() => import("./login-form").then(m => ({ default: m.LoginForm })))
const RegisterForm = lazy(() => import("./register-form").then(m => ({ default: m.RegisterForm })))
const ForgotPasswordForm = lazy(() => import("./forgot-password-form").then(m => ({ default: m.ForgotPasswordForm })))
const ResetPasswordForm = lazy(() => import("./reset-password-form").then(m => ({ default: m.ResetPasswordForm })))
const VerifyEmailForm = lazy(() => import("./verify-email-form").then(m => ({ default: m.VerifyEmailForm })))

interface AuthFormWrapperProps {
  children: React.ReactNode
}

const AuthFormWrapper = ({ children }: AuthFormWrapperProps) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSkeleton />}>
      {children}
    </Suspense>
  </ErrorBoundary>
)

export const LazyLoginForm = () => (
  <AuthFormWrapper>
    <LoginForm />
  </AuthFormWrapper>
)

export const LazyRegisterForm = () => (
  <AuthFormWrapper>
    <RegisterForm />
  </AuthFormWrapper>
)

export const LazyForgotPasswordForm = () => (
  <AuthFormWrapper>
    <ForgotPasswordForm />
  </AuthFormWrapper>
)

export const LazyResetPasswordForm = () => (
  <AuthFormWrapper>
    <ResetPasswordForm />
  </AuthFormWrapper>
)

export const LazyVerifyEmailForm = () => (
  <AuthFormWrapper>
    <VerifyEmailForm />
  </AuthFormWrapper>
)