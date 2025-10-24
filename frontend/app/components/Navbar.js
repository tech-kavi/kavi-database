'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from "../components/AuthProvider"
import Image from 'next/image'

export default function Navbar() {
  const { user, logout, loading } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const toggleMenu = () => setOpen(!open)

  const handleLogout = () => {
    setOpen(false)
    logout()
  }

  const isActive = (href) =>
    pathname === href ? 'text-blue-600 font-bold' : 'text-gray-800 font-medium'

  return (
    <nav className="bg-white border-b border-gray-300 sticky top-0 z-50">
      <div className="w-full mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image src="/logo.png" alt="KAVI Logo" width={120} height={40} priority />
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
          onClick={toggleMenu}
        >
          <span className="w-6 h-0.5 bg-gray-800"></span>
          <span className="w-6 h-0.5 bg-gray-800"></span>
          <span className="w-6 h-0.5 bg-gray-800"></span>
        </button>

        {/* Nav Links */}
        <div
          className={`flex-col md:flex-row md:flex items-center gap-4 absolute md:static bg-white md:bg-transparent top-14 left-0 right-0 md:top-auto md:left-auto md:right-auto px-6 py-4 md:p-0 transition-all ${
            open ? 'flex' : 'hidden'
          }`}
        >
          {!loading &&
            (user ? (
              <>
                <Link href="/" className={isActive('/')}>
                  Home
                </Link>
                <Link href="/upload" className={isActive('/upload')}>
                  Upload
                </Link>
                <Link href="/companies" className={isActive('/companies')}>
                  Companies
                </Link>
                <Link href="/experts" className={isActive('/experts')}>
                  Experts
                </Link>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md ml-0 md:ml-4 transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className={isActive('/login')}>
                Login
              </Link>
            ))}
        </div>
      </div>
    </nav>
  )
}
