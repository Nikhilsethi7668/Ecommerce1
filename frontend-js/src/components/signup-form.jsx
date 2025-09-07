
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { VerificationModal } from "./verification-modal"

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [userId, setUserId] = useState("")
  const { signup } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasDigit = /\d/.test(password)
    const noSpaces = !/\s/.test(password)

    return minLength && hasUpper && hasLower && hasDigit && noSpaces
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePhone = (phone) => {
    return /^\d{10}$/.test(phone.replace(/\D/g, ""))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address")
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    if (!validatePhone(formData.phone)) {
      alert("Please enter a valid 10-digit phone number")
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      })
      return
    }

    if (!validatePassword(formData.password)) {
      alert("Password must be at least 8 characters with uppercase, lowercase, and digit")
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters with uppercase, lowercase, and digit",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const result = await signup(formData)

      if (result.success && result.userId) {
        setUserId(result.userId)
        setShowVerification(true)
        alert("Signup successful Please Login to continue")
      } else {
        alert("Signup failed: " + (result.error || "Failed to create account"))
        toast({
          title: "Signup Failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleVerificationSuccess = () => {
    setShowVerification(false)
    toast({
      title: "Account Verified!",
      description: "Your account has been created and verified successfully",
    })
    navigate("/")
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Create Account</CardTitle>
          <CardDescription>Fill in your details to create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be 8+ characters with uppercase, lowercase, and digit
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>


    </>
  )
}
