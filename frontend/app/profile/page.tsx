import { ProfilePage } from "@/components/profile-page"
import { TopBar } from "@/components/top-bar"

export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-8">
        <ProfilePage />
      </main>
    </div>
  )
}
