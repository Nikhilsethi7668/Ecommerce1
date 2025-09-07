
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { ProductCardFlip } from "./product-card-flip"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axiosInstance from "@/lib/axios-instance"

export function ProductList(props) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0 })
  const [hasMore, setHasMore] = useState(true)
  const [searchParams] = useSearchParams()

  const isControlled = Array.isArray(props.products)

  useEffect(() => {
    if (!isControlled) {
      fetchProducts(true)
    }
  }, [searchParams])

  const fetchProducts = async (reset = false) => {
    const currentPage = reset ? 1 : pagination.page + 1

    if (reset) {
      setLoading(true)
      setError(null)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams(searchParams.toString())
      const categoryId = params.get("categoryId")
      // enforce our paging param for backend
      params.set("page", currentPage.toString())
      // use a consistent page size from state
      params.set("limit", pagination.pageSize.toString())

      let url
      if (categoryId) {
        // category route; remove categoryId from query since it's in the path
        params.delete("categoryId")
        url = `/api/products/categories/${categoryId}/products?${params.toString()}`
      } else {
        url = `/api/products?${params.toString()}`
      }

      const { data: resp } = await axiosInstance.get(url)

      // backend responds with { data, meta }
      const backendProducts = resp.data || []
      const meta = resp.meta || { page: currentPage, limit: pagination.pageSize, total: backendProducts.length }

      // map backend product shape -> UI product shape
      const mappedProducts = backendProducts.map((p) => ({
        id: String(p._id || p.id),
        name: p.title || p.name || "Untitled",
        slug: (p.slug) || (p.title ? p.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : String(p._id || "")),
        price: Number(p.price ?? 0),
        images: Array.isArray(p.images) ? p.images.map((img) => img?.url).filter(Boolean) : (p.thumb ? [p.thumb] : []),
        category: String(p.category || ""),
        attributes: {
          ...(p.brand ? { Brand: p.brand } : {}),
          ...(Array.isArray(p.tags) && p.tags.length ? { Tags: p.tags.slice(0, 3).join(", ") } : {}),
        },
        rating: Number(p.ratingAvg ?? p.rating ?? 0),
        stock: Number(p.stock ?? 0),
      }))

      const nextPagination = {
        page: Number(meta.page) || currentPage,
        pageSize: Number(meta.limit) || pagination.pageSize,
        total: Number(meta.total) || mappedProducts.length,
      }

      if (reset) {
        setProducts(mappedProducts)
      } else {
        setProducts((prev) => [...prev, ...mappedProducts])
      }

      setPagination(nextPagination)
      setHasMore(mappedProducts.length === nextPagination.pageSize)
      setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load products"
      setError(errorMessage)
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (isControlled) {
      props.onLoadMore?.()
      return
    }
    if (!loadingMore && hasMore) {
      fetchProducts(false)
    }
  }

  const handleRetry = () => {
    if (isControlled) return
    fetchProducts(true)
  }

  // Derive display values depending on mode
  const displayProducts = isControlled ? props.products || [] : products
  const displayLoading = isControlled ? Boolean(props.loading) : loading
  const displayError = isControlled ? props.error || null : error
  const displayPagination = isControlled
    ? props.pagination || { page: 1, pageSize: 12, total: 0 }
    : pagination
  const displayHasMore = isControlled
    ? (props.products?.length || 0) < (props.pagination?.total || 0)
    : hasMore

  if (displayLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="status" aria-label="Loading products">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    )
  }

  if (displayError) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="mb-4">{displayError}</AlertDescription>
        {!isControlled && (
          <Button onClick={handleRetry} variant="outline" size="sm">
          Try Again
          </Button>
        )}
      </Alert>
    )
  }

  if (displayProducts.length === 0) {
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
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {displayProducts.map((product) => (
          <ProductCardFlip key={product.id} product={product} />
        ))}
      </div>

      {/* Load More */}
      {displayHasMore && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            disabled={!isControlled ? loadingMore : false}
            variant="outline"
            size="lg"
            className="touch-manipulation bg-transparent"
          >
            {!isControlled && loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
      )}

      {/* Last Product Section */}
      {!displayHasMore && displayProducts.length > 0 && (
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
