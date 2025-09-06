import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import Home from './public/Home'
import Cart from './public/Cart'
import Login from './public/Login'
import Register from './public/Register'
import Products from './public/Products'
import ProductDetails from './public/ProductDetails'
import NotFound from './public/NotFound'

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: '/', element: <Home />
            },
            {
                path: '/cart', element: <Cart />
            },
            {
                path: '/login', element: <Login />
            },
            {
                path: '/sign-up', element: <Register />
            },
            {
                path: '/products', element: <Products />
            },
            {
                path: '/products/:id', element: <ProductDetails />
            },
            {
                path: '*', element: <NotFound />
            }
        ]
    }])

export default router
