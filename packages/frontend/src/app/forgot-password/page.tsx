import { Card } from "@/components/ui/card"
import { LazyForgotPasswordForm } from "@/components/auth/lazy-auth-forms"
import { AuthLayout } from "@/components/layout/auth-layout"

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <LazyForgotPasswordForm />
      </Card>
    </AuthLayout>
  )
}

export const metadata = {
  title: "Forgot Password | Maxiphy",
  description: "Reset your Maxiphy account password",
}