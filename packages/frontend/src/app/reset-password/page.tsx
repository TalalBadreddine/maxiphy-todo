import { Card } from "@/components/ui/card"
import { LazyResetPasswordForm } from "@/components/auth/lazy-auth-forms"
import { AuthLayout } from "@/components/layout/auth-layout"

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <LazyResetPasswordForm />
      </Card>
    </AuthLayout>
  )
}

export const metadata = {
  title: "Reset Password | Maxiphy",
  description: "Reset your Maxiphy account password",
}