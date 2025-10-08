'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Popup from '../components/Popup'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

   // Forgot password popup
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState(null)
  const [forgotErr, setForgotErr] = useState(null)

  useEffect(() => {
        document.title = `KAVI | Login`;
     }, []);

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/magic-tokens`, {
        email: email.trim(),
        password: password.trim(),
      })

      console.log(res);
      alert(res.data.message);
      
    } catch (err) {
      console.error(err)
      setError('Invalid email or password')
    }
  }

    const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
        email: forgotEmail.trim(),
      })
      setForgotMsg('Password reset email sent! Please check your inbox.')
      setForgotErr(null)
    } catch (err) {
      console.error(err)
      setForgotErr('Failed to send reset email')
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

         <p className="text-center mt-4">
          <span
            onClick={() => setShowForgot(true)}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Forgot Password?
          </span>
        </p>
      

        {error && <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
      </form>

       {/* Forgot Password Popup */}
      <Popup show={showForgot} onClose={() => setShowForgot(false)} title="Reset Password">
        <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Enter your email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>
        {forgotMsg && <p className="text-green-600 mt-3">{forgotMsg}</p>}
        {forgotErr && <p className="text-red-500 mt-3">{forgotErr}</p>}
      </Popup>

    </div>
  )
}
