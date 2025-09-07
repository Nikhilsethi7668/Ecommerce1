"use client"

import axiosInstance from "@/lib/axios-instance"
import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
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

  const validateSession = async (authToken) => {
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

  const login = async (identifier, password) => {
    try {
      const { data } = await axiosInstance.post("/api/auth/login", {
        email: identifier,
        password
      });

      if (data.success) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem("auth_token", data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.response?.data?.message || "Network error occurred" }
    }
  }

  const signup = async (userData) => {
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

  const verify = async (userId, code) => {
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
