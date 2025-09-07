"use client"

import axiosInstance from "@/lib/axios-instance"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  phone: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<{
    success: boolean
    error?: string
    userId?: string
  }>
  verify: (userId: string, code: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem("auth_token")
    if (storedToken) {
      setToken(storedToken)
      validateSession(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const validateSession = async (authToken: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token invalid, clear it
        localStorage.removeItem("auth_token")
        setToken(null)
      }
    } catch (error) {
      console.error("Session validation failed:", error)
      localStorage.removeItem("auth_token")
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (identifier: string, password: string) => {
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email: identifier,
        password
      })

      const data = await response.data

      if (data.success) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem("auth_token", data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const signup = async (userData: { name: string; email: string; phone: string; password: string }) => {
    try {
      const response = await axiosInstance.post("/api/auth/signup", userData)

      const data = await response.data

      if (data.success) {
        return { success: true, userId: data.userId }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const verify = async (userId: string, code: string) => {
    try {
      const response = await axiosInstance.post("/api/auth/verify", {
      userId, code
      })

      const data = await response.data

      if (data.success) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem("auth_token", data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        verify,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
