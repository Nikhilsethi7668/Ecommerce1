import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import HomePage from '@/pages/Home'
import CartPage from '@/pages/Cart'
import CheckoutPage from '@/pages/Checkout'
import ProductsPage from '@/pages/Products'
import ProductDetailPage from '@/pages/Product'
import OrdersPage from '@/pages/Order'
import OrderDetailPage from '@/pages/OrderDetail'
import ProfilePage from '@/pages/Profile'
import LoginPage from './pages/auth/login/LoginPage'
import SignupPage from './pages/auth/signup/SignupPage'
import { useEffect } from 'react'
import axiosInstance from './lib/axios-instance'
import { useAuth } from './context/auth-context'

function App() {
 
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />

        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </div>
  )
}

export default App
