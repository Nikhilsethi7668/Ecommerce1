import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account to continue shopping</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
