"use client"

import { useEffect, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"

export function CartPage() {
  const { user } = useAuth()
  const { cart, updateQuantity, fetchCart, removeFromCart, loading } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/auth/login?next=/cart")
    } else {
      fetchCart()
    }
  }, [user]) // Only depend on user changes

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    const result = await updateQuantity(productId, newQuantity)
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (productId) => {
    const result = await removeFromCart(productId)
    toast({
      title: result.success ? "Item Removed" : "Error",
      description: result.success
        ? "Item has been removed from your cart"
        : result.error || "Failed to remove item",
      variant: result.success ? undefined : "destructive",
    })
  }

  const handleCheckout = () => navigate("/checkout")

  // Adapt mock cart JSON to UI shape
  const items = useMemo(() => {
    if (!cart?.items) return []
    return cart.items.map((i) => ({
      productId: i.product._id,
      name: i.title,
      image: i.thumb,
      price: i.price,
      qty: i.qty,
    }))
  }, [cart])

  const subtotal = useMemo(
    () => items?.reduce((acc, i) => acc + i.price * i.qty, 0),
    [items]
  )

  if (!user) return null
  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )

  if (items.length === 0)
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Link to="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img
                      src={
                        item.image ||
                        `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(
                          item.name
                        )}`
                      }
                      alt={item.name}
                      className="object-cover rounded-md w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1 truncate">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-primary">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.productId, item.qty - 1)
                        }
                        disabled={item.qty <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.qty}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.productId, item.qty + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="font-heading">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="truncate mr-2">
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{(subtotal * 0.08).toFixed(0)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  ₹{(subtotal * 1.08).toFixed(0)}
                </span>
              </div>

              <Button onClick={handleCheckout} className="w-full" size="lg">
                Proceed to Checkout
              </Button>

              <Link to="/products">
                <Button variant="outline" className="w-full bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
