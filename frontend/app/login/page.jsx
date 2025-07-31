'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post('http://localhost:1337/api/auth/local', {
        identifier: email,
        password: password,
      })

      const { jwt, user } = res.data

      localStorage.setItem('token', jwt)
      localStorage.setItem('user', JSON.stringify(user))

      router.push('/')
    } catch (err) {
      console.error(err)
      setError('Invalid email or password')
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f3f4f6',
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '1rem',
            padding: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            outline: 'none',
            fontSize: '1rem',
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '1.5rem',
            padding: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            outline: 'none',
            fontSize: '1rem',
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0059c1'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#0070f3'}
        >
          Login
        </button>

        {error && <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  )
}
