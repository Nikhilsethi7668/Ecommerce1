import { TopBar } from "@/components/top-bar"
import { CategoryBar } from "@/components/category-bar"
import { ProductList } from "@/components/product-list"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <CategoryBar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Welcome to Our Store</h1>
          <p className="text-muted-foreground text-lg">Discover amazing products at great prices</p>
        </div>
        <ProductList />
      </main>
    </div>
  )
}
