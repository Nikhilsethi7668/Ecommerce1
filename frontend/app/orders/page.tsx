import { OrdersPage } from "@/components/orders-page"
import { TopBar } from "@/components/top-bar"

export default function Orders() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-8">
        <OrdersPage />
      </main>
    </div>
  )
}
