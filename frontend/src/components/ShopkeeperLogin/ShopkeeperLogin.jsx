import { useState } from 'react'

const SHOPKEEPER_EMAIL = 'shopkeeper@gmail.com'
const SHOPKEEPER_PASSWORD = '1234'

const DAILY_SUMMARY = {
  revenue: '₹4,280',
  change: '+8.4%',
  alerts: 2,
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

      {/* Daily Summary Preview Card */}
      <div
        className="rounded-[16px] p-4 mb-5 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)',
          boxShadow: '0 4px 16px rgba(0,122,255,0.25)',
        }}
      >
        <p className="text-white/60 text-[10px] font-medium tracking-wide mb-2">📊 YESTERDAY'S SUMMARY</p>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white text-2xl font-bold" style={{ letterSpacing: '-0.5px' }}>
              {DAILY_SUMMARY.revenue}
            </p>
            <p className="text-white/60 text-xs mt-0.5">Total Revenue</p>
          </div>
          <span
            className="text-sm font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            {DAILY_SUMMARY.change}
          </span>
        </div>
        <div className="flex gap-3">
          <div
            className="flex-1 rounded-[10px] px-3 py-2 flex items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <span className="text-base">🚨</span>
            <div>
              <p className="text-white text-xs font-semibold">{DAILY_SUMMARY.alerts} Alerts</p>
              <p className="text-white/50 text-[10px]">pending</p>
            </div>
          </div>
          <div
            className="flex-1 rounded-[10px] px-3 py-2 flex items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <span className="text-base">🏆</span>
            <div>
              <p className="text-white text-xs font-semibold truncate">{DAILY_SUMMARY.topSeller}</p>
              <p className="text-white/50 text-[10px]">top seller</p>
            </div>
          </div>
        </div>
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
