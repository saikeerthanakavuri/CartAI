import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Checkout from '../Checkout/Checkout'
import CustomerAI from '../CustomerAI/CustomerAI'
import { getOffers } from '../../data/offersStore'
import { getProductReferences, resizeReferenceImage, saveProductReference } from '../../data/productReferenceStore'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const referenceImageCache = new Map()

// ── Emoji map for products from backend ──────────────────────────
const EMOJI_MAP = {
  'lays': '🥔', 'coca-cola': '🥤', 'coke': '🥤', 'cola': '🥤',
  'bread': '🍞', 'maggi': '🍜', 'noodles': '🍜', 'dairy milk': '🍫',
  'chocolate': '🍫', 'parle': '🍪', 'biscuit': '🍪', 'amul milk': '🥛',
  'milk': '🥛', 'kurkure': '🌽', 'frooti': '🥭', 'amul butter': '🧈',
  'butter': '🧈', 'hide & seek': '🍪', 'hajmola': '🍬',
}

function getEmoji(name) {
  const lower = name.toLowerCase()
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji
  }
  return '📦'
}

async function imageSourceToBase64(source) {
  if (source.startsWith('data:image/')) return source.split(',')[1]
  if (referenceImageCache.has(source)) return referenceImageCache.get(source)

  const response = await fetch(source)
  if (!response.ok) throw new Error(`Could not load reference image: ${source}`)
  const blob = await response.blob()
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  referenceImageCache.set(source, base64)
  return base64
}

// Map backend product → cart-compatible shape
function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    variant: p.unit ? `${p.category} · ${p.unit}` : p.category,
    price: p.sell_price,
    emoji: getEmoji(p.name),
    stock: p.stock,
  }
}

function uniquePaidTransactions(transactions) {
  const receipts = new Set()
  return transactions.filter(transaction => {
    if (!transaction.receipt_id || receipts.has(transaction.receipt_id) || Number(transaction.total) <= 0) return false
    receipts.add(transaction.receipt_id)
    return true
  })
}

// Fallback static products if backend is offline
const FALLBACK_PRODUCTS = [
  { id: 1, name: "Lays Classic",     variant: "Classic Salted · 50g",  price: 30, emoji: "🥔", stock: 10 },
  { id: 2, name: "Coca-Cola 2L",     variant: "Beverages · bottles",   price: 70, emoji: "🥤", stock: 10 },
  { id: 3, name: "Bread Loaf",       variant: "Bakery · loaves",       price: 40, emoji: "🍞", stock: 10 },
  { id: 4, name: "Maggi Noodles",    variant: "Masala · 70g",          price: 30, emoji: "🍜", stock: 10 },
  { id: 5, name: "Dairy Milk",       variant: "Milk Chocolate · 40g",  price: 40, emoji: "🍫", stock: 10 },
  { id: 6, name: "Parle-G Biscuits", variant: "Snacks · packs",        price: 15, emoji: "🍪", stock: 10 },
  { id: 7, name: "Amul Milk 1L",     variant: "Dairy · packets",       price: 60, emoji: "🥛", stock: 10 },
  { id: 10, name: "Amul Butter",     variant: "Dairy · 100g",           price: 55, emoji: "🧈", stock: 10 },
]

// ── Active offers / deals — loaded from shared store ────────────────────────────────

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

// The offers banner is part of the checkout flow, not just decoration.  Keep
// the rules here so the discount shown in the cart is also the amount sent to
// the receipt/backend at checkout.
const OFFER_RULES = {
  o1: { products: ['lays', 'coca-cola'], amount: 10, label: 'Lays + Coca-Cola combo' },
  o2: { category: 'beverage', percent: 15, hours: [15, 17], label: 'Happy Hours beverages' },
  o3: { category: 'snack', bundlePrice: 55, bundleSize: 3, label: '3 snack bundle' },
  o4: { products: ['bread', 'butter'], amount: 15, label: 'Bread + Amul Butter combo' },
}

function productMatches(product, term) {
  return product.name.toLowerCase().includes(term)
}

function isCategoryProduct(product, category) {
  const text = `${product.name} ${product.variant || ''}`.toLowerCase()
  if (category === 'beverage') return /beverage|coca-cola|coke|cola|frooti|drink/.test(text)
  return /snack|lays|kurkure|biscuit|hide & seek|chocolate|dairy milk|hajmola/.test(text)
}

function isOfferAvailable(rule) {
  if (!rule?.hours) return true
  const hour = new Date().getHours()
  return hour >= rule.hours[0] && hour < rule.hours[1]
}

function getOfferDiscount(offerId, cartItems) {
  const rule = OFFER_RULES[offerId]
  if (!rule) return 0
  if (!isOfferAvailable(rule)) return 0
  if (rule.amount) {
    const qualifies = rule.products.every(term => cartItems.some(item => productMatches(item, term)))
    return qualifies ? Math.min(rule.amount, cartItems.reduce((total, item) => total + item.price * item.qty, 0)) : 0
  }
  const eligibleTotal = cartItems.reduce((total, item) => (
    isCategoryProduct(item, rule.category) ? total + item.price * item.qty : total
  ), 0)
  if (rule.percent) return Math.min(eligibleTotal, Math.round((eligibleTotal * rule.percent) * 100) / 100)
  if (rule.bundlePrice) {
    const eligibleItems = cartItems.flatMap(item => (
      isCategoryProduct(item, rule.category) ? Array.from({ length: item.qty }, () => item.price) : []
    )).sort((a, b) => b - a)
    const bundledItems = eligibleItems.slice(0, Math.floor(eligibleItems.length / rule.bundleSize) * rule.bundleSize)
    return bundledItems.reduce((total, price, index) => (
      index % rule.bundleSize === 0 ? total + Math.max(0, price + bundledItems[index + 1] + bundledItems[index + 2] - rule.bundlePrice) : total
    ), 0)
  }
  return 0
}

// Ask a vision model to identify the actual package, logo, and product text.
// This deliberately accepts only a product from the current catalogue—Gemini
// cannot invent an item that the cart does not sell.
async function identifyWithVision(imageBase64, products, references = {}) {
  if (!GEMINI_API_KEY) throw new Error('Product recognition is not configured')

  const catalog = products.map(product => ({ id: product.id, name: product.name })).filter(product => product.id != null)
  const imageBase64Data = imageBase64.split(',')[1]
  if (!imageBase64Data) throw new Error('Invalid camera image')

  const model = new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({ model: 'gemini-2.5-flash' })
  // Use one representative image per product. This keeps the live request
  // responsive while still grounding identification in the stored catalogue.
  const referenceParts = (await Promise.all(catalog
    .filter(product => references[product.id]?.length)
    .map(async (product) => {
      const source = references[product.id][0]
      const data = await imageSourceToBase64(source)
      const mimeType = source.includes('.png') ? 'image/png' : source.includes('.webp') ? 'image/webp' : 'image/jpeg'
      return [
        { text: `Reference photo for catalogue product ${product.id}: ${product.name}.` },
        { inlineData: { mimeType, data } },
      ]
    }))).flat()

  const result = await model.generateContent([
    {
      text: `You are a strict retail product scanner. Inspect the package, brand logo, and readable text in the final LIVE CAMERA PHOTO. Reference photos may precede it; use them to compare the exact packaging.\n\nOnly identify an item when the product package itself is clearly visible. Never identify a person, face, background, hand, or an uncertain object.\n\nStore catalogue: ${JSON.stringify(catalog)}\n\nReply with ONLY valid JSON in this exact form:\n{"detected":true,"productId":2,"confidence":0.0}\nIf no catalogue product is clearly visible, reply:\n{"detected":false,"productId":null,"confidence":0.0}`,
    },
    ...referenceParts,
    { text: 'LIVE CAMERA PHOTO:' },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64Data,
      },
    },
  ])

  const text = result.response.text().trim()
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  if (!json) throw new Error('The vision service returned an invalid response')

  const detection = JSON.parse(json)
  const confidence = Number(detection.confidence)
  const product = catalog.find(item => Number(item.id) === Number(detection.productId))
  if (!detection.detected || !product || !Number.isFinite(confidence) || confidence < 0.75) {
    throw new Error('No catalogue product was confidently recognised')
  }

  const cartProduct = products.find(item => Number(item.id) === Number(detection.productId))
  if (!cartProduct) throw new Error('Recognised product is unavailable')

  return { ...cartProduct, confidence: (Math.min(confidence, 1) * 100).toFixed(1) }
}

// ── Helper: get recommendation for a product ─────────────────────
function getRecommendation(productId, products) {
  const rec = RECOMMENDATIONS[productId]
  if (!rec) return null
  const suggested = products.find(p => p.id === rec.toId)
  if (!suggested) return null
  return { ...suggested, reason: rec.reason }
}

function visionErrorMessage(error) {
  const message = String(error?.message || error || '')
  if (/API key not valid|API_KEY_INVALID|invalid api key/i.test(message)) {
    return 'Product recognition is unavailable: the Gemini API key is invalid. Update VITE_GEMINI_API_KEY and restart the dev server.'
  }
  if (/quota|rate limit|429/i.test(message)) {
    return 'Product recognition has reached its Gemini quota. Please try again later or use a key with available quota.'
  }
  if (/network|fetch|failed to fetch/i.test(message)) {
    return 'Product recognition needs an internet connection. Check your network and try again.'
  }
  return 'Could not identify this product. Centre the package/logo and try again.'
}

export default function Cart({ customer, onLogout }) {
  // Products from backend
  const [products, setProducts] = useState(FALLBACK_PRODUCTS)

  // Load products from backend on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/products/`)
      .then(r => r.json())
      .then(data => {
        const fromBackend = data.map(mapProduct)
        // Keep the catalogue complete when an older backend has not yet
        // seeded a product used by an active combo offer.
        setProducts([...fromBackend, ...FALLBACK_PRODUCTS.filter(product => !fromBackend.some(item => item.id === product.id))])
      })
      .catch(() => {
        console.warn('Backend offline, using fallback products')
      })
  }, [])

  // Tab: 'cart' | 'orders'
  const [activeTab, setActiveTab] = useState('cart')
  const [orderHistory, setOrderHistory] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  const fetchOrderHistory = useCallback(async () => {
    if (!customer?.mobile) return
    setLoadingOrders(true)
    try {
      const response = await fetch(`${BACKEND_URL}/cart/transactions`)
      if (!response.ok) throw new Error('Could not load orders')
      const data = await response.json()
      setOrderHistory(uniquePaidTransactions(data).filter(tx => tx.mobile === customer.mobile))
    } catch {
      // Leave the last successfully loaded history visible if the backend is unavailable.
    } finally {
      setLoadingOrders(false)
    }
  }, [customer?.mobile])

  useEffect(() => {
    if (activeTab === 'orders') fetchOrderHistory()
  }, [activeTab, fetchOrderHistory])

  // Camera
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError,  setCameraError]  = useState('')
  const [captured,     setCaptured]     = useState(null)

  // Identification
  const [identifying, setIdentifying] = useState(false)
  const [identified,  setIdentified]  = useState(null)
  const [liveDetection, setLiveDetection] = useState('')
  const [productReferences, setProductReferences] = useState(() => getProductReferences())

  // Recommendation
  const [recommendation, setRecommendation] = useState(null) // shown after add-to-cart
  const recTimerRef = useRef(null)

  // Cart
  const [cartItems,   setCartItems]   = useState([])
  const [showCheckout, setShowCheckout] = useState(false)

  // Offers — loaded from shared localStorage store (shopkeeper can add/toggle)
  const [offers, setOffers] = useState(() => getOffers().filter(o => o.active))

  // Refresh offers when the cart tab becomes visible (picks up shopkeeper changes)
  useEffect(() => {
    if (activeTab === 'cart') {
      setOffers(getOffers().filter(o => o.active))
    }
  }, [activeTab])

  // Offers claimed state
  const [claimedOffers, setClaimedOffers] = useState(new Set())
  const [offerMessage, setOfferMessage] = useState('')

  // Manual select fallback
  const [showManualSelect, setShowManualSelect] = useState(false)

  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const liveDetectionRef = useRef({ productId: null, sightings: 0, lastSeen: 0 })
  const liveScanBusyRef = useRef(false)
  const lastVisionAttemptRef = useRef(0)
  const referenceUploadRef = useRef(null)
  const [referenceProduct, setReferenceProduct] = useState(null)

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
    setLiveDetection('')
    liveDetectionRef.current = { productId: null, sightings: 0, lastSeen: 0 }
    
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
    setCameraActive(false); setCaptured(null); setIdentified(null); setCameraError(''); setLiveDetection('')
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
    console.log('🚀 Starting product identification...')
    setIdentifying(true); setIdentified(null); setCameraError('')
    
    try {
      console.log('📸 Captured image size:', captured ? captured.length : 'none')
      if (!captured) {
        throw new Error('No image captured')
      }
      
      const result = await identifyWithVision(captured, products, productReferences)
      console.log('✅ Identification successful:', result)
      setIdentified(result)
      
    } catch (err) {
      console.error('❌ Identification failed:', err)
      setCameraError(visionErrorMessage(err))
    } finally {
      setIdentifying(false)
    }
  }, [captured, products, productReferences])

  const beginReferenceUpload = useCallback((product) => {
    setReferenceProduct(product)
    referenceUploadRef.current?.click()
  }, [])

  const saveReferencePhoto = useCallback(async (event) => {
    const file = event.target.files?.[0]
    if (!file || !referenceProduct) return
    try {
      const image = await resizeReferenceImage(file)
      setProductReferences(saveProductReference(referenceProduct.id, image))
    } catch {
      setCameraError('Could not save that reference image. Please try another photo.')
    } finally {
      event.target.value = ''
      setReferenceProduct(null)
    }
  }, [referenceProduct])

  // ── Cart ──────────────────────────────────────────────────────
  const addToCart = useCallback((product) => {
    if (Number(product.stock) <= 0) {
      setCameraError(`${product.name} is currently out of stock.`)
      return
    }
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing && existing.qty >= Number(product.stock)) {
        setCameraError(`Only ${product.stock} ${product.name} available.`)
        return prev
      }
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }]
    })

    // Show recommendation if one exists for this product
    const rec = getRecommendation(product.id, products)
    if (rec) {
      setRecommendation(rec)
      // Auto-dismiss after 8 seconds
      clearTimeout(recTimerRef.current)
      recTimerRef.current = setTimeout(() => setRecommendation(null), 8000)
    }

    closeCamera()
  }, [closeCamera, products])

  // Quick Pick is the no-camera route: selecting a product adds it immediately.
  const selectManualProduct = useCallback((product) => {
    addToCart(product)
    setShowManualSelect(false)
  }, [addToCart])

  const claimOffer = useCallback((offerId) => {
    const rule = OFFER_RULES[offerId]

    if (!isOfferAvailable(rule)) {
      setOfferMessage('Happy Hours can be claimed only from 3 PM to 5 PM.')
      return
    }

    // Bundle offers put their advertised products into the cart immediately,
    // so a customer can actually redeem the deal with one tap.
    if (rule?.products) {
      const bundleProducts = rule.products
        .map(term => products.find(product => productMatches(product, term)))
        .filter(Boolean)
      if (bundleProducts.length !== rule.products.length) {
        setOfferMessage('This combo is temporarily unavailable.')
        return
      }
      if (bundleProducts.some(product => Number(product.stock) <= 0)) {
        setOfferMessage('This combo is out of stock right now.')
        return
      }
      setCartItems(prev => {
        const next = [...prev]
        bundleProducts.forEach(product => {
          const index = next.findIndex(item => item.id === product.id)
          if (index >= 0) next[index] = { ...next[index], qty: next[index].qty + 1 }
          else next.push({ ...product, qty: 1 })
        })
        return next
      })
    }

    setClaimedOffers(prev => new Set([...prev, offerId]))
    setOfferMessage(rule?.products ? `${rule.label} added to your cart.` : 'Offer applied at checkout when eligible.')
  }, [products])

  // Identify the product continuously while the live camera is open. Two
  // matching frames are required so a passing red object is not added by
  // accident. This makes a centred Coca-Cola bottle add itself to the cart
  // without making the customer press the shutter/identify buttons.
  useEffect(() => {
    if (!cameraActive || captured || identified) return undefined

    const scanLiveFrame = async () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (liveScanBusyRef.current || !video || !canvas || video.readyState < 2 || !video.videoWidth) return

      liveScanBusyRef.current = true
      try {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        const image = canvas.toDataURL('image/jpeg', 0.82)
        if (Date.now() - lastVisionAttemptRef.current < 2800) return
        lastVisionAttemptRef.current = Date.now()
        setLiveDetection('Checking product package…')
        const result = await identifyWithVision(image, products, productReferences)
        const confidence = Number(result.confidence)
        const now = Date.now()
        const previous = liveDetectionRef.current
        const sightings = previous.productId === result.id && now - previous.lastSeen < 3500
          ? previous.sightings + 1
          : 1

        liveDetectionRef.current = { productId: result.id, sightings, lastSeen: now }
        setLiveDetection(sightings === 1 ? `Found ${result.name}. Checking…` : `Found ${result.name} — adding to cart…`)

        // A 90%+ package/logo match can be added immediately. Lower-confidence
        // detections still need a second matching live frame.
        if (confidence >= 90 || (sightings >= 2 && confidence >= 75)) {
          addToCart(result)
        }
      } catch (error) {
        console.error('Live product recognition failed:', error)
        liveDetectionRef.current = { productId: null, sightings: 0, lastSeen: 0 }
        setLiveDetection('')
        setCameraError(visionErrorMessage(error))
      } finally {
        liveScanBusyRef.current = false
      }
    }

    const interval = window.setInterval(scanLiveFrame, 1400)
    scanLiveFrame()
    return () => window.clearInterval(interval)
  }, [cameraActive, captured, identified, addToCart, products, productReferences])

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
    setCartItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const product = products.find(candidate => candidate.id === id)
      return product && item.qty < Number(product.stock) ? { ...item, qty: item.qty + 1 } : item
    }))
  }, [products])

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
  const handleDone     = useCallback(async () => {
    setCartItems([])
    setShowCheckout(false)
    closeCamera()
    setActiveTab('cart')
    // Refresh product stock from backend after checkout
    fetch(`${BACKEND_URL}/products/`)
      .then(r => r.json())
      .then(data => setProducts(data.map(mapProduct)))
      .catch(() => {})
    // The receipt only enables Done after its checkout POST has finished, so
    // this refresh includes the order that was just placed.
    await fetchOrderHistory()
  }, [closeCamera, fetchOrderHistory])

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const appliedOffers = useMemo(() => {
    const qualifyingOffers = [...new Map(offers.map(offer => [offer.id, offer])).values()]
      .filter(offer => claimedOffers.has(offer.id))
      .map(offer => ({ ...offer, saving: getOfferDiscount(offer.id, cartItems) }))
      .filter(offer => offer.saving > 0)
    // A defensive ceiling prevents bad/duplicated offer data from ever making
    // a real payment free. The advertised rules are far below 50%.
    let remainingDiscount = subtotal * 0.5
    return qualifyingOffers.map(offer => {
      const saving = Math.min(offer.saving, remainingDiscount)
      remainingDiscount -= saving
      return { ...offer, saving }
    }).filter(offer => offer.saving > 0)
  }, [offers, claimedOffers, cartItems, subtotal])
  const offerDiscount = appliedOffers.reduce((sum, offer) => sum + offer.saving, 0)
  const totalPrice = Math.max(0, subtotal - offerDiscount)
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
            <Checkout
              cartItems={cartItems}
              customer={customer}
              discount={offerDiscount}
              appliedOffers={appliedOffers}
              onDone={handleDone}
              onBack={() => setShowCheckout(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
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

      {/* ── Tab bar ── */}
      <div
        className="flex mb-3 rounded-[12px] p-1"
        style={{ background: 'rgba(0,0,0,0.06)' }}
      >
        {[
          { id: 'cart',   label: '🛒 Cart' + (cartItems.length > 0 ? ` (${cartItems.length})` : '') },
          { id: 'orders', label: '🧾 My Orders' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-1.5 rounded-[9px] text-xs font-semibold transition-all active:scale-95"
            style={{
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#000' : 'rgba(0,0,0,0.4)',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Orders Tab ── */}
      {activeTab === 'orders' && (
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
          {loadingOrders ? (
            <div className="flex items-center justify-center flex-1">
              <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-[#007aff] animate-spin" />
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
              <span className="text-5xl">🧾</span>
              <p className="text-black font-semibold text-base">No orders yet</p>
              <p className="text-black/40 text-xs text-center font-light">
                Complete a checkout to see your order history here
              </p>
            </div>
          ) : (
            orderHistory.map(tx => {
              const items = Array.isArray(tx.items) ? tx.items : []
              const ts = tx.created_at
                ? new Date(tx.created_at).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
                  })
                : 'Unknown time'
              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-[16px]"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-black font-semibold text-xs font-mono">{tx.receipt_id}</p>
                      <p className="text-black/40 text-[10px]">{ts}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-black font-bold text-base">₹{tx.total}</p>
                      <p className="text-[10px]" style={{ color: '#34c759' }}>✓ Paid</p>
                    </div>
                  </div>
                  {items.length > 0 && (
                    <div className="flex flex-col gap-1 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-black/60">{item.name} ×{item.qty}</span>
                          <span className="text-black font-medium">₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── AI Recommendation Banner ── */}
      {activeTab === 'cart' && <AnimatePresence>
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
      </AnimatePresence>}

      {/* ── Cart Tab Content ── */}
      {activeTab === 'cart' && <>

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
            <p className="text-black font-semibold text-base" style={{ letterSpacing: '-0.2px' }}>📸 Smart Product Scanner</p>
            <p className="text-black/35 text-xs text-center font-light leading-relaxed">
              Point camera at products - Smart matching will identify and add them automatically
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
                📸 Start Smart Scanner
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
            {showManualSelect && (
              <div className="w-full max-w-sm rounded-[10px] p-2" style={{ background: '#f2f2f7' }}>
                <label htmlFor="quick-pick-product" className="block text-black/50 text-[10px] font-medium mb-1 px-1">
                  Choose an object to add
                </label>
                <select
                  id="quick-pick-product"
                  autoFocus
                  defaultValue=""
                  onChange={(event) => {
                    const product = products.find(item => String(item.id) === event.target.value)
                    if (product) selectManualProduct(product)
                  }}
                  className="w-full rounded-[8px] bg-white px-3 py-2.5 text-sm font-medium outline-none"
                  style={{ border: '1px solid rgba(0,122,255,0.25)', color: '#1c1c1e' }}
                >
                  <option value="" disabled>Select a product…</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id} disabled={Number(product.stock) <= 0}>
                      {product.emoji} {product.name} — {Number(product.stock) <= 0 ? 'Out of stock' : `₹${product.price}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <p className="text-black/25 text-[10px] text-center mt-2 font-light">
              Works with: Lays, Coca-Cola, Bread, Maggi, Dairy Milk, Parle-G, Amul Milk
            </p>
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
              <span className="text-white text-xs font-medium opacity-80">{liveDetection || 'Point at a product'}</span>
              <button onClick={closeCamera} className="text-white text-xs font-semibold px-2.5 py-1 rounded-full active:opacity-60"
                style={{ background: 'rgba(255,255,255,0.2)' }}>✕ Close</button>
            </div>
            {cameraError && (
              <div className="absolute left-3 right-3 bottom-24 rounded-[10px] px-3 py-2 text-center text-xs font-medium text-white"
                style={{ background: 'rgba(255,59,48,0.92)' }}>
                {cameraError}
              </div>
            )}
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
      <input
        ref={referenceUploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={saveReferencePhoto}
      />

      {/* ── Offers strip ── */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-black font-semibold text-sm">🎁 Offers for You</span>
          <span className="text-xs font-medium" style={{ color: '#007aff' }}>
            {offers.length - claimedOffers.size} active
          </span>
        </div>
        {offerMessage && (
          <p className="mb-2 px-0.5 text-[11px] font-medium" style={{ color: '#34c759' }}>
            ✓ {offerMessage}
          </p>
        )}
        <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {offers.map(offer => {
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
            <div className="border-t pt-2 mb-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              {offerDiscount > 0 && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#34c759] text-xs font-medium">Offer savings</span>
                  <span className="text-[#34c759] text-xs font-semibold">−₹{offerDiscount}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-black/50 text-xs font-light">Total</span>
                <span className="text-black font-bold text-sm">₹{totalPrice}</span>
              </div>
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
      </> /* end activeTab === 'cart' */}
    </div>
  )
}
