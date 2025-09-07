"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import axiosInstance from "@/lib/axios-instance"


export default function CategorySections() {
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/products/home")
        setCategories(response.data.categories)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  const goToProduct = (productId) => {
    navigate(`/product/${productId}`)
  }

  const goToCategory = (categoryId) => {
    navigate(`/products?categoryId=${categoryId}`)
  }

  return (
    <div className="max-w-7xl mx-auto bg-white p-4 space-y-12">
      {categories.map((category) => (
        <section key={category._id} className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <p className="text-muted-foreground text-sm">{category.description}</p>
            </div>
            <Button variant="outline" onClick={() => goToCategory(category._id)}>
              View More
            </Button>
          </div>

          {/* Horizontal scroll carousel */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {category.products.map((product) => (
              <Card
                key={product._id}
                className="w-56 flex-shrink-0 cursor-pointer py-0 hover:shadow-md transition"
                onClick={() => goToProduct(product._id)}
              >
                <CardHeader className="p-0">
                  <img
                    src={product.thumb}
                    alt={product.title}
                    className="h-40 w-full object-cover rounded-t-md"
                  />
                </CardHeader>

                <CardContent className="p-3 space-y-1">
                  {/* Title + brand */}
                  <h3 className="font-medium truncate">{product.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{product.brand}</p>

                  {/* Optional rating / reviews */}
                  {product.rating !== undefined && (
                    <div className="flex items-center text-yellow-500 text-xs gap-1">
                      <span>⭐ {product.rating}</span>
                      {product.reviews && <span className="text-muted-foreground">({product.reviews} reviews)</span>}
                    </div>
                  )}

                  {/* Short description if you have it */}
                  {product.shortDesc && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{product.shortDesc}</p>
                  )}

                  <Separator className="my-2" />

                  {/* Price + stock */}
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primary">₹{product.price.toLocaleString()}</p>
                    {product.inStock !== undefined && (
                      <span
                        className={`text-xs font-medium ${product.inStock ? "text-green-600" : "text-red-500"
                          }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    )}
                  </div>

                  {product.discount && (
                    <p className="text-xs text-muted-foreground">
                      <span className="line-through">₹{product.originalPrice?.toLocaleString()}</span>{" "}
                      <span className="text-red-500 font-medium">{product.discount}% off</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

          </div>
        </section>
      ))}
    </div>
  )
}
