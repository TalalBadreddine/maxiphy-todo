import { AuthLayout } from "@/components/layout/auth-layout"
import { LazyVerifyEmailForm } from "@/components/auth/lazy-auth-forms"

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <LazyVerifyEmailForm />
    </AuthLayout>
  )
}