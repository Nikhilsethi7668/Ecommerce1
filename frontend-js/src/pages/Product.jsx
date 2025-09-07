import { ProductDetail } from "@/components/product-detail"
import { TopBar } from "@/components/top-bar"
import { useParams } from "react-router-dom"


export default function ProductPage() {
  const { id } = useParams()
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-8">
        <ProductDetail id={id} />
      </main>
    </div>
  )
}
