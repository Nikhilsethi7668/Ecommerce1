"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { X, Filter } from "lucide-react"

interface FilterPanelProps {
  className?: string
}

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
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("")

  useEffect(() => {
    // Initialize filters from URL params
    const category = searchParams.get("category")
    const brand = searchParams.get("brand")
    const priceMin = searchParams.get("price_min")
    const priceMax = searchParams.get("price_max")
    const sort = searchParams.get("sort")

    if (category) {
      setSelectedCategories(category.split(","))
    }
    if (brand) {
      setSelectedBrands(brand.split(","))
    }
    if (priceMin || priceMax) {
      setPriceRange([priceMin ? Number.parseInt(priceMin) : 0, priceMax ? Number.parseInt(priceMax) : 1000])
    }
    if (sort) {
      setSortBy(sort)
    }
  }, [searchParams])

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Reset to first page when filters change
    params.delete("page")

    router.push(`/products?${params.toString()}`)
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter((id) => id !== categoryId)

    setSelectedCategories(newCategories)
    updateFilters({
      category: newCategories.length > 0 ? newCategories.join(",") : null,
    })
  }

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const newBrands = checked ? [...selectedBrands, brandId] : selectedBrands.filter((id) => id !== brandId)

    setSelectedBrands(newBrands)
    updateFilters({
      brand: newBrands.length > 0 ? newBrands.join(",") : null,
    })
  }

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
  }

  const applyPriceFilter = () => {
    updateFilters({
      price_min: priceRange[0].toString(),
      price_max: priceRange[1].toString(),
    })
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    updateFilters({ sort: value })
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([0, 1000])
    setSortBy("")
    router.push("/products")
  }

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000 || sortBy

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

      {/* Sort */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Sort By</Label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Price Range</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={1000}
            min={0}
            step={10}
            className="mb-4"
            aria-label="Price range"
          />
          <div className="flex items-center gap-2 mb-3">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
              className="flex-1"
              placeholder="Min"
              aria-label="Minimum price"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 1000])}
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

      {/* Categories */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Categories</Label>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
              />
              <Label htmlFor={category.id} className="text-sm font-normal cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Brands</Label>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={brand.id}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={(checked) => handleBrandChange(brand.id, checked as boolean)}
              />
              <Label htmlFor={brand.id} className="text-sm font-normal cursor-pointer">
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FilterPanel({ className }: FilterPanelProps) {
  return (
    <>
      {/* Desktop Filter Panel */}
      <div className={`hidden lg:block bg-card border border-border rounded-lg p-6 ${className}`}>
        <FilterContent />
      </div>

      {/* Mobile Filter Sheet */}
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
