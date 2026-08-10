import { useState } from 'react'

// Customer login — mobile number only
export default function CustomerLogin({ onLogin, onBack }) {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('mobile') // 'mobile' | 'otp'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = () => {
    if (mobile.length !== 10 || isNaN(mobile)) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setLoading(true)
    // Simulate OTP send
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
    }, 1000)
  }

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP')
      return
    }
    setError('')
    setLoading(true)
    // Simulate OTP verify — accept any 6-digit code for demo
    setTimeout(() => {
      setLoading(false)
      onLogin({ mobile })
    }, 1000)
  }

  return (
    <div
      className="h-full w-full flex flex-col px-6 pt-10 pb-8"
      style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)' }}
    >
      {/* Header */}
      <button onClick={onBack} className="text-white/50 text-sm mb-6 text-left">
        ← Back
      </button>

      <div className="mb-8">
        <span className="text-4xl">👤</span>
        <h2 className="text-white text-2xl font-bold mt-3">Customer Login</h2>
        <p className="text-white/50 text-sm mt-1">
          {step === 'mobile' ? 'Enter your mobile number to continue' : `OTP sent to +91 ${mobile}`}
        </p>
      </div>

      {step === 'mobile' ? (
        <>
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 gap-3 mb-3">
            <span className="text-white/60 font-medium">+91</span>
            <div className="w-px h-6 bg-white/20" />
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="Mobile Number"
              className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-base"
            />
          </div>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-base mt-2 active:scale-95 transition-transform disabled:opacity-60"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-3 gap-3 mb-3">
            <input
              type="tel"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-base tracking-widest text-center text-xl"
            />
          </div>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-base mt-2 active:scale-95 transition-transform disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button
            onClick={() => { setStep('mobile'); setOtp(''); setError('') }}
            className="text-white/40 text-sm mt-4 text-center w-full"
          >
            Change number
          </button>
        </>
      )}

      <p className="text-white/25 text-xs text-center mt-auto">
        Demo: any 6-digit OTP works
      </p>
    </div>
  )
}
