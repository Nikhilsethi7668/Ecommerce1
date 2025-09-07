"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import axiosInstance from "@/lib/axios-instance"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"

const toSlug = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")

export function CategoryBar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("")
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  useEffect(() => {
    const categoryId = searchParams.get("categoryId")
    const subcategoryId = searchParams.get("subcategoryId")
    setSelectedCategoryId(categoryId || "")
    setSelectedSubcategoryId(subcategoryId || "")
  }, [searchParams])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const { data } = await axiosInstance.get("/api/products/categories")
        const mapped = (Array.isArray(data) ? data : []).map(
          (c) => ({
            id: c._id,
            name: c.name,
            slug: toSlug(c.name || ""),
            imageUrl: c.imageUrl,
            subcategories: Array.isArray(c.subcategories)
              ? c.subcategories
                  .filter((sc) => sc && sc.name && (sc.isActive ?? true))
                  .map((sc) => ({
                    id: sc._id || toSlug(sc.name || ""),
                    name: sc.name,
                    slug: toSlug(sc.name || ""),
                    imageUrl: sc.imageUrl,
                  }))
              : [],
          })
        )
        setCategories(mapped)
      } catch (err) {
        console.error("Failed to fetch categories", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const setCategoryOnOpen = (categoryId) => {
    setSelectedCategoryId(categoryId)
    setSelectedSubcategoryId("")
    const params = new URLSearchParams(searchParams.toString())
    params.set("categoryId", categoryId)
    params.delete("subcategoryId")
    params.delete("page")
    navigate(`/products?${params.toString()}`)
  }

  const handleCategoryClick = (categoryId) => {
    if (categoryId === selectedCategoryId) {
      setSelectedCategoryId("")
      setSelectedSubcategoryId("")
    } else {
      setSelectedCategoryId(categoryId)
      setSelectedSubcategoryId("")
    }
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId === selectedCategoryId) {
      params.delete("categoryId")
      params.delete("subcategoryId")
    } else {
      params.set("categoryId", categoryId)
      params.delete("subcategoryId")
    }

    params.delete("page")

    navigate(`/products?${params.toString()}`)
  }

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    setSelectedCategoryId(categoryId)
    setSelectedSubcategoryId(subcategoryId)
    const params = new URLSearchParams(searchParams.toString())
    params.set("categoryId", categoryId)
    params.set("subcategoryId", subcategoryId)
    params.delete("page")
    navigate(`/products?${params.toString()}`)
  }

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="lg:hidden py-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2">
              {loading && categories.length === 0 ? (
                <span className="text-sm text-muted-foreground">Loading categories...</span>
              ) : categories.map((category) => (
                category.subcategories && category.subcategories.length > 0 ? (
                  <DropdownMenu
                    key={category.id}
                    onOpenChange={(open) => {
                      if (open) setCategoryOnOpen(category.id)
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Card
                        className={`flex items-center gap-2 px-3 py-2 shadow-none flex-shrink-0 touch-manipulation cursor-pointer ${
                          selectedCategoryId === category.id ? "border-primary bg-primary/10" : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="rounded h-12 w-12 object-cover"
                            />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-muted inline-flex items-center justify-center text-[10px]">
                              {category.name?.[0]?.toUpperCase()}
                            </span>
                          )}
                          <span className="text-sm">{category.name}</span>
                        </span>
                      </Card>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>
                        <span className="flex items-center gap-2">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="rounded h-12 w-12 object-cover"
                            />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-muted inline-flex items-center justify-center text-[9px]">
                              {category.name?.[0]?.toUpperCase()}
                            </span>
                          )}
                          <span>{category.name}</span>
                        </span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => handleCategoryClick(category.id)}>
                        View all {category.name}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {category.subcategories.map((sub) => (
                        <DropdownMenuItem
                          key={sub.id}
                          onSelect={() => handleSubcategoryClick(category.id, sub.id)}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`inline-block w-3 text-primary ${selectedSubcategoryId === sub.id ? '' : 'opacity-0'}`}>
                              ✓
                            </span>
                            {sub.imageUrl ? (
                              <img
                                src={sub.imageUrl}
                                alt={sub.name}
                                className="rounded h-12 w-12 object-cover"
                              />
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-muted inline-flex items-center justify-center text-[9px]">
                                {sub.name?.[0]?.toUpperCase()}
                              </span>
                            )}
                            <span>{sub.name}</span>
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Card
                    key={category.id}
                    role="button"
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center gap-2 shadow-none px-3 py-2 flex-shrink-0 touch-manipulation cursor-pointer ${
                      selectedCategoryId === category.id ? "border-primary bg-primary/10" : "hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="rounded h-12 w-12 object-cover"
                        />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-muted inline-flex items-center justify-center text-[10px]">
                          {category.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                      <span className="text-sm">{category.name}</span>
                    </span>
                  </Card>
                )
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="hidden lg:flex items-center justify-center py-4">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {loading && categories.length === 0 ? (
              <span className="text-sm text-muted-foreground">Loading categories...</span>
            ) : categories.map((category) => (
              category.subcategories && category.subcategories.length > 0 ? (
                <DropdownMenu
                  key={category.id}
                  onOpenChange={(open) => {
                    if (open) setCategoryOnOpen(category.id)
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Card
                      className={`font-medium touch-manipulation cursor-pointer px-3 py-2 ${
                        selectedCategoryId === category.id ? "border-primary bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="rounded h-12 w-12 object-cover"
                          />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-muted inline-flex items-center justify-center text-[11px]">
                            {category.name?.[0]?.toUpperCase()}
                          </span>
                        )}
                        <span>{category.name}</span>
                      </span>
                    </Card>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>
                      <span className="flex items-center gap-2">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="rounded h-12 w-12  object-cover"
                          />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-muted inline-flex items-center justify-center text-[9px]">
                            {category.name?.[0]?.toUpperCase()}
                          </span>
                        )}
                        <span>{category.name}</span>
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleCategoryClick(category.id)}>
                      View all {category.name}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {category.subcategories.map((sub) => (
                      <DropdownMenuItem
                        key={sub.id}
                        onSelect={() => handleSubcategoryClick(category.id, sub.id)}
                      >
                        <span className="flex justify-between items-center gap-2">
                          <span className={`inline-block w-3 text-primary ${selectedSubcategoryId === sub.id ? '' : 'opacity-0'}`}>
                            ✓
                          </span>
                          {sub.imageUrl ? (
                            <img
                              src={sub.imageUrl}
                              alt={sub.name}
                              className="rounded h-10 w-10 object-cover"
                            />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-muted inline-flex items-center justify-center text-[9px]">
                              {sub.name?.[0]?.toUpperCase()}
                            </span>
                          )}
                          <span>{sub.name}</span>
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Card
                  key={category.id}
                  role="button"
                  onClick={() => handleCategoryClick(category.id)}
                  className={`font-medium touch-manipulation h-auto max-h-auto cursor-pointer px-3 py-2 ${
                    selectedCategoryId === category.id ? "border-primary bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="rounded h-12 w-12 object-cover"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-muted inline-flex items-center justify-center text-[11px]">
                        {category.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                    <span>{category.name}</span>
                  </span>
                </Card>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
