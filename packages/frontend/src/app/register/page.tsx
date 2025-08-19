import { Card } from "@/components/ui/card"
import { LazyRegisterForm } from "@/components/auth/lazy-auth-forms"
import { AuthLayout } from "@/components/layout/auth-layout"

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <LazyRegisterForm />
      </Card>
    </AuthLayout>
  )
}

export const metadata = {
  title: "Create Account | Maxiphy",
  description: "Create your Maxiphy account",
}