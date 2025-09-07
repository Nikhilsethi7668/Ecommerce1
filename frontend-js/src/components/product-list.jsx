"use client"

import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProductCardFlip } from "./product-card-flip"

export function ProductList({
  products = [],
  pagination = { page: 1, pageSize: 12, total: 0 },
  loading = false,
  error = null,
  onLoadMore,
}) {
  const hasMore = (products?.length || 0) < (pagination?.total || 0)

  const normalize = (p) => {
    if (!p) return { id: "", name: "Untitled", price: 0, images: [], rating: 0, stock: 0, attributes: {} }
    return {
      id: String(p.id ?? p._id ?? ""),
      name: p.name ?? p.title ?? "Untitled",
      price: Number(p.price ?? 0),
      images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
      rating: Number(p.rating ?? p.ratingAvg ?? 0),
      stock: Number(p.stock ?? 0),
      attributes: p && typeof p.attributes === "object" && p.attributes ? p.attributes : {},
      ...p,
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="status" aria-label="Loading products">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="mb-4">{error}</AlertDescription>
      </Alert>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">No products found</h3>
        <p className="text-muted-foreground mb-4 text-balance">Try adjusting your search or filter criteria</p>
        <Button variant="outline" onClick={() => (window.location.href = "/products")}>
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {products.filter(Boolean).map((p, idx) => {
          const sp = normalize(p)
          return <ProductCardFlip key={sp.id || idx} product={sp} />
        })}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button onClick={onLoadMore} variant="outline" size="lg" className="touch-manipulation bg-transparent">
            Load More Products
          </Button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 border-t border-border mt-8">
          <h3 className="font-heading text-lg font-bold text-foreground mb-2">You've seen all products</h3>
          <p className="text-muted-foreground mb-4 text-balance">
            Looking for something specific? Try adjusting your filters or search terms.
          </p>
          <Button variant="outline" className="touch-manipulation bg-transparent">
            Get More Options
          </Button>
        </div>
      )}
    </div>
  )
}
