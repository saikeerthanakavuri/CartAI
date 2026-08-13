import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCT_IMAGES, findProductByVisualFeatures, findProductByName } from '../../data/productImages'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

export default function ProductDetector({ onProductDetected, isActive }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedProducts, setDetectedProducts] = useState([])
  const [lastDetection, setLastDetection] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState('')
  const detectionInterval = useRef(null)

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraReady(true)
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.')
      console.error('Camera error:', err)
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }, [])

  // Capture frame from video
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  // AI-powered product detection using Gemini Vision API
  const detectProductWithAI = useCallback(async (imageData) => {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using fallback detection')
      return fallbackDetection(imageData)
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this image and identify any consumer products visible. Look for:
                1. Product names and brand logos
                2. Package colors and shapes
                3. Text on packages
                4. Product categories (snacks, beverages, etc.)
                
                Available products in our store:
                - Lays Classic (yellow packet, potato chips)
                - Coca-Cola (red bottle/can)
                - Bread Loaf (brown/wheat colored)
                - Maggi Noodles (yellow/red packet)
                - Dairy Milk (purple chocolate bar)
                - Parle-G Biscuits (orange packet)
                - Amul Milk (blue/white carton)
                
                Respond in JSON format:
                {
                  "products": [
                    {
                      "name": "product name",
                      "confidence": 0.0-1.0,
                      "colors": ["color1", "color2"],
                      "text": "visible text",
                      "keywords": ["keyword1", "keyword2"]
                    }
                  ]
                }`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData.split(',')[1]
                }
              }
            ]
          }]
        })
      })

      const result = await response.json()
      
      if (result.candidates && result.candidates[0]) {
        const text = result.candidates[0].content.parts[0].text
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        
        if (jsonMatch) {
          const aiResult = JSON.parse(jsonMatch[0])
          return processAIDetection(aiResult)
        }
      }
      
      return fallbackDetection(imageData)
    } catch (error) {
      console.error('AI detection failed:', error)
      return fallbackDetection(imageData)
    }
  }, [])

  // Process AI detection results
  const processAIDetection = useCallback((aiResult) => {
    const detectedProducts = []
    
    if (aiResult.products && Array.isArray(aiResult.products)) {
      for (const detected of aiResult.products) {
        const match = findProductByVisualFeatures({
          colors: detected.colors || [],
          text: detected.text || '',
          keywords: detected.keywords || [detected.name]
        })
        
        if (match.length > 0) {
          const bestMatch = match[0]
          if (bestMatch.confidence > 0.6) {
            detectedProducts.push({
              ...bestMatch,
              aiConfidence: detected.confidence,
              combinedConfidence: (bestMatch.confidence + detected.confidence) / 2
            })
          }
        }
      }
    }
    
    return detectedProducts.sort((a, b) => b.combinedConfidence - a.combinedConfidence)
  }, [])

  // Fallback detection using simple image analysis
  const fallbackDetection = useCallback((imageData) => {
    // Simple color analysis fallback
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const img = new Image()
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)
        
        // Analyze dominant colors
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const colors = analyzeDominantColors(imageData.data)
        
        // Match against known products
        const matches = findProductByVisualFeatures({ colors })
        resolve(matches.slice(0, 3)) // Top 3 matches
      }
      
      img.src = imageData
    })
  }, [])

  // Analyze dominant colors in image
  const analyzeDominantColors = useCallback((data) => {
    const colorCounts = {}
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Convert to hex
      const hex = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
      colorCounts[hex] = (colorCounts[hex] || 0) + 1
    }
    
    // Get top 5 colors
    return Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color)
  }, [])

  // Main detection loop
  const performDetection = useCallback(async () => {
    if (!isActive || !cameraReady || isDetecting) return
    
    setIsDetecting(true)
    
    try {
      const imageData = captureFrame()
      if (!imageData) return
      
      const detected = await detectProductWithAI(imageData)
      
      if (detected && detected.length > 0) {
        const bestMatch = detected[0]
        
        // Avoid duplicate detections (same product within 3 seconds)
        const now = Date.now()
        if (lastDetection && 
            lastDetection.productId === bestMatch.productId && 
            now - lastDetection.timestamp < 3000) {
          return
        }
        
        setDetectedProducts(detected)
        setLastDetection({
          productId: bestMatch.productId,
          timestamp: now
        })
        
        // Notify parent component
        if (bestMatch.combinedConfidence > 0.7) {
          onProductDetected({
            productId: bestMatch.productId,
            product: bestMatch.product,
            confidence: bestMatch.combinedConfidence
          })
        }
      }
    } catch (error) {
      console.error('Detection error:', error)
    } finally {
      setIsDetecting(false)
    }
  }, [isActive, cameraReady, isDetecting, captureFrame, detectProductWithAI, lastDetection, onProductDetected])

  // Start/stop detection based on active state
  useEffect(() => {
    if (isActive && cameraReady) {
      detectionInterval.current = setInterval(performDetection, 2000) // Detect every 2 seconds
    } else {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current)
        detectionInterval.current = null
      }
    }
    
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current)
      }
    }
  }, [isActive, cameraReady, performDetection])

  // Initialize camera when component mounts
  useEffect(() => {
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => stopCamera()
  }, [isActive, startCamera, stopCamera])

  if (!isActive) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Camera View */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Detection Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Detection Frame */}
          <div className="absolute inset-x-8 inset-y-32 border-2 border-blue-400 rounded-lg">
            <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-blue-400" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-blue-400" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-blue-400" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-blue-400" />
          </div>
          
          {/* Instructions */}
          <div className="absolute top-20 left-0 right-0 text-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 mx-4">
              <p className="text-white text-lg font-medium">
                {isDetecting ? '🔍 Analyzing...' : '📱 Point camera at product'}
              </p>
              <p className="text-white/80 text-sm mt-1">
                Keep product within the frame
              </p>
            </div>
          </div>
          
          {/* Detection Results */}
          <AnimatePresence>
            {detectedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute bottom-20 left-4 right-4"
              >
                {detectedProducts.slice(0, 3).map((detection, index) => (
                  <motion.div
                    key={`${detection.productId}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-green-500 rounded-lg p-3 mb-2 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {detection.product.visualFeatures?.packageType === 'bottle' ? '🍼' :
                         detection.product.visualFeatures?.packageType === 'packet' ? '📦' : '🛍️'}
                      </span>
                      <div>
                        <p className="text-white font-medium">{detection.product.name}</p>
                        <p className="text-white/80 text-sm">
                          {Math.round(detection.combinedConfidence * 100)}% match
                        </p>
                      </div>
                    </div>
                    <div className="text-white font-bold">
                      ✓ Detected
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2">
            <div className="bg-red-500 rounded-lg p-4 text-center">
              <p className="text-white font-medium">{error}</p>
              <button 
                onClick={startCamera}
                className="mt-2 bg-white text-red-500 px-4 py-2 rounded font-medium"
              >
                Retry Camera
              </button>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {!cameraReady && !error && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-white text-lg">Starting Camera...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
