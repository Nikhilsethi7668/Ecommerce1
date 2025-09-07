"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react"
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

  // track per-line “busy” state so we can disable controls without blanking the page
  const [busyKeys, setBusyKeys] = useState(() => new Set())

  // if user logs out → redirect, else fetch once
  useEffect(() => {
    if (!user) navigate("/auth/login?next=/cart")
    else fetchCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const items = useMemo(() => {
    const list = cart?.items || []
    return list.map((i) => {
      const pid = typeof i.product === "object" ? i.product?._id : i.product
      return {
        key: `${String(pid || "")}:${i.variantSku || ""}`,
        productId: String(pid || ""),
        variantSku: i.variantSku || null,
        name: i.title,
        image: i.thumb,
        price: Number(i.price || 0),
        qty: Number(i.qty || 0),
      }
    })
  }, [cart])

  const hasItems = items.length > 0
  const subtotal = useMemo(() => items.reduce((acc, it) => acc + it.price * it.qty, 0), [items])

  const setBusy = (key, val) =>
    setBusyKeys((prev) => {
      const next = new Set(prev)
      if (val) next.add(key)
      else next.delete(key)
      return next
    })

  const onQty = async (it, nextQty) => {
    if (nextQty < 1) return
    setBusy(it.key, true)
    const res = await updateQuantity(it.productId, nextQty, it.variantSku)
    if (!res.success) {
      toast({ title: "Error", description: res.error || "Failed to update quantity", variant: "destructive" })
    }
    setBusy(it.key, false)
  }

  const onRemove = async (it) => {
    setBusy(it.key, true)
    const res = await removeFromCart(it.productId, it.variantSku)
    toast({
      title: res.success ? "Item Removed" : "Error",
      description: res.success ? "Item has been removed from your cart" : res.error || "Failed to remove item",
      variant: res.success ? undefined : "destructive",
    })
    setBusy(it.key, false)
  }

  if (!user) return null

  // Show big loader only when we DON'T have anything to show yet.
  if (!hasItems && loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!loading && !hasItems) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
        <Link to="/"><Button>Continue Shopping</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const isBusy = busyKeys.has(item.key)
            return (
              <Card key={item.key} className={isBusy ? "opacity-90" : ""}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={item.image || `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(item.name)}`}
                        alt={item.name}
                        className="object-cover rounded-md w-full h-full"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1 truncate">{item.name}</h3>
                      <p className="text-lg font-bold text-primary">₹{item.price.toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onQty(item, item.qty - 1)}
                          disabled={item.qty <= 1 || isBusy}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onQty(item, item.qty + 1)}
                          disabled={isBusy}
                        >
                          {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(item)}
                        disabled={isBusy}
                        className="text-destructive hover:text-destructive disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader><CardTitle className="font-heading">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.key} className="flex justify-between text-sm">
                    <span className="truncate mr-2">{it.name} × {it.qty}</span>
                    <span className="font-medium">₹{(it.price * it.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>Free</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹{(subtotal * 0.08).toFixed(0)}</span></div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{(subtotal * 1.08).toFixed(0)}</span>
              </div>

              <Button onClick={() => navigate("/checkout")} className="w-full" size="lg">
                Proceed to Checkout
              </Button>

              <Link to="/"><Button variant="outline" className="w-full bg-transparent">Continue Shopping</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
