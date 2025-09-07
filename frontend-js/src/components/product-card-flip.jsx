"use client"

import { useState } from "react"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { AlertModal } from "@/components/alert-modal"
import { useNavigate, Link } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"




export function ProductCardFlip({ product }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const result = await addToCart(product.id, quantity)

    if (result.success) {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add item to cart",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleLoginRedirect = () => {
    navigate(`/auth/login?next=/products`)
  }

  return (
    <>
      <div
        className="group relative h-96 perspective-1000 cursor-pointer"
        onTouchStart={() => setIsFlipped(!isFlipped)}
        role="button"
        tabIndex={0}
        aria-label={`Product: ${product.name}`}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
        >
          {/* Front of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <Link to={`/product/${product.id}`} className="block h-full">
              <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={
                      product.images[0] ||
                      `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(product.name)}`
                    }
                    alt={product.name}
                    className="object-cover group-hover:scale-105 transition-transform h-full w-full duration-300"

                  />
                  {product.stock === 0 && (
                    <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-medium text-foreground mb-2 line-clamp-2 text-balance">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex" role="img" aria-label={`Rating: ${product.rating} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({product.rating})</span>
                  </div>
                  <div className="mt-auto">
                    <p className="font-heading text-xl font-bold text-primary">Rs  {product.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm h-full flex flex-col p-4">
              <h3 className="font-medium text-foreground mb-3 line-clamp-2 text-balance">{product.name}</h3>

              {/* Quick attributes */}
              <div className="mb-4 space-y-2">
                {Object.entries(product.attributes)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
              </div>

              {/* Quantity selector */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setQuantity(Math.max(1, quantity - 1))
                    }}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="h-8 w-8 p-0 touch-manipulation"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center" aria-label={`Quantity: ${quantity}`}>
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                    className="h-8 w-8 p-0 touch-manipulation"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto space-y-2">
                <Button
                  className="w-full touch-manipulation"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isLoading}
                  aria-label={product.stock === 0 ? "Out of stock" : `Add ${product.name} to cart`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isLoading ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <div className="flex gap-2">
                  <Link to={`/product/${product.slug}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent touch-manipulation">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="touch-manipulation bg-transparent"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-2">
                <p className="font-heading text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required"
        description="Please login to add products to cart"
        onConfirm={handleLoginRedirect}
        onCancel={() => setShowLoginModal(false)}
        confirmText="Login"
        cancelText="Continue Browsing"
      />
    </>
  )
}
