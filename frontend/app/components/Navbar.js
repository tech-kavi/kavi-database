'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import './styles/Navbar.css'
import { useAuth } from "../components/AuthProvider"
import Image from 'next/image';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const toggleMenu = () => setOpen(!open)

  const handleLogout = () => {
    setOpen(false)
    logout()
  }

  const isActive = (href) => pathname === href ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="KAVI Logo" 
              width={120}
              height={40}
              priority
            />
          </Link>
        </div>

        <button className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* ✅ Don't show any nav links while auth is loading */}
        <div className={`navbar-links ${open ? 'open' : ''}`}>
          {!loading && (
            user ? (
              <>
                <Link href="/" className={isActive('/')}>Home</Link>
                <Link href="/upload" className={isActive('/upload')}>Upload</Link>
                <Link href="/companies" className={isActive('/companies')}>Companies</Link>
                <Link href="/experts" className={isActive('/experts')}>Experts</Link>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link href="/login" className={isActive('/login')}>Login</Link>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
