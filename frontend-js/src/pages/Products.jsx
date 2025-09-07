"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { TopBar } from "@/components/top-bar"
import { CategoryBar } from "@/components/category-bar"
import { ProductList } from "@/components/product-list"
import { FilterPanel } from "@/components/filter-panel"
import axiosInstance from "@/lib/axios-instance"

const PAGE_SIZE = 12

export default function ProductsPage() {
  const [searchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const sortMap = {
    newest: "-createdAt",
    popularity: "-popularity",
    price_asc: "price",
    price_desc: "-price",
  }

  const buildUrl = (nextPage) => {
    const categoryId = searchParams.get("categoryId")
    const subcategoryId = searchParams.get("subcategoryId")
    const q = searchParams.get("q")
    const brand = searchParams.get("brand")
    const priceMin = searchParams.get("price_min")
    const priceMax = searchParams.get("price_max")
    const uiSort = searchParams.get("sort") || "newest"
    const sort = sortMap[uiSort] || "-createdAt"

    const qs = new URLSearchParams()
    qs.set("page", String(nextPage))
    qs.set("limit", String(PAGE_SIZE))
    qs.set("sort", sort)
    if (q) qs.set("q", q)
    if (brand) qs.set("brand", brand)
    if (priceMin) qs.set("minPrice", priceMin)
    if (priceMax) qs.set("maxPrice", priceMax)
    if (subcategoryId) qs.set("subcategoryId", subcategoryId)

    const base = categoryId
      ? `/api/products/categories/${categoryId}/products`
      : `/api/products`

    return `${base}?${qs.toString()}`
  }

  const pickProducts = (items = []) =>
    items.map((p) => ({
      id: String(p._id || p.id),
      name: p.title || p.name || "Untitled",
      price: Number(p.price ?? 0),
      images: Array.isArray(p.images)
        ? p.images.map((img) => img?.url).filter(Boolean)
        : p.thumb
          ? [p.thumb]
          : [],
      rating: Number(p.ratingAvg ?? p.rating ?? 0),
      stock: Number(p.stock ?? 0),
    }))

  const fetchProducts = async (reset = true) => {
    try {
      setError(null)
      if (reset) setLoading(true)

      const nextPage = reset ? 1 : page + 1
      const url = buildUrl(nextPage)

      const { data } = await axiosInstance.get(url)
      const items = pickProducts(data?.data || [])
      const meta = data?.meta || {}

      setProducts((prev) => (reset ? items : [...prev, ...items]))
      setPage(Number(meta.page) || nextPage)
      setTotal(Number(meta.total) || (reset ? items.length : total))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load products")
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
              pagination={{ page, pageSize: PAGE_SIZE, total }}
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
