import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// jsQR is loaded via CDN-style dynamic import fallback — we use a simple
// canvas-based decode approach with the BarcodeDetector API where available,
// and a visual mock verification fallback for demos without camera.

export default function ExitScanner({ onBack }) {
  const [mode, setMode] = useState('idle') // idle | scanning | verified | failed
  const [result, setResult] = useState(null)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  // Try BarcodeDetector (Chrome/Edge) to scan QR from camera
  const startScan = async () => {
    setCameraError('')
    setMode('scanning')
    setResult(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported. Use Mock Verify below.')
      setMode('idle')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Try BarcodeDetector
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) {
              clearInterval(intervalRef.current)
              stopCamera()
              parseQR(codes[0].rawValue)
            }
          } catch (_) {}
        }, 400)
      } else {
        // BarcodeDetector not available — show hint to use mock
        setCameraError('Live QR decoding not supported in this browser. Use Mock Verify below.')
      }
    } catch (err) {
      setCameraError('Camera error: ' + err.message)
      setMode('idle')
    }
  }

  const stopCamera = () => {
    clearInterval(intervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const parseQR = (raw) => {
    try {
      const data = JSON.parse(raw)
      if (data.receipt && data.total !== undefined) {
        setResult(data)
        setMode('verified')
      } else {
        setMode('failed')
      }
    } catch {
      setMode('failed')
    }
  }

  // Mock verify — simulates scanning the QR from the checkout screen
  const mockVerify = () => {
    stopCamera()
    const mockData = {
      receipt: 'CART-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      mobile: '98765 43210',
      items: [
        { name: 'Lays Classic', qty: 2, price: 30 },
        { name: 'Coca-Cola 2L', qty: 1, price: 70 },
      ],
      total: 130,
      ts: new Date().toLocaleString('en-IN'),
    }
    setResult(mockData)
    setMode('verified')
  }

  const reset = () => {
    stopCamera()
    setMode('idle')
    setResult(null)
    setCameraError('')
  }

  useEffect(() => () => stopCamera(), [])

  return (
    <div className="h-full w-full flex flex-col" style={{ background: '#f2f2f7' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 shrink-0">
        <button
          onClick={() => { stopCamera(); onBack() }}
          className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-60"
          style={{ background: 'rgba(0,0,0,0.06)' }}
        >
          <span className="text-black/60 text-base leading-none" style={{ marginTop: -1 }}>‹</span>
        </button>
        <div>
          <p className="text-black/40 text-xs font-light">Store Exit</p>
          <h2 className="text-black font-semibold text-xl" style={{ letterSpacing: '-0.4px' }}>
            QR Scanner 🚪
          </h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-6 gap-4 overflow-y-auto">

        {/* Scanner viewport */}
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            height: 220,
            borderRadius: 20,
            background: mode === 'scanning' ? '#000' : '#1c1c1e',
          }}
        >
          {mode === 'scanning' && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ borderRadius: 20 }}
            />
          )}

          {/* Corner brackets */}
          {(mode === 'idle' || mode === 'scanning') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative" style={{ width: 140, height: 140 }}>
                {[
                  { top: 0,    left:  0, borderTop:    '3px solid #fff', borderLeft:  '3px solid #fff' },
                  { top: 0,    right: 0, borderTop:    '3px solid #fff', borderRight: '3px solid #fff' },
                  { bottom: 0, left:  0, borderBottom: '3px solid #fff', borderLeft:  '3px solid #fff' },
                  { bottom: 0, right: 0, borderBottom: '3px solid #fff', borderRight: '3px solid #fff' },
                ].map((s, i) => (
                  <div key={i} className="absolute" style={{ ...s, width: 24, height: 24, borderRadius: 3 }} />
                ))}
                {mode === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl opacity-60">📷</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verified overlay */}
          <AnimatePresence>
            {mode === 'verified' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                style={{ background: 'rgba(52,199,89,0.95)', borderRadius: 20 }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <span className="text-6xl">✅</span>
                <p className="text-white font-bold text-xl">Exit Granted</p>
                <p className="text-white/80 text-sm">Receipt verified</p>
              </motion.div>
            )}
            {mode === 'failed' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                style={{ background: 'rgba(255,59,48,0.95)', borderRadius: 20 }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span className="text-6xl">❌</span>
                <p className="text-white font-bold text-xl">Invalid QR</p>
                <p className="text-white/80 text-sm">Please retry</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle label */}
          {mode === 'idle' && (
            <p className="absolute bottom-3 text-white/50 text-xs">Point camera at checkout QR code</p>
          )}

          {cameraError && (
            <p className="absolute bottom-3 left-3 right-3 text-center text-yellow-300 text-[10px] leading-snug">{cameraError}</p>
          )}
        </div>

        {/* Action buttons */}
        {(mode === 'idle' || mode === 'failed') && (
          <div className="flex gap-3">
            <button
              onClick={startScan}
              className="flex-1 py-3 rounded-[14px] text-white font-semibold text-sm active:scale-95 transition-transform"
              style={{ background: '#007aff' }}
            >
              📷 Scan QR
            </button>
            <button
              onClick={mockVerify}
              className="flex-1 py-3 rounded-[14px] font-semibold text-sm active:scale-95 transition-transform"
              style={{ background: '#34c759', color: '#fff' }}
            >
              ✅ Mock Verify
            </button>
          </div>
        )}

        {mode === 'scanning' && (
          <button
            onClick={reset}
            className="w-full py-3 rounded-[14px] font-semibold text-sm active:scale-95 transition-transform"
            style={{ background: '#f2f2f7', color: '#ff3b30' }}
          >
            Cancel
          </button>
        )}

        {mode === 'verified' && result && (
          <motion.div
            className="rounded-[20px] p-4"
            style={{ background: '#fff', border: '1px solid rgba(52,199,89,0.2)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🧾</span>
              <div>
                <p className="text-black font-semibold text-sm">Receipt Verified</p>
                <p className="text-black/40 text-[10px] font-mono">{result.receipt}</p>
              </div>
            </div>

            {result.items && (
              <div className="flex flex-col gap-1.5 mb-3">
                {result.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-black/70">{item.name} ×{item.qty}</span>
                    <span className="text-black font-medium">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            )}

            <div
              className="flex justify-between items-center pt-2"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
            >
              <span className="text-black font-semibold text-sm">Total Paid</span>
              <span className="text-black font-bold text-lg" style={{ letterSpacing: '-0.3px' }}>
                ₹{result.total}
              </span>
            </div>

            <div
              className="mt-3 py-2 px-3 rounded-[10px] text-center text-xs font-medium"
              style={{ background: 'rgba(52,199,89,0.1)', color: '#1d6b34' }}
            >
              🟢 Customer may proceed — Have a great day!
            </div>

            <button
              onClick={reset}
              className="w-full mt-3 py-2.5 rounded-[12px] text-xs font-semibold active:scale-95 transition-transform"
              style={{ background: '#f2f2f7', color: '#007aff' }}
            >
              Scan Next Customer
            </button>
          </motion.div>
        )}

        {/* How it works */}
        {mode === 'idle' && (
          <div
            className="p-4 rounded-[16px]"
            style={{ background: 'rgba(0,122,255,0.06)', border: '1px solid rgba(0,122,255,0.12)' }}
          >
            <p className="text-[#007aff] font-semibold text-xs mb-2">How it works</p>
            <div className="flex flex-col gap-1.5">
              {[
                '1. Customer scans products & checks out',
                '2. QR receipt appears on their screen',
                '3. Store staff scans QR at exit door',
                '4. System verifies purchase instantly',
              ].map((step, i) => (
                <p key={i} className="text-black/60 text-[11px]">{step}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
