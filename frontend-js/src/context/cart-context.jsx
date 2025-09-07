"use client"

import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { useAuth } from "@/context/auth-context"
import axiosInstance from "@/lib/axios-instance"

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) fetchCart()
    else setCart(null)
  }, [user])

  const fetchCart = async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data } = await axiosInstance.get("/api/cart")
      if (data?.cart) setCart(data.cart)
    } catch (e) {
      console.error("Failed to fetch cart:", e)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, qty = 1, variantSku = null, meta = undefined) => {
    if (!user) return { success: false, error: "Please login to add items to cart" }
    try {
      const { data } = await axiosInstance.post("/api/cart/add", { productId, qty, variantSku, meta })
      if (data?.cart) {
        setCart(data.cart)
        return { success: true }
      }
      return { success: false, error: data?.message || "Add to cart failed" }
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || "Network error occurred" }
    }
  }

  const removeFromCart = async (productId, variantSku = null) => {
    if (!user) return { success: false, error: "Authentication required" }
    try {
      const { data } = await axiosInstance.post("/api/cart/remove", { productId, variantSku })
      if (data?.cart) {
        setCart(data.cart)
        return { success: true }
      }
      return { success: false, error: data?.message || "Remove failed" }
    } catch (e) {
      return { success: false, error: e?.response?.data?.message || "Network error occurred" }
    }
  }

  const updateQuantity = async (productId, nextQty, variantSku = null) => {
    if (!user) return { success: false, error: "Authentication required" }
    if (nextQty < 0) nextQty = 0

    const items = cart?.items || []
    const match = items.find((it) => {
      const pid = typeof it.product === "object" ? it.product?._id : it.product
      return String(pid) === String(productId) && String(it.variantSku || "") === String(variantSku || "")
    })
    const currentQty = match?.qty ?? 0

    if (!match && nextQty === 0) return { success: true }
    if (!match && nextQty > 0) return addToCart(productId, nextQty, variantSku)

    if (nextQty === currentQty) return { success: true }
    if (nextQty === 0) return removeFromCart(productId, variantSku)

    if (nextQty > currentQty) {
      const delta = nextQty - currentQty
      return addToCart(productId, delta, variantSku)
    }

    const { success, error } = await removeFromCart(productId, variantSku)
    if (!success) return { success, error }
    return addToCart(productId, nextQty, variantSku)
  }

  const clearCart = () => setCart(null)

  const value = useMemo(
    () => ({
      cart,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [cart, loading]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (ctx === undefined) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
