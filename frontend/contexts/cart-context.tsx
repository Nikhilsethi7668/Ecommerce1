"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"

interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
  image: string
}

interface Cart {
  cartId: string
  items: CartItem[]
  subtotal: number
}

interface CartContextType {
  cart: Cart | null
  addToCart: (productId: string, qty: number) => Promise<{ success: boolean; error?: string }>
  updateQuantity: (productId: string, qty: number) => Promise<{ success: boolean; error?: string }>
  removeFromCart: (productId: string) => Promise<{ success: boolean; error?: string }>
  clearCart: () => void
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()

  useEffect(() => {
    if (user && token) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [user, token])

  const fetchCart = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCart(data)
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, qty: number) => {
    if (!token) {
      return { success: false, error: "Please login to add items to cart" }
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qty }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.cart)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const updateQuantity = async (productId: string, qty: number) => {
    if (!token) return { success: false, error: "Authentication required" }

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, qty }),
      })

      const data = await response.json()

      if (data.success) {
        setCart(data.cart)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!token) return { success: false, error: "Authentication required" }

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        await fetchCart() // Refresh cart
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const clearCart = () => {
    setCart(null)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
