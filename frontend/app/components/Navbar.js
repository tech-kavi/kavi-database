'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import './styles/Navbar.css'
import { useAuth } from "../components/AuthProvider"
import Image from 'next/image';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const toggleMenu = () => setOpen(!open)

  const handleLogout = () => {
    setOpen(false)   // close menu on logout
    logout()         // update context & redirect
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
            width={120}   // adjust as needed
            height={40}   // adjust as needed
            priority      // ensures it loads quickly
          />
        </Link>
      </div>

        <button className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`navbar-links ${open ? 'open' : ''}`}>
          {user ? (
            <>
              <Link href="/" className={isActive('/')}>Home</Link>
              <Link href="/upload" className={isActive('/upload')}>Upload</Link>
              <Link href="/companies" className={isActive('/companies')}>Companies</Link>
              <Link href="/experts" className={isActive('/experts')}>Experts</Link>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link href="/login" className={isActive('/login')}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
