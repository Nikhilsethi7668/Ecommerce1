import React from 'react'
import { Outlet } from 'react-router-dom'
import AstrapeHeader from './components/Navbar'

const Layout = () => {
    return (
        <div className='bg-gray-100'>
            <AstrapeHeader />
            <Outlet />
        </div>
    )
}

export default Layout
