import { useState } from 'react'

const DEMO_MOBILE = '1234567890'

export default function CustomerLogin({ onLogin, onBack }) {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('mobile')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [showOtpMessage, setShowOtpMessage] = useState(false)

  const handleSendOtp = () => {
    if (mobile !== DEMO_MOBILE) {
      setError(`Use the demo customer number: ${DEMO_MOBILE}`)
      return
    }
    setError('')
    setLoading(true)
    const nextOtp = String(Math.floor(100000 + Math.random() * 900000))
    setTimeout(() => {
      setGeneratedOtp(nextOtp)
      setLoading(false)
      setStep('otp')
      setShowOtpMessage(true)
    }, 600)
  }

  const handleVerifyOtp = () => {
    if (otp !== generatedOtp) {
      setError('That OTP does not match the message. Try again.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin({ mobile }) }, 1000)
  }

  const inputStyle = {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  }

  return (
    <div className="relative h-full w-full flex flex-col px-6 pt-6 pb-8" style={{ background: '#f2f2f7' }}>

      {/* Back */}
      <button onClick={onBack} className="text-[#007aff] text-sm font-medium mb-6 text-left active:opacity-60">
        ‹ Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center text-3xl mb-4"
          style={{ background: 'rgba(0,122,255,0.1)', border: '1px solid rgba(0,122,255,0.15)' }}
        >
          👤
        </div>
        <h2 className="text-black text-2xl font-semibold" style={{ letterSpacing: '-0.4px' }}>
          Customer Login
        </h2>
        <p className="text-black/40 text-sm mt-1.5 font-light">
          {step === 'mobile' ? 'Enter your mobile number to continue' : `OTP notification sent to +91 ${mobile}`}
        </p>
      </div>

      {step === 'mobile' ? (
        <>
          <div className="flex items-center rounded-[12px] px-4 py-3.5 gap-3 mb-2" style={inputStyle}>
            <span className="text-black/40 font-medium text-sm" style={{ minWidth: 28 }}>+91</span>
            <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.1)' }} />
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="Mobile Number"
              className="flex-1 bg-transparent text-black placeholder-black/25 outline-none text-base font-light"
            />
          </div>
          {error && <p className="text-[#ff3b30] text-xs mb-3 pl-1">{error}</p>}
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full py-3.5 rounded-[12px] text-white font-semibold text-base mt-3 active:scale-[0.98] transition-transform disabled:opacity-50"
            style={{ background: '#007aff' }}
          >
            {loading ? 'Sending…' : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center rounded-[12px] px-4 py-3.5 mb-2" style={inputStyle}>
            <input
              type="tel"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="_ _ _ _ _ _"
              className="flex-1 bg-transparent text-black placeholder-black/20 outline-none text-2xl tracking-[0.35em] text-center font-light"
            />
          </div>
          {error && <p className="text-[#ff3b30] text-xs mb-3 pl-1">{error}</p>}
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full py-3.5 rounded-[12px] text-white font-semibold text-base mt-3 active:scale-[0.98] transition-transform disabled:opacity-50"
            style={{ background: '#007aff' }}
          >
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </button>
          <button
            onClick={() => { setStep('mobile'); setOtp(''); setGeneratedOtp(''); setError('') }}
            className="text-[#007aff] text-sm font-medium mt-4 text-center w-full active:opacity-60"
          >
            Change number
          </button>
          <button
            onClick={() => setShowOtpMessage(true)}
            className="text-[#007aff] text-xs font-medium mt-3 text-center w-full active:opacity-60"
          >
            View OTP notification
          </button>
        </>
      )}

      <p className="text-black/20 text-xs text-center mt-auto font-light">
        Demo login: use {DEMO_MOBILE}.
      </p>

      {showOtpMessage && (
        <div className="absolute top-2 left-4 right-4 z-20 animate-slide-down">
          <div
            className="rounded-[18px] p-3 flex items-start gap-3 shadow-2xl backdrop-blur-xl"
            style={{ background: 'rgba(255,255,255,0.96)', border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0" style={{ background: '#34c759' }}>💬</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-black font-semibold text-xs">Messages</p>
                <p className="text-black/40 text-[10px]">now</p>
              </div>
              <p className="text-black/60 text-[11px] font-medium mb-0.5">CartAI</p>
              <p className="text-black text-xs leading-snug">Your verification OTP is <span className="font-bold tracking-wider">{generatedOtp}</span>. Do not share it.</p>
            </div>
            <button onClick={() => setShowOtpMessage(false)} className="text-black/40 text-sm leading-none">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
