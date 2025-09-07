import { CheckoutPage } from "@/components/checkout-page"
import { TopBar } from "@/components/top-bar"

export default function Checkout() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-8">
        <CheckoutPage />
      </main>
    </div>
  )
}
