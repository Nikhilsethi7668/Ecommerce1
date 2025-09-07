"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Calendar, Package, Filter, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  productId: string
  name: string
  price: number
  qty: number
  image: string
}

interface Order {
  orderId: string
  date: string
  status: "processing" | "shipped" | "delivered" | "cancelled"
  items: OrderItem[]
  total: number
}

const statusColors = {
  processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const statusLabels = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export function OrdersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?next=/orders")
      return
    }

    // Initialize filters from URL params
    const status = searchParams.get("status") || ""
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""

    setFilters({ status, dateFrom, dateTo })
    fetchOrders({ status, dateFrom, dateTo })
  }, [user, router, searchParams])

  const fetchOrders = async (filterParams = filters) => {
    if (!user) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterParams.status) params.set("status", filterParams.status)
      if (filterParams.dateFrom) params.set("dateFrom", filterParams.dateFrom)
      if (filterParams.dateTo) params.set("dateTo", filterParams.dateTo)

      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        throw new Error("Failed to fetch orders")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)

    // Update URL params
    const params = new URLSearchParams()
    if (updatedFilters.status) params.set("status", updatedFilters.status)
    if (updatedFilters.dateFrom) params.set("dateFrom", updatedFilters.dateFrom)
    if (updatedFilters.dateTo) params.set("dateTo", updatedFilters.dateTo)

    const queryString = params.toString()
    router.push(`/orders${queryString ? `?${queryString}` : ""}`)
  }

  const clearFilters = () => {
    setFilters({ status: "", dateFrom: "", dateTo: "" })
    router.push("/orders")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getItemsSummary = (items: OrderItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0)
    if (items.length === 1) {
      return `${items[0].name} (${items[0].qty})`
    }
    return `${totalItems} items`
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

  const lastOrder = orders.length > 0 ? orders[0] : null
  const otherOrders = orders.slice(1)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">My Orders</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => fetchOrders()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilters({ dateFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={filters.dateTo} onChange={(e) => updateFilters({ dateTo: e.target.value })} />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">No orders found</h2>
          <p className="text-muted-foreground mb-6">
            {filters.status || filters.dateFrom || filters.dateTo
              ? "No orders match your current filters."
              : "You haven't placed any orders yet."}
          </p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Last Order - Highlighted */}
          {lastOrder && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-bold text-foreground">Last Order</h2>
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-heading text-lg font-bold">Order #{lastOrder.orderId}</h3>
                        <Badge className={statusColors[lastOrder.status]}>{statusLabels[lastOrder.status]}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(lastOrder.date)}
                        </div>
                        <span>{getItemsSummary(lastOrder.items)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-xl font-bold text-primary">${lastOrder.total.toFixed(2)}</p>
                      <Link href={`/orders/${lastOrder.orderId}`}>
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lastOrder.items.slice(0, 3).map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                        </div>
                      </div>
                    ))}
                    {lastOrder.items.length > 3 && (
                      <div className="flex items-center justify-center p-3 bg-background rounded-lg">
                        <span className="text-sm text-muted-foreground">+{lastOrder.items.length - 3} more items</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other Orders */}
          {otherOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-bold text-foreground">Previous Orders</h2>
              <div className="space-y-4">
                {otherOrders.map((order) => (
                  <Card key={order.orderId}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">Order #{order.orderId}</h3>
                            <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.date)}
                            </div>
                            <span>{getItemsSummary(order.items)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-heading text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                          <Link href={`/orders/${order.orderId}`}>
                            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
