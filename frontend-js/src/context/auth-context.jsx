"use client";

import axiosInstance from "@/lib/axios-instance";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const ranOnce = useRef(false);
  const inFlight = useRef(false);

  const validateSession = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await axiosInstance.get("/api/auth/me", {
        validateStatus: () => true,
      });

      if (res.status === 200 && res.data?.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    validateSession();
  }, [validateSession]);

  const login = async (identifier, password) => {
    try {
      const { data } = await axiosInstance.post("/api/auth/login", {
        email: identifier,
        password,
      });
      if (data?.success) {
        setUser(data.user ?? null);
        return { success: true };
      }
      return { success: false, error: data?.message || "Login failed" };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Network error occurred" };
    }
  };

  const signup = async (userData) => {
    try {
      const { data } = await axiosInstance.post("/api/auth/signup", userData);
      if (data?.user) {
        setUser(data.user);
        return { success: true, userId: data.user.id };
      }
      return { success: false, error: data?.message || "Signup failed" };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Network error occurred" };
    }
  };

  const addAddress = async (payload) => {
    try {
      const { data } = await axiosInstance.post("/api/auth/add-address", payload);
      if (data?.addresses) return { success: true, addresses: data.addresses };
      return { success: false, error: data?.message || "Add address failed" };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Network error occurred" };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout", {});
    } catch { }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        addAddress,
        logout,
        refresh: validateSession, // safe to call; guarded by inFlight
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
