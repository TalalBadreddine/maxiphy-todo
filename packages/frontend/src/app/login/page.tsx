import { Card } from "@/components/ui/card"
import { LazyLoginForm } from "@/components/auth/lazy-auth-forms"
import { AuthLayout } from "@/components/layout/auth-layout"

export default function LoginPage() {
  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <LazyLoginForm />
      </Card>
    </AuthLayout>
  )
}

export const metadata = {
  title: "Sign In | Maxiphy",
  description: "Sign in to your Maxiphy account",
}