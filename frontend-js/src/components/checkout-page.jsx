"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"

export function CheckoutPage() {
  const { user } = useAuth()
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
    },
  })

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true })
      return
    }

    if (!cart || cart.items.length === 0) {
      navigate("/cart", { replace: true })
      return
    }
  }, [user, cart, navigate])

  const handleInputChange = (field, value) => {
    if (field.startsWith("billing.")) {
      const billingField = field.replace("billing.", "")
      setPaymentData((prev) => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [billingField]: value,
        },
      }))
    } else {
      setPaymentData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!cart) return

    setLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          cartId: cart.cartId,
          paymentMethod: "card",
        }),
      })

      if (response.ok) {
        const data = await response.json()

        if (data.success) {
          clearCart()
          alert(`Order Placed Successfully!\nYour order #${data.orderId} has been confirmed`)
          navigate(`/orders/${data.orderId}`, { replace: true })
        } else {
          throw new Error(data.error || "Order creation failed")
        }
      } else {
        throw new Error("Payment processing failed")
      }
    } catch (error) {
      alert(`Payment Failed: ${error instanceof Error ? error.message : "An error occurred during payment"}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !cart) {
    return null
  }

  const subtotal = cart.subtotal
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </div>
              <div className="space-y-2">
                <label htmlFor="cardName" className="text-sm font-medium">Cardholder Name</label>
                <input
                  id="cardName"
                  className="w-full border rounded px-3 py-2"
                  placeholder="John Doe"
                  value={paymentData.cardName}
                  onChange={(e) => handleInputChange("cardName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cardNumber" className="text-sm font-medium">Card Number</label>
                <input
                  id="cardNumber"
                  className="w-full border rounded px-3 py-2"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</label>
                  <input
                    id="expiryDate"
                    className="w-full border rounded px-3 py-2"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cvv" className="text-sm font-medium">CVV</label>
                  <input
                    id="cvv"
                    className="w-full border rounded px-3 py-2"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 space-y-4">
              <div className="text-lg font-semibold">Billing Address</div>
              <div className="space-y-2">
                <label htmlFor="street" className="text-sm font-medium">Street Address</label>
                <input
                  id="street"
                  className="w-full border rounded px-3 py-2"
                  placeholder="123 Main St"
                  value={paymentData.billingAddress.street}
                  onChange={(e) => handleInputChange("billing.street", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">City</label>
                  <input
                    id="city"
                    className="w-full border rounded px-3 py-2"
                    placeholder="New York"
                    value={paymentData.billingAddress.city}
                    onChange={(e) => handleInputChange("billing.city", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">State</label>
                  <select
                    id="state"
                    className="w-full border rounded px-3 py-2"
                    value={paymentData.billingAddress.state}
                    onChange={(e) => handleInputChange("billing.state", e.target.value)}
                  >
                    <option value="">Select state</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-sm font-medium">ZIP Code</label>
                <input
                  id="zipCode"
                  className="w-full border rounded px-3 py-2"
                  placeholder="12345"
                  value={paymentData.billingAddress.zipCode}
                  onChange={(e) => handleInputChange("billing.zipCode", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <div className="border rounded-lg p-6 space-y-4 sticky top-4">
              <div className="text-lg font-semibold">Order Summary</div>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-medium">Rs {(item.price * item.qty)?.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <hr />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs {subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Rs {tax?.toFixed(2)}</span>
                </div>
              </div>

              <hr />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">Rs {total?.toFixed(2)}</span>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Complete Order
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                Your payment information is secure and encrypted
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
