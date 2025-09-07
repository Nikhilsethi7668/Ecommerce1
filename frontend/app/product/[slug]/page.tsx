import { ProductDetail } from "@/components/product-detail"
import { TopBar } from "@/components/top-bar"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-4 py-8">
        <ProductDetail slug={params.slug} />
      </main>
    </div>
  )
}
