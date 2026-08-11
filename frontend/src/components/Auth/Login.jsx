import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, signup, loginWithGoogle } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#f2f2f7' }}>
      <div className="w-full max-w-sm px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">CartAI</h1>
          <p className="text-black/50 text-sm">Smart Store Management</p>
        </div>

        {/* Card */}
        <div
          className="rounded-[24px] p-6 mb-4"
          style={{
            background: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {/* Title */}
          <h2 className="text-black font-semibold text-lg mb-1">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-black/50 text-xs mb-6">
            {isLogin ? 'Sign in to your store' : 'Set up your store account'}
          </p>

          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-[12px] mb-4 text-xs"
              style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30' }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
            <div>
              <label className="text-black/40 text-[10px] font-medium block mb-1">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shopkeeper@example.com"
                className="w-full p-3 rounded-[12px] text-sm outline-none"
                style={{ background: '#f2f2f7', border: '1px solid rgba(0,0,0,0.08)' }}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-black/40 text-[10px] font-medium block mb-1">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-[12px] text-sm outline-none"
                style={{ background: '#f2f2f7', border: '1px solid rgba(0,0,0,0.08)' }}
                required
                disabled={loading}
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[12px] text-white font-semibold text-sm transition-all active:scale-98"
              style={{ background: loading ? 'rgba(0,122,255,0.5)' : '#007aff' }}
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
            <p className="text-black/40 text-xs">or</p>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 rounded-[12px] font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: '#f2f2f7',
              color: '#000',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <span className="text-lg">🔷</span>
            Continue with Google
          </button>

          {/* Toggle */}
          <p className="text-center text-black/50 text-xs mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#007aff] font-medium active:opacity-70"
              disabled={loading}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Info */}
        <p className="text-center text-black/40 text-[10px]">
          Each store account is separate and secure
        </p>
      </div>
    </div>
  )
}
