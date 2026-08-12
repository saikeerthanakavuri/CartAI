import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Checkout from '../Checkout/Checkout'
import CustomerAI from '../CustomerAI/CustomerAI'

// ── Mock product database ─────────────────────────────────────────
const MOCK_PRODUCTS = [
  { id: 1, name: "Lays Classic",    variant: "Classic Salted · 50g",    price: 20, emoji: "🥔" },
  { id: 2, name: "Coca-Cola",       variant: "Chilled · 330ml Can",     price: 40, emoji: "🥤" },
  { id: 3, name: "Dairy Milk",      variant: "Milk Chocolate · 40g",    price: 30, emoji: "🍫" },
  { id: 4, name: "Maggi Noodles",   variant: "Masala · 70g",            price: 15, emoji: "🍜" },
  { id: 5, name: "Britannia Bread", variant: "Whole Wheat · 400g",      price: 45, emoji: "🍞" },
  { id: 6, name: "Kurkure",         variant: "Masala Munch · 50g",      price: 20, emoji: "🌽" },
  { id: 7, name: "Frooti",          variant: "Mango Drink · 200ml",     price: 15, emoji: "🥭" },
  { id: 8, name: "Hide & Seek",     variant: "Chocolate Cookies · 75g", price: 25, emoji: "🍪" },
  { id: 9, name: "Hajmola",         variant: "Digestive Candy · 20pc",  price: 10, emoji: "🍬" },
  { id: 10, name: "Amul Butter",    variant: "Pasteurised · 100g",      price: 55, emoji: "🧈" },
]

// ── Active offers / deals ────────────────────────────────────────────
const OFFERS = [
  {
    id: 'o1',
    title: 'Combo Deal 🔥',
    description: 'Buy Lays + Coca-Cola together',
    discount: 'Save ₹10',
    tag: 'HOT',
    color: '#ff3b30',
    bg: 'linear-gradient(135deg, #fff1f0 0%, #ffe4e2 100%)',
    border: 'rgba(255,59,48,0.2)',
  },
  {
    id: 'o2',
    title: 'Happy Hours ⚡',
    description: '3 PM – 5 PM · 15% off all Beverages',
    discount: '15% OFF',
    tag: 'TODAY',
    color: '#007aff',
    bg: 'linear-gradient(135deg, #f0f6ff 0%, #ddeeff 100%)',
    border: 'rgba(0,122,255,0.2)',
  },
  {
    id: 'o3',
    title: 'Snack Bundle 🍫',
    description: 'Any 3 Snacks for just ₹55',
    discount: '₹55 Bundle',
    tag: 'LIMITED',
    color: '#ff9500',
    bg: 'linear-gradient(135deg, #fff9f0 0%, #ffefd6 100%)',
    border: 'rgba(255,149,0,0.2)',
  },
  {
    id: 'o4',
    title: 'Fresh Pick 🍞',
    description: 'Bread + Amul Butter combo',
    discount: 'Save ₹15',
    tag: 'FRESH',
    color: '#34c759',
    bg: 'linear-gradient(135deg, #f0fff4 0%, #d6f5e0 100%)',
    border: 'rgba(52,199,89,0.2)',
  },
]

// ── Recommendation map (product id → suggested product id + reason) ─
const RECOMMENDATIONS = {
  1:  { toId: 2,  reason: "🔥 87% of customers buy Coca-Cola with Lays!" },
  2:  { toId: 1,  reason: "🔥 Lays pairs perfectly with Coca-Cola!" },
  3:  { toId: 8,  reason: "🍫 Chocolate lovers also grab Hide & Seek cookies!" },
  4:  { toId: 10, reason: "🧈 Add Amul Butter to make your Maggi creamier!" },
  5:  { toId: 10, reason: "🧈 Amul Butter goes great with Britannia Bread!" },
  6:  { toId: 7,  reason: "🥭 Cool down with Frooti after spicy Kurkure!" },
  7:  { toId: 6,  reason: "🌽 Kurkure is the perfect snack with Frooti!" },
  8:  { toId: 3,  reason: "🍫 Complete the combo — add Dairy Milk!" },
  9:  { toId: 4,  reason: "🍜 Hajmola after Maggi is a classic combo!" },
  10: { toId: 5,  reason: "🍞 Amul Butter tastes best on Britannia Bread!" },
}

// ── Mock AI identify (random product, 1.5s delay) ─────────────────
function mockIdentify() {
  return new Promise(resolve => {
    setTimeout(() => {
      const product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)]
      resolve({ ...product, confidence: (92 + Math.random() * 7).toFixed(1) })
    }, 1500)
  })
}

// ── Helper: get recommendation for a product ─────────────────────
function getRecommendation(productId) {
  const rec = RECOMMENDATIONS[productId]
  if (!rec) return null
  const suggested = MOCK_PRODUCTS.find(p => p.id === rec.toId)
  if (!suggested) return null
  return { ...suggested, reason: rec.reason }
}

export default function Cart({ customer, onLogout }) {
  // Camera
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError,  setCameraError]  = useState('')
  const [captured,     setCaptured]     = useState(null)

  // Identification
  const [identifying, setIdentifying] = useState(false)
  const [identified,  setIdentified]  = useState(null)

  // Recommendation
  const [recommendation, setRecommendation] = useState(null) // shown after add-to-cart
  const recTimerRef = useRef(null)

  // Cart
  const [cartItems,   setCartItems]   = useState([])
  const [showCheckout, setShowCheckout] = useState(false)

  // Offers
  const [claimedOffers, setClaimedOffers] = useState(new Set())

  // Manual select fallback
  const [showManualSelect, setShowManualSelect] = useState(false)

  const claimOffer = useCallback((offerId) => {
    setClaimedOffers(prev => new Set([...prev, offerId]))
  }, [])

  // Manual product selection (fallback when camera doesn't work)
  const selectManualProduct = useCallback((product) => {
    setIdentified({ ...product, confidence: '100.0' })
    setShowManualSelect(false)
  }, [])

  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const card = {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.05)',
  }

  // ── Camera ────────────────────────────────────────────────────
  const openCamera = useCallback(async () => {
    console.log('🎥 Opening camera...')
    setCameraError('')
    setCaptured(null)
    setIdentified(null)
    
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('❌ getUserMedia not supported')
      setCameraError('Camera not supported in this browser. Please use Chrome, Firefox, or Safari.')
      return
    }
    
    try {
      console.log('📱 Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      console.log('✅ Camera access granted!', stream.getTracks())
      streamRef.current = stream
      setCameraActive(true)
      requestAnimationFrame(() => {
        if (videoRef.current) { 
          videoRef.current.srcObject = stream
          videoRef.current.play()
            .then(() => console.log('✅ Video playing'))
            .catch(err => console.error('❌ Video play error:', err))
        }
      })
    } catch (err) {
      console.error('❌ Camera error:', err)
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Click the camera icon in the address bar and select "Allow".')
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device. Make sure your webcam is connected.')
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application. Close other apps and try again.')
      } else {
        setCameraError('Could not access camera: ' + err.message)
      }
    }
  }, [])

  const closeCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    setCameraActive(false); setCaptured(null); setIdentified(null); setCameraError('')
  }, [])

  const captureFrame = useCallback(() => {
    const video = videoRef.current; const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setCaptured(canvas.toDataURL('image/jpeg', 0.92))
  }, [])

  const retake = useCallback(() => { setCaptured(null); setIdentified(null) }, [])

  // ── Identify ──────────────────────────────────────────────────
  const identifyProduct = useCallback(async () => {
    setIdentifying(true); setIdentified(null)
    const result = await mockIdentify()
    setIdentifying(false); setIdentified(result)
  }, [])

  // ── Cart ──────────────────────────────────────────────────────
  const addToCart = useCallback((product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }]
    })

    // Show recommendation if one exists for this product
    const rec = getRecommendation(product.id)
    if (rec) {
      setRecommendation(rec)
      // Auto-dismiss after 8 seconds
      clearTimeout(recTimerRef.current)
      recTimerRef.current = setTimeout(() => setRecommendation(null), 8000)
    }

    closeCamera()
  }, [closeCamera])

  const dismissRec = useCallback(() => {
    clearTimeout(recTimerRef.current)
    setRecommendation(null)
  }, [])

  const addRecToCart = useCallback((product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }]
    })
    dismissRec()
  }, [dismissRec])

  const addQty = useCallback((id) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i))
  }, [])

  const removeFromCart = useCallback((id, mode = 'remove') => {
    setCartItems(prev => {
      if (mode === 'dec') {
        const item = prev.find(i => i.id === id)
        if (item && item.qty > 1) return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
      }
      return prev.filter(i => i.id !== id)
    })
  }, [])

  const handleCheckout = useCallback(() => setShowCheckout(true), [])
  const handleDone     = useCallback(() => {
    setCartItems([])
    setShowCheckout(false)
    closeCamera()
  }, [closeCamera])

  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0)

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      clearTimeout(recTimerRef.current)
    }
  }, [])

  return (
    <div className="relative h-full w-full flex flex-col px-5 pt-5 pb-5" style={{ background: '#f2f2f7' }}>

      {/* ── Checkout screen overlay ── */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            className="absolute inset-0 z-50"
            style={{ background: '#f2f2f7' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <Checkout cartItems={cartItems} customer={customer} onDone={handleDone} onBack={() => setShowCheckout(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-black/40 text-xs font-light">Welcome back</p>
          <h2 className="text-black font-semibold text-base mt-0.5" style={{ letterSpacing: '-0.2px' }}>
            +91 {customer?.mobile}
          </h2>
        </div>
        <button
          onClick={() => { closeCamera(); onLogout() }}
          className="text-[#ff3b30] text-sm font-medium px-3.5 py-1.5 rounded-full active:opacity-70"
          style={{ background: 'rgba(255,59,48,0.1)' }}
        >
          Sign Out
        </button>
      </div>

      {/* ── AI Recommendation Banner ── */}
      <AnimatePresence>
        {recommendation && (
          <motion.div
            className="mb-3 p-3 rounded-[16px] flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%)',
              border: '1px solid rgba(255,149,0,0.25)',
              boxShadow: '0 2px 12px rgba(255,149,0,0.12)',
            }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
          {/* Sparkle icon */}
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'rgba(255,149,0,0.15)' }}
          >
            ✨
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#ff9500' }}>
              AI Recommendation
            </p>
            <p className="text-black/70 text-xs font-light leading-snug mt-0.5">
              {recommendation.reason}
            </p>
            {/* Suggested product pill */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-sm">{recommendation.emoji}</span>
              <span className="text-black font-medium text-xs">{recommendation.name}</span>
              <span className="text-black/40 text-[10px]">· ₹{recommendation.price}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={() => addRecToCart(recommendation)}
              className="px-3 py-1.5 rounded-[8px] text-white text-[11px] font-semibold active:scale-95 transition-transform"
              style={{ background: '#ff9500' }}
            >
              + Add
            </button>
            <button
              onClick={dismissRec}
              className="px-3 py-1 rounded-[8px] text-[11px] font-medium active:opacity-60"
              style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.4)' }}
            >
              Skip
            </button>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* ── Camera / Scan area ── */}
      <div className="flex-1 flex flex-col mb-4 overflow-hidden" style={{ ...card, borderRadius: 20 }}>

        {/* Idle */}
        {!cameraActive && !captured && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
            <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
              <span className="text-[56px]">📷</span>
              {[
                { top: 0,    left:  0, borderTop:    '2.5px solid #007aff', borderLeft:  '2.5px solid #007aff' },
                { top: 0,    right: 0, borderTop:    '2.5px solid #007aff', borderRight: '2.5px solid #007aff' },
                { bottom: 0, left:  0, borderBottom: '2.5px solid #007aff', borderLeft:  '2.5px solid #007aff' },
                { bottom: 0, right: 0, borderBottom: '2.5px solid #007aff', borderRight: '2.5px solid #007aff' },
              ].map((s, i) => (
                <div key={i} className="absolute" style={{ ...s, width: 20, height: 20, borderRadius: 3 }} />
              ))}
            </div>
            <p className="text-black font-semibold text-base" style={{ letterSpacing: '-0.2px' }}>Scan a Product</p>
            <p className="text-black/35 text-xs text-center font-light leading-relaxed">
              Point your camera at any product to identify it and add to cart
            </p>
            {cameraError && (
              <p className="text-[#ff3b30] text-xs text-center px-2 leading-relaxed mb-2">{cameraError}</p>
            )}
            <div className="flex gap-2 items-center">
              <button
                onClick={openCamera}
                className="flex-1 px-7 py-2.5 rounded-[10px] text-white text-sm font-semibold active:scale-95 transition-transform"
                style={{ background: '#007aff' }}
              >
                Open Camera
              </button>
              <button
                onClick={() => setShowManualSelect(true)}
                className="px-4 py-2.5 rounded-[10px] text-sm font-semibold active:scale-95 transition-transform"
                style={{ background: '#f2f2f7', color: '#007aff' }}
                title="Select product manually (camera not working?)"
              >
                ⚡ Quick Pick
              </button>
            </div>
            <p className="text-black/25 text-[10px] text-center mt-2 font-light">
              Camera not working? Use Quick Pick
            </p>
          </div>
        )}

        {/* Manual product selector */}
        {showManualSelect && !cameraActive && !captured && (
          <div className="flex-1 flex flex-col overflow-y-auto p-4" style={{ borderRadius: 20 }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-black font-semibold text-sm">Quick Pick Product</p>
              <button
                onClick={() => setShowManualSelect(false)}
                className="text-black/40 text-xs font-medium"
              >
                ✕ Cancel
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {MOCK_PRODUCTS.map(product => (
                <button
                  key={product.id}
                  onClick={() => selectManualProduct(product)}
                  className="flex items-center gap-3 p-3 rounded-[12px] active:scale-98 transition-transform text-left"
                  style={{ background: '#f2f2f7', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div className="w-12 h-12 rounded-[10px] flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'rgba(0,122,255,0.08)' }}>
                    {product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-black font-semibold text-sm leading-tight">{product.name}</p>
                    <p className="text-black/40 text-[10px] mt-0.5 font-light">{product.variant}</p>
                  </div>
                  <p className="text-[#007aff] font-bold text-sm">₹{product.price}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live feed */}
        {cameraActive && !captured && (
          <div className="flex-1 flex flex-col relative overflow-hidden" style={{ borderRadius: 20 }}>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ borderRadius: 20 }} />
            {/* Corner overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative" style={{ width: 180, height: 180 }}>
                {[
                  { top: 0,    left:  0, borderTop:    '3px solid #fff', borderLeft:  '3px solid #fff' },
                  { top: 0,    right: 0, borderTop:    '3px solid #fff', borderRight: '3px solid #fff' },
                  { bottom: 0, left:  0, borderBottom: '3px solid #fff', borderLeft:  '3px solid #fff' },
                  { bottom: 0, right: 0, borderBottom: '3px solid #fff', borderRight: '3px solid #fff' },
                ].map((s, i) => (
                  <div key={i} className="absolute" style={{ ...s, width: 28, height: 28, borderRadius: 4 }} />
                ))}
                {/* Animated sweep line */}
                <div
                  className="scan-line absolute left-0 right-0"
                  style={{
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #007aff, #00d4ff, #007aff, transparent)',
                    boxShadow: '0 0 8px 2px rgba(0,122,255,0.6)',
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-3"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)' }}>
              <span className="text-white text-xs font-medium opacity-80">Point at a product</span>
              <button onClick={closeCamera} className="text-white text-xs font-semibold px-2.5 py-1 rounded-full active:opacity-60"
                style={{ background: 'rgba(255,255,255,0.2)' }}>✕ Close</button>
            </div>
            {/* Shutter */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-5 pt-3"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}>
              <button onClick={captureFrame} className="active:scale-90 transition-transform"
                style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', border: '4px solid rgba(255,255,255,0.5)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }} />
            </div>
          </div>
        )}

        {/* Snapshot + identification */}
        {captured && (
          <div className="flex-1 flex flex-col relative overflow-hidden" style={{ borderRadius: 20 }}>
            <div className={`relative overflow-hidden transition-all duration-300 ${identified ? 'h-32' : 'flex-1'}`}
              style={{ borderRadius: identified ? '20px 20px 0 0' : 20 }}>
              <img src={captured} alt="Captured" className="w-full h-full object-cover" />
              {!identified && !identifying && (
                <div className="absolute bottom-0 left-0 right-0 flex gap-3 justify-center pb-5 pt-3 px-6"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}>
                  <button onClick={retake}
                    className="flex-1 py-2.5 rounded-[10px] text-white text-sm font-semibold active:scale-95 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    Retake
                  </button>
                  <button onClick={identifyProduct}
                    className="flex-1 py-2.5 rounded-[10px] text-white text-sm font-semibold active:scale-95 transition-transform"
                    style={{ background: '#007aff' }}>
                    Identify Product
                  </button>
                </div>
              )}
              {identifying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  style={{ background: 'rgba(0,0,0,0.55)' }}>
                  <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                  <p className="text-white text-sm font-medium">Identifying product…</p>
                </div>
              )}
            </div>

            {/* Product result */}
            {identified && (
              <motion.div
                className="flex flex-col gap-3 p-4 flex-1"
                style={{ background: '#fff' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-black/40 text-xs font-light">Product identified</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(52,199,89,0.12)', color: '#34c759' }}>
                    ✓ {identified.confidence}% match
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: 'rgba(0,122,255,0.08)' }}>
                    {identified.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-black font-semibold text-base leading-tight" style={{ letterSpacing: '-0.2px' }}>
                      {identified.name}
                    </p>
                    <p className="text-black/40 text-xs mt-0.5 font-light">{identified.variant}</p>
                    <p className="text-[#007aff] font-bold text-lg mt-1">₹{identified.price}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={retake}
                    className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold active:scale-95 transition-transform"
                    style={{ background: '#f2f2f7', color: 'rgba(0,0,0,0.6)' }}>
                    Scan Again
                  </button>
                  <button onClick={() => addToCart(identified)}
                    className="flex-1 py-2.5 rounded-[10px] text-white text-sm font-semibold active:scale-95 transition-transform"
                    style={{ background: '#34c759' }}>
                    + Add to Cart
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Offers strip ── */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-black font-semibold text-sm">🎁 Offers for You</span>
          <span className="text-xs font-medium" style={{ color: '#007aff' }}>
            {OFFERS.length - claimedOffers.size} active
          </span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {OFFERS.map(offer => {
            const claimed = claimedOffers.has(offer.id)
            return (
              <motion.div
                key={offer.id}
                className="flex-shrink-0 rounded-[14px] p-3 flex flex-col justify-between"
                style={{
                  width: 148,
                  minHeight: 102,
                  background: claimed ? '#f2f2f7' : offer.bg,
                  border: `1px solid ${claimed ? 'rgba(0,0,0,0.07)' : offer.border}`,
                  opacity: claimed ? 0.6 : 1,
                  boxShadow: claimed ? 'none' : '0 2px 10px rgba(0,0,0,0.06)',
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: claimed ? 0.6 : 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                {/* Top row — tag + discount badge */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: claimed ? 'rgba(0,0,0,0.06)' : `${offer.color}1a`,
                      color: claimed ? 'rgba(0,0,0,0.3)' : offer.color,
                      letterSpacing: '0.4px',
                    }}
                  >
                    {claimed ? 'CLAIMED' : offer.tag}
                  </span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: claimed ? 'rgba(0,0,0,0.3)' : offer.color }}
                  >
                    {offer.discount}
                  </span>
                </div>

                {/* Title */}
                <p
                  className="text-[11px] font-semibold leading-tight"
                  style={{ color: claimed ? 'rgba(0,0,0,0.35)' : '#1c1c1e' }}
                >
                  {offer.title}
                </p>

                {/* Description */}
                <p
                  className="text-[10px] font-light leading-snug mt-0.5 flex-1"
                  style={{ color: claimed ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.5)' }}
                >
                  {offer.description}
                </p>

                {/* Claim button */}
                <button
                  onClick={() => !claimed && claimOffer(offer.id)}
                  disabled={claimed}
                  className="mt-2 w-full py-1 rounded-[7px] text-[10px] font-semibold transition-all active:scale-95"
                  style={{
                    background: claimed
                      ? 'rgba(0,0,0,0.05)'
                      : offer.color,
                    color: claimed ? 'rgba(0,0,0,0.3)' : '#fff',
                    cursor: claimed ? 'default' : 'pointer',
                  }}
                >
                  {claimed ? '✓ Claimed' : 'Claim Offer'}
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Cart summary ── */}
      <div className="p-4" style={card}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-black font-semibold text-sm">Cart</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.4)' }}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-black/25 text-xs font-light mb-3">No items yet. Scan a product to start.</p>
        ) : (
          <>
            {/* Scrollable items list — max 3 rows visible before scroll kicks in */}
            <div className="flex flex-col gap-2 mb-2 overflow-y-auto" style={{ maxHeight: 96 }}>
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between flex-shrink-0">
                  {/* Product info */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">{item.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-black text-xs font-medium truncate">{item.name}</p>
                      <p className="text-black/40 text-[10px] font-light">₹{item.price} each</p>
                    </div>
                  </div>

                  {/* Right side: qty controls + line total */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {/* Line total */}
                    <span className="text-black font-semibold text-xs w-8 text-right">
                      ₹{item.price * item.qty}
                    </span>

                    {/* +/- stepper */}
                    <div
                      className="flex items-center rounded-[8px] overflow-hidden"
                      style={{ border: '1px solid rgba(0,0,0,0.1)', background: '#f2f2f7' }}
                    >
                      <button
                        onClick={() => removeFromCart(item.id, 'dec')}
                        className="w-6 h-6 flex items-center justify-center text-sm font-semibold active:bg-black/10 transition-colors"
                        style={{ color: item.qty === 1 ? '#ff3b30' : '#007aff' }}
                      >
                        {item.qty === 1 ? '🗑' : '−'}
                      </button>
                      <span
                        className="w-5 text-center text-xs font-semibold"
                        style={{ color: '#1c1c1e' }}
                      >
                        {item.qty}
                      </span>
                      <button
                        onClick={() => addQty(item.id)}
                        className="w-6 h-6 flex items-center justify-center text-sm font-semibold active:bg-black/10 transition-colors"
                        style={{ color: '#007aff' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Total — always visible, outside scroll */}
            <div className="border-t pt-2 mb-3 flex justify-between items-center" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <span className="text-black/50 text-xs font-light">Total</span>
              <span className="text-black font-bold text-sm">₹{totalPrice}</span>
            </div>
          </>
        )}

        <button
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
          className="w-full py-3 rounded-[10px] text-white font-semibold text-sm transition-opacity"
          style={{ background: '#007aff', opacity: cartItems.length === 0 ? 0.3 : 1, cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          Checkout &amp; Get QR Code
        </button>
      </div>

      {/* ── Customer AI Assistant ── */}
      <CustomerAI cartItems={cartItems} />
    </div>
  )
}
