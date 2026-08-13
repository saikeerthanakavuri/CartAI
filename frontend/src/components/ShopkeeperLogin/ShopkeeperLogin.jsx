import { useState, useEffect } from 'react'

const SHOPKEEPER_EMAIL = 'shopkeeper@gmail.com'
const SHOPKEEPER_PASSWORD = '1234'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const FALLBACK_SUMMARY = {
  revenue: '₹7,770',
  profit: '₹3,108',
  change: '+40% margin',
  alerts: 3,
  topSeller: 'Lays Classic',
}

export default function ShopkeeperLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    if (email !== SHOPKEEPER_EMAIL) { setError('Email not recognised'); return }
    if (password !== SHOPKEEPER_PASSWORD) { setError('Incorrect password'); return }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 1000)
  }

  const inputStyle = {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  }

  return (
    <div className="h-full w-full flex flex-col px-6 pt-6 pb-8 overflow-y-auto" style={{ background: '#f2f2f7' }}>

      {/* Back */}
      <button onClick={onBack} className="text-[#007aff] text-sm font-medium mb-5 text-left active:opacity-60 shrink-0">
        ‹ Back
      </button>

      {/* Header */}
      <div className="mb-5 shrink-0">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center text-3xl mb-4"
          style={{ background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.2)' }}
        >
          🏪
        </div>
        <h2 className="text-black text-2xl font-semibold" style={{ letterSpacing: '-0.4px' }}>
          Shopkeeper Login
        </h2>
        <p className="text-black/40 text-sm mt-1.5 font-light">Sign in with your store account</p>
      </div>

      {/* Login fields */}
      <div className="flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center rounded-[12px] px-4 py-3.5 gap-3" style={inputStyle}>
          <span className="text-black/30 text-sm">✉️</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Gmail address"
            className="flex-1 bg-transparent text-black placeholder-black/25 outline-none text-base font-light"
          />
        </div>

        <div className="flex items-center rounded-[12px] px-4 py-3.5 gap-3" style={inputStyle}>
          <span className="text-black/30 text-sm">🔒</span>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="flex-1 bg-transparent text-black placeholder-black/25 outline-none text-base font-light"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-[#007aff] text-xs font-medium active:opacity-60"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {error && <p className="text-[#ff3b30] text-xs mt-3 pl-1 shrink-0">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3.5 rounded-[12px] text-white font-semibold text-base mt-5 active:scale-[0.98] transition-transform disabled:opacity-50 shrink-0"
        style={{ background: '#34c759' }}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-black/20 text-xs text-center mt-4 font-light shrink-0">
        Demo: shopkeeper@gmail.com / 1234
      </p>
    </div>
  )
}
