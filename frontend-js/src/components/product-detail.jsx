
import { useState, useEffect } from "react"
import { Star, ShoppingCart, Heart, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { AlertModal } from "@/components/alert-modal"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import axiosInstance from "@/lib/axios-instance"


export function ProductDetail({ id }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await axiosInstance.get(`/api/products/products/${id}`)
      if (response.data.success) {
        setProduct(response.data.product)
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (!product || product.variants[selectedVariant].stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This variant is currently out of stock",
        variant: "destructive",
      })
      return
    }
    console.log("Called");
    
    const result = await addToCart(product._id, quantity, product.variants[selectedVariant].sku)
    if (result.success) {
      toast({
        title: "Added to Cart",
        description: `${product.title} (${product.variants[selectedVariant].color}) has been added to your cart`,
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add item to cart",
        variant: "destructive",
      })
    }
  }

  const handleLoginRedirect = () => {
    if (product && product._id) {
      navigate(`/auth/login?next=/product/${product._id}`)
    } else {
      navigate(`/auth/login`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>
    )
  }

  return (
    <>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* Product Images */}
  <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border border-border w-full max-w-md mx-auto md:max-w-none">
            <img
              src={product.images[selectedImage]?.url || `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.title)}`}
              alt={product.images[selectedImage]?.alt || product.title}
              className="object-cover w-full h-full"
              style={{ maxHeight: '350px' }}
            />
            {product.variants[selectedVariant].stock === 0 && <Badge className="absolute top-4 left-4 bg-destructive">Out of Stock</Badge>}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 ${selectedImage === index ? "border-primary" : "border-border"}`}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt || `${product.title} ${index + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
  <div className="space-y-6 px-2 md:px-0">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{product.title}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.ratingAvg) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">({product.ratingAvg} / {product.ratingCount} reviews)</span>
              </div>
              <Badge variant="outline">Brand: {product.brand}</Badge>
              <Badge variant="outline">Category: {product.category?.name}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-heading text-3xl font-bold text-primary">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="line-through text-muted-foreground text-lg">₹{product.mrp}</span>
              )}
            </div>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Select Color:</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, idx) => (
                  <Button
                    key={variant.sku}
                    variant={selectedVariant === idx ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSelectedVariant(idx); setQuantity(1); }}
                    className="min-w-[64px]"
                  >
                    {variant.color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity:</label>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 md:w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.variants[selectedVariant].stock, quantity + 1))}
                  disabled={quantity >= product.variants[selectedVariant].stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-2 md:ml-4">{product.variants[selectedVariant].stock} in stock</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <Button size="lg" className="flex-1 py-2" onClick={handleAddToCart} disabled={product.variants[selectedVariant].stock === 0}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.variants[selectedVariant].stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Tags:</h3>
              <div className="flex gap-2 flex-wrap">
                {product.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="mb-1">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <div className="prose max-w-none">
            <p className="text-foreground leading-relaxed">{product.description}</p>
          </div>
        </TabsContent>
        <TabsContent value="variants" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.variants.map(variant => (
              <div key={variant.sku} className="flex flex-col py-2 border-b border-border">
                <span className="text-muted-foreground capitalize">SKU: {variant.sku}</span>
                <span className="text-foreground font-medium">Color: {variant.color}</span>
                <span className="text-foreground font-medium">Stock: {variant.stock}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Reviews coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

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
