"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { CategoryBar } from "@/components/category-bar"
import { ProductList } from "@/components/product-list"
import { FilterPanel } from "@/components/filter-panel"
import axiosInstance from "@/lib/axios-instance"

interface UIProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
  attributes: Record<string, any>
  rating: number
  stock: number
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<UIProduct[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [pageSize] = useState<number>(12)
  const [total, setTotal] = useState<number>(0)

  // Map UI sort to backend sort string
  const mapSort = (uiSort: string | null): string => {
    switch (uiSort) {
      case "newest":
        return "-createdAt"
      case "popularity":
        return "-popularity"
      case "price_asc":
        return "price"
      case "price_desc":
        return "-price"
      default:
        return "-createdAt"
    }
  }

  const buildUrl = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())

    const categoryId = params.get("categoryId")
    const subcategoryId = params.get("subcategoryId")
    const q = params.get("q")
    const brand = params.get("brand")
    const priceMin = params.get("price_min")
    const priceMax = params.get("price_max")
    const sort = mapSort(params.get("sort"))

    const backend = new URLSearchParams()
    backend.set("page", String(nextPage))
    backend.set("limit", String(pageSize))
    backend.set("sort", sort)
    if (q) backend.set("q", q)
    if (brand) backend.set("brand", brand)
    if (priceMin) backend.set("minPrice", priceMin)
    if (priceMax) backend.set("maxPrice", priceMax)
    if (subcategoryId) backend.set("subcategoryId", subcategoryId)

    if (categoryId) {
      return `/api/products/categories/${categoryId}/products?${backend.toString()}`
    }
    return `/api/products?${backend.toString()}`
  }

  const mapProducts = (items: any[]): UIProduct[] => {
    return items.map((p: any) => ({
      id: String(p._id || p.id),
      name: p.title || p.name || "Untitled",
      slug:
        (p.slug as string) ||
        (p.title
          ? p.title
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "")
          : String(p._id || "")),
      price: Number(p.price ?? 0),
      images: Array.isArray(p.images) ? p.images.map((img: any) => img?.url).filter(Boolean) : p.thumb ? [p.thumb] : [],
      category: String(p.category || ""),
      attributes: p.attributes || {},
      rating: Number(p.ratingAvg ?? p.rating ?? 0),
      stock: Number(p.stock ?? 0),
    }))
  }

  const fetchProducts = async (reset: boolean) => {
    try {
      const nextPage = reset ? 1 : page + 1
      if (reset) {
        setLoading(true)
        setError(null)
      }

      const url = buildUrl(nextPage)
      const { data: resp } = await axiosInstance.get(url)
      const items = mapProducts(resp.data || [])
      const meta = resp.meta || { page: nextPage, limit: pageSize, total: items.length }

      if (reset) {
        setProducts(items)
      } else {
        setProducts((prev) => [...prev, ...items])
      }
      setPage(Number(meta.page) || nextPage)
      setTotal(Number(meta.total) || items.length)
    } catch (e: any) {
      setError(e?.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(true)
  }, [searchParams])

  const handleLoadMore = () => fetchProducts(false)

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <CategoryBar />
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="lg:w-64 lg:flex-shrink-0">
            <FilterPanel />
          </aside>
          <div className="flex-1 min-w-0">
            <ProductList
              products={products}
              pagination={{ page, pageSize, total }}
              loading={loading}
              error={error}
              onLoadMore={handleLoadMore}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
