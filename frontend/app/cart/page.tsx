import { CartPage } from "@/components/cart-page"
import { TopBar } from "@/components/top-bar"

export default function Cart() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-8">
        <CartPage />
      </main>
    </div>
  )
}
