"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { X, Filter } from "lucide-react"

const MIN_PRICE = 0
const MAX_PRICE = 100000
const PRICE_STEP = 10

const categories = [
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "home-garden", name: "Home & Garden" },
  { id: "sports", name: "Sports" },
  { id: "books", name: "Books" },
]

const brands = [
  { id: "apple", name: "Apple" },
  { id: "samsung", name: "Samsung" },
  { id: "nike", name: "Nike" },
  { id: "adidas", name: "Adidas" },
  { id: "sony", name: "Sony" },
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "popularity", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
]

function FilterContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [sortBy, setSortBy] = useState("")

  useEffect(() => {
    const category = searchParams.get("category")
    const brand = searchParams.get("brand")
    const priceMin = searchParams.get("price_min")
    const priceMax = searchParams.get("price_max")
    const sort = searchParams.get("sort")

    if (category) setSelectedCategories(category.split(","))
    if (brand) setSelectedBrands(brand.split(","))
    setPriceRange([
      priceMin ? parseInt(priceMin, 10) : MIN_PRICE,
      priceMax ? parseInt(priceMax, 10) : MAX_PRICE,
    ])
    if (sort) setSortBy(sort)
  }, [searchParams])

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key)
      else params.set(key, value)
    })
    params.delete("page")
    navigate(`/products?${params.toString()}`)
  }

  const handleCategoryChange = (categoryId, checked) => {
    const next = checked ? [...selectedCategories, categoryId] : selectedCategories.filter((id) => id !== categoryId)
    setSelectedCategories(next)
    updateFilters({ category: next.length ? next.join(",") : null })
  }

  const handleBrandChange = (brandId, checked) => {
    const next = checked ? [...selectedBrands, brandId] : selectedBrands.filter((id) => id !== brandId)
    setSelectedBrands(next)
    updateFilters({ brand: next.length ? next.join(",") : null })
  }

  const handlePriceChange = (values) => setPriceRange(values)

  const applyPriceFilter = () => {
    const min = Math.max(MIN_PRICE, Math.min(priceRange[0], MAX_PRICE))
    const max = Math.max(min, Math.min(priceRange[1], MAX_PRICE))
    setPriceRange([min, max])
    updateFilters({ price_min: String(min), price_max: String(max) })
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    updateFilters({ sort: value })
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([MIN_PRICE, MAX_PRICE])
    setSortBy("")
    navigate("/products")
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange[0] > MIN_PRICE ||
    priceRange[1] < MAX_PRICE ||
    Boolean(sortBy)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="touch-manipulation">
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Sort By (Working)</Label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Price Range (Working)</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={MAX_PRICE}
            min={MIN_PRICE}
            step={PRICE_STEP}
            className="mb-4"
            aria-label="Price range"
          />
          <div className="flex items-center gap-2 mb-3">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const v = parseInt(e.target.value || "0", 10)
                setPriceRange([Number.isNaN(v) ? MIN_PRICE : v, priceRange[1]])
              }}
              className="flex-1"
              placeholder="Min"
              aria-label="Minimum price"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const v = parseInt(e.target.value || String(MAX_PRICE), 10)
                setPriceRange([priceRange[0], Number.isNaN(v) ? MAX_PRICE : v])
              }}
              className="flex-1"
              placeholder="Max"
              aria-label="Maximum price"
            />
          </div>
          <Button size="sm" onClick={applyPriceFilter} className="w-full touch-manipulation">
            Apply Price Filter
          </Button>
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium mb-3 block">Brands (Working)</Label>
        <div className="space-y-3">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center space-x-2">
              <Checkbox
                id={b.id}
                checked={selectedBrands.includes(b.id)}
                onCheckedChange={(checked) => handleBrandChange(b.id, Boolean(checked))}
              />
              <Label htmlFor={b.id} className="text-sm font-normal cursor-pointer">
                {b.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">Categories (Select From Top)</Label>
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center space-x-2">
              <Checkbox
                id={c.id}
                checked={selectedCategories.includes(c.id)}
                onCheckedChange={(checked) => handleCategoryChange(c.id, Boolean(checked))}
              />
              <Label htmlFor={c.id} className="text-sm font-normal cursor-pointer">
                {c.name}
              </Label>
            </div>
          ))}
        </div>
      </div>


    </div>
  )
}

export function FilterPanel({ className }) {
  return (
    <>
      <div className={`hidden lg:block bg-card border border-border rounded-lg p-6 ${className}`}>
        <FilterContent />
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full mb-4 touch-manipulation bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filters & Sort
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="font-heading">Filters & Sort</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
