import { OrderDetailPage } from "@/components/order-detail-page"
import { TopBar } from "@/components/top-bar"

export default function OrderDetail({ params, searchParams }) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-8">
        <OrderDetailPage orderId={params.orderId} showSuccess={searchParams.success === "true"} />
      </main>
    </div>
  )
}
