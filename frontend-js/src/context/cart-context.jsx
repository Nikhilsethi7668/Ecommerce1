"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import axiosInstance from "@/lib/axios-instance"

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [user])

  const fetchCart = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await axiosInstance.get("/api/cart")

      if (response.status === 200) {
        const data = await response.data
        setCart(data.cart)
        console.log(data);
        
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, qty) => {
    console.log("Add to cart called");
    
    if (!user) {
      return { success: false, error: "Please login to add items to cart" }
    }
     
    try {
      const response = await axiosInstance.post("/api/cart/add", {
        productId,
        qty,
        variantSku: null,
      })

      const data = await response.data

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

  const updateQuantity = async (productId, qty) => {
    if (!user) return { success: false, error: "Authentication required" }

    try {
      const response = await fetch("/api/cart", {
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

  const removeFromCart = async (productId) => {
    if (!user) return { success: false, error: "Authentication required" }

    try {
      const response = await fetch(`/api/cart/${productId}`, {
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
        fetchCart,
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
