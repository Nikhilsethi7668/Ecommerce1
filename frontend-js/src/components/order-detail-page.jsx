
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"



const statusConfig = {
  processing: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Package,
    label: "Processing",
  },
  shipped: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Truck,
    label: "Shipped",
  },
  delivered: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Delivered",
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Cancelled",
  },
}

export function OrderDetailPage({ orderId, showSuccess }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate("/auth/login?next=/orders")
      return
    }

    fetchOrder()
  }, [user, navigate, orderId])

  useEffect(() => {
    if (showSuccess) {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${orderId} has been confirmed and is being processed.`,
      })
    }
  }, [showSuccess, orderId, toast])

  const fetchOrder = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        throw new Error("Order not found")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link to="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    )
  }

  const StatusIcon = statusConfig[order.status].icon

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Order #{order.orderId}</h1>
          <p className="text-muted-foreground">Placed on {formatDate(order.date)}</p>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your order has been successfully placed and payment confirmed. You will receive email updates about your
            order status.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge className={statusConfig[order.status].color}>{statusConfig[order.status].label}</Badge>
                {order.trackingNumber && (
                  <div className="text-sm text-muted-foreground">
                    Tracking: <span className="font-mono">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-4 border border-border rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img
                        src={item.image || `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(item.name)}`}
                        alt={item.name}
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.qty}</p>
                      <p className="text-sm font-medium">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="font-heading">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>

              <div className="space-y-3 pt-4">
                <Button className="w-full bg-transparent" variant="outline">
                  Track Package
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  Download Invoice
                </Button>
                {order.status === "delivered" && <Button className="w-full">Leave Review</Button>}
              </div>

              <div className="text-xs text-muted-foreground text-center pt-4">
                Need help?{" "}
                <Link to="/support" className="text-primary hover:underline">
                  Contact Support
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
