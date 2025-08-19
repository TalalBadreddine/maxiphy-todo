import { AuthLayout } from "@/components/layout/auth-layout"
import { LazyLoginForm } from "@/components/auth/lazy-auth-forms"

export default function HomePage() {
  return (
    <AuthLayout>
      <LazyLoginForm />
    </AuthLayout>
  )
}