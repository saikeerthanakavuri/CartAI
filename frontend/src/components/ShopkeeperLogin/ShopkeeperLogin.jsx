import { useState } from 'react'

const SHOPKEEPER_EMAIL = 'shopkeeper@gmail.com'
const SHOPKEEPER_PASSWORD = 'cartai@2024'

export default function ShopkeeperLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    if (email !== SHOPKEEPER_EMAIL) {
      setError('Email not recognised')
      return
    }
    if (password !== SHOPKEEPER_PASSWORD) {
      setError('Incorrect password')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 1000)
  }

  return (
    <div
      className="h-full w-full flex flex-col px-6 pt-10 pb-8"
      style={{ background: 'linear-gradient(160deg, #0d2e1a 0%, #064e3b 100%)' }}
    >
      {/* Header */}
      <button onClick={onBack} className="text-white/50 text-sm mb-6 text-left">
        ← Back
      </button>

      <div className="mb-8">
        <span className="text-4xl">🏪</span>
        <h2 className="text-white text-2xl font-bold mt-3">Shopkeeper Login</h2>
        <p className="text-white/50 text-sm mt-1">Sign in with your store Gmail account</p>
      </div>

      {/* Email */}
      <div className="bg-white/10 rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
        <span className="text-white/50">✉️</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Gmail address"
          className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-base"
        />
      </div>

      {/* Password */}
      <div className="bg-white/10 rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
        <span className="text-white/50">🔒</span>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-base"
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="text-white/40 text-xs"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-base mt-2 active:scale-95 transition-transform disabled:opacity-60"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className="text-white/25 text-xs text-center mt-auto">
        Demo credentials: shopkeeper@gmail.com / cartai@2024
      </p>
    </div>
  )
}
