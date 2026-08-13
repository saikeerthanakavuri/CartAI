const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

// Product detection service
export const ProductDetectionService = {
  // Detect products from image
  async detectProducts(imageData, options = {}) {
    try {
      const formData = new FormData()
      
      // Convert base64 to blob
      const response = await fetch(imageData)
      const blob = await response.blob()
      formData.append('image', blob, 'detection.jpg')
      
      // Add detection options
      formData.append('confidence_threshold', options.confidenceThreshold || 0.6)
      formData.append('max_results', options.maxResults || 5)
      
      const result = await fetch(`${BACKEND_URL}/api/detect-products`, {
        method: 'POST',
        body: formData
      })
      
      if (!result.ok) {
        throw new Error('Detection request failed')
      }
      
      return await result.json()
    } catch (error) {
      console.error('Product detection failed:', error)
      throw error
    }
  },

  // Get product details by ID
  async getProductDetails(productId) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}`)
      
      if (!response.ok) {
        throw new Error('Product fetch failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to get product details:', error)
      throw error
    }
  },

  // Update product stock after detection/purchase
  async updateProductStock(productId, quantity, operation = 'subtract') {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity,
          operation // 'add' or 'subtract'
        })
      })
      
      if (!response.ok) {
        throw new Error('Stock update failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to update stock:', error)
      throw error
    }
  },

  // Log detection event for analytics
  async logDetection(productId, confidence, timestamp = Date.now()) {
    try {
      await fetch(`${BACKEND_URL}/api/analytics/detection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          confidence,
          timestamp,
          source: 'camera'
        })
      })
    } catch (error) {
      console.warn('Failed to log detection:', error)
      // Don't throw - analytics failure shouldn't break the app
    }
  },

  // Get detection analytics
  async getDetectionStats(timeRange = '24h') {
    try {
      const response = await fetch(`${BACKEND_URL}/api/analytics/detections?range=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Analytics fetch failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to get detection stats:', error)
      throw error
    }
  },

  // Train model with new product image
  async trainWithImage(productId, imageData, metadata = {}) {
    try {
      const formData = new FormData()
      
      const response = await fetch(imageData)
      const blob = await response.blob()
      formData.append('image', blob, 'training.jpg')
      formData.append('product_id', productId)
      formData.append('metadata', JSON.stringify(metadata))
      
      const result = await fetch(`${BACKEND_URL}/api/train/add-image`, {
        method: 'POST',
        body: formData
      })
      
      if (!result.ok) {
        throw new Error('Training image upload failed')
      }
      
      return await result.json()
    } catch (error) {
      console.error('Failed to add training image:', error)
      throw error
    }
  }
}

// Real-time inventory service
export const InventoryService = {
  // Get real-time stock levels
  async getStockLevels() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/stock-levels`)
      
      if (!response.ok) {
        throw new Error('Stock levels fetch failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to get stock levels:', error)
      throw error
    }
  },

  // Get low stock alerts
  async getLowStockAlerts() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/low-stock`)
      
      if (!response.ok) {
        throw new Error('Low stock alerts fetch failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to get low stock alerts:', error)
      throw error
    }
  },

  // Add product to inventory
  async addProduct(productData) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })
      
      if (!response.ok) {
        throw new Error('Product addition failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to add product:', error)
      throw error
    }
  },

  // Update product information
  async updateProduct(productId, updates) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Product update failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to update product:', error)
      throw error
    }
  }
}

// Cart management service
export const CartService = {
  // Add detected product to cart
  async addToCart(customerId, productId, quantity = 1, detectionData = {}) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          product_id: productId,
          quantity,
          detection_confidence: detectionData.confidence,
          detection_method: detectionData.method || 'camera'
        })
      })
      
      if (!response.ok) {
        throw new Error('Add to cart failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    }
  },

  // Get cart contents
  async getCart(customerId) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/${customerId}`)
      
      if (!response.ok) {
        throw new Error('Cart fetch failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to get cart:', error)
      throw error
    }
  },

  // Update cart item quantity
  async updateCartItem(customerId, productId, quantity) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          product_id: productId,
          quantity
        })
      })
      
      if (!response.ok) {
        throw new Error('Cart update failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to update cart:', error)
      throw error
    }
  },

  // Remove item from cart
  async removeFromCart(customerId, productId) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          product_id: productId
        })
      })
      
      if (!response.ok) {
        throw new Error('Cart item removal failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      throw error
    }
  },

  // Process checkout
  async checkout(customerId, paymentData) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          payment_data: paymentData
        })
      })
      
      if (!response.ok) {
        throw new Error('Checkout failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Checkout failed:', error)
      throw error
    }
  }
}

// WebSocket service for real-time updates
export class RealtimeService {
  constructor() {
    this.ws = null
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect(customerId = null) {
    const wsUrl = `${BACKEND_URL.replace('http', 'ws')}/ws${customerId ? `?customer_id=${customerId}` : ''}`
    
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
    }
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.attemptReconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, 2000 * this.reconnectAttempts)
    }
  }

  handleMessage(data) {
    const { type, payload } = data
    
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => callback(payload))
    }
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType).add(callback)
    
    return () => {
      this.listeners.get(eventType).delete(callback)
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    }
  }
}

export const realtimeService = new RealtimeService()
