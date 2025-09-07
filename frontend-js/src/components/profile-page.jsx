
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    if (!user) {
      navigate("/auth/login?next=/profile")
      return
    }

    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    })
  }, [user, navigate])

  const handleSave = async () => {
    // Simulate API call to update profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    })
    setEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-8">My Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {editing ? (
                  <>
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-muted-foreground">Change your account password</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                  <div>
                    <h3 className="font-medium text-destructive">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                  </div>
                  <Button variant="destructive" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
