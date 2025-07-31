'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' // Add useRouter for redirection
import './styles/Navbar.css'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter() // useRouter hook for redirect
  const [open, setOpen] = useState(false)

  const toggleMenu = () => setOpen(!open)

  const isActive = (href) => pathname === href ? 'active' : ''

  const handleLogout = () => {
    // Clear user session (for example, from localStorage)
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Redirect user to login page after logging out
    router.push('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">Kavi</div>
        <button className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`navbar-links ${open ? 'open' : ''}`}>
          <Link href="/" className={isActive('/')}>Home</Link>
          <Link href="/upload" className={isActive('/upload')}>Upload</Link>
          <Link href="/company" className={isActive('/company')}>Company</Link>
          <Link href="/experts" className={isActive('/experts')}>Experts</Link>
          {/* Logout Button */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
