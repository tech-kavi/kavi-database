// components/NavBarWrapper.tsx or .jsx
'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'

export default function NavBarWrapper() {
  const pathname = usePathname()
  // const [showNavbar, setShowNavbar] = useState(false)

  // useEffect(() => {
  //   // Delay setting navbar visibility until client-side to avoid SSR mismatch
  //   if (pathname !== '/login') {
  //     setShowNavbar(true)
  //   }
  // }, [pathname])

  // if (!showNavbar) return null

  
  // Only hide navbar on login page
  if (pathname === '/login') return null

  return <Navbar />
}
