import { useState, useRef, useEffect } from 'react'

// Mock product database for customer context
const PRODUCTS = [
  { id: 1, name: "Lays Classic", category: "Snacks", price: 20, variant: "Classic Salted · 50g" },
  { id: 2, name: "Coca-Cola", category: "Beverages", price: 40, variant: "Chilled · 330ml Can" },
  { id: 3, name: "Dairy Milk", category: "Chocolate", price: 30, variant: "Milk Chocolate · 40g" },
  { id: 4, name: "Maggi Noodles", category: "Instant Food", price: 15, variant: "Masala · 70g" },
  { id: 5, name: "Britannia Bread", category: "Bakery", price: 45, variant: "Whole Wheat · 400g" },
  { id: 6, name: "Kurkure", category: "Snacks", price: 20, variant: "Masala Munch · 50g" },
  { id: 7, name: "Frooti", category: "Beverages", price: 15, variant: "Mango Drink · 200ml" },
  { id: 8, name: "Hide & Seek", category: "Snacks", price: 25, variant: "Chocolate Cookies · 75g" },
  { id: 9, name: "Hajmola", category: "Digestive", price: 10, variant: "Digestive Candy · 20pc" },
  { id: 10, name: "Amul Butter", category: "Dairy", price: 55, variant: "Pasteurised · 100g" },
]

// Smart response generator based on keywords - NO API NEEDED!
function generateResponse(question, cartItems) {
  const q = question.toLowerCase()
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)

  // Cart-related queries
  if (q.includes('cart') || q.includes('my cart') || q.includes('what do i have')) {
    if (cartItems.length === 0) {
      return "Your cart is empty right now. 🛒 Start by scanning a product with the camera above!"
    }
    const itemsList = cartItems.map(item => `• ${item.name} × ${item.qty} = ₹${item.price * item.qty}`).join('\n')
    return `You have ${cartCount} item${cartCount > 1 ? 's' : ''} in your cart:\n\n${itemsList}\n\n💰 Total: ₹${cartTotal}`
  }

  // Combo/pairing suggestions
  if (q.includes('chips') || q.includes('lays')) {
    return "Great choice! 🥔 Lays pairs perfectly with:\n\n• Coca-Cola (₹40) - Our most popular combo! 87% of customers buy these together.\n• Frooti (₹15) - A refreshing alternative\n\nWould you like to add one?"
  }

  if (q.includes('bread')) {
    return "🍞 Britannia Bread (₹45) goes perfectly with:\n\n• Amul Butter (₹55) - Classic combo, save ₹15 when bought together!\n• Any jam or spread\n\nThis is our most popular breakfast combo!"
  }

  if (q.includes('maggi') || q.includes('noodles')) {
    return "🍜 Maggi Noodles (₹15) tastes amazing with:\n\n• Amul Butter (₹55) - Makes it extra creamy!\n• Hajmola (₹10) - Perfect after-meal digestive\n\nQuick, tasty, and affordable!"
  }

  if (q.includes('chocolate') || q.includes('sweet')) {
    return "🍫 Here are our sweet treats:\n\n• Dairy Milk (₹30) - Classic milk chocolate\n• Hide & Seek (₹25) - Chocolate cookies\n\nBoth are customer favorites!"
  }

  // Price-related queries
  if (q.includes('cheap') || q.includes('cheapest') || q.includes('budget') || q.includes('affordable')) {
    return "💰 Most affordable items:\n\n• Hajmola (₹10) - Digestive candy\n• Maggi Noodles (₹15) - Quick meal\n• Frooti (₹15) - Mango drink\n• Lays Classic (₹20) - Popular snack\n\nAll great value for money!"
  }

  if (q.includes('expensive') || q.includes('premium')) {
    return "✨ Premium items:\n\n• Amul Butter (₹55) - Fresh pasteurized butter\n• Britannia Bread (₹45) - Whole wheat\n• Coca-Cola (₹40) - Chilled beverage\n\nTop quality products!"
  }

  // Category queries
  if (q.includes('snack') || q.includes('munch')) {
    return "🍿 Snack options:\n\n• Lays Classic (₹20)\n• Kurkure (₹20)\n• Hide & Seek (₹25)\n• Hajmola (₹10)\n\nPerfect for munching anytime!"
  }

  if (q.includes('drink') || q.includes('beverage') || q.includes('thirsty')) {
    return "🥤 Beverages available:\n\n• Coca-Cola (₹40) - Chilled can\n• Frooti (₹15) - Mango drink\n\nStay refreshed!"
  }

  if (q.includes('breakfast')) {
    return "🌅 Perfect breakfast combo:\n\n• Britannia Bread (₹45)\n• Amul Butter (₹55)\n• Maggi Noodles (₹15) - Quick option\n\n💡 Save ₹15 on the bread + butter combo!"
  }

  // Combo deals
  if (q.includes('combo') || q.includes('deal') || q.includes('offer') || q.includes('discount')) {
    return "🎁 Active combo deals:\n\n• Lays + Coca-Cola = Save ₹10\n• Bread + Amul Butter = Save ₹15\n• Any 3 Snacks = Only ₹55\n• Maggi + Butter = Perfect combo\n\nCheck the offers banner above for more!"
  }

  // Recommendations based on cart
  if ((q.includes('recommend') || q.includes('suggest') || q.includes('what should')) && cartItems.length > 0) {
    const hasChips = cartItems.some(item => item.name.includes('Lays') || item.name.includes('Kurkure'))
    const hasBread = cartItems.some(item => item.name.includes('Bread'))
    const hasMaggi = cartItems.some(item => item.name.includes('Maggi'))

    if (hasChips) {
      return "I see you have chips in your cart! 🥔\n\nI'd recommend adding:\n• Coca-Cola (₹40) - Most popular pairing\n• Frooti (₹15) - Refreshing drink\n\nSave ₹10 on the Lays + Coke combo!"
    }
    if (hasBread) {
      return "You have bread! 🍞\n\nDon't forget:\n• Amul Butter (₹55) - Save ₹15 on this combo!\n\nThis is our #1 breakfast combo!"
    }
    if (hasMaggi) {
      return "Maggi in cart! 🍜\n\nMake it better with:\n• Amul Butter (₹55) - Extra creamy\n• Hajmola (₹10) - Digest easier\n\nTasty additions!"
    }
  }

  // General recommendations
  if (q.includes('recommend') || q.includes('suggest') || q.includes('popular') || q.includes('best seller')) {
    return "⭐ Our top sellers:\n\n• Lays Classic (₹20) - Most popular snack\n• Coca-Cola (₹40) - Best-selling beverage\n• Dairy Milk (₹30) - Favorite chocolate\n• Maggi Noodles (₹15) - Quick meal\n\nThese are loved by all our customers!"
  }

  // Product availability
  if (q.includes('have') || q.includes('available') || q.includes('stock')) {
    return "📦 We have all these products in stock:\n\n🍿 Snacks: Lays, Kurkure, Hide & Seek, Hajmola\n🥤 Beverages: Coca-Cola, Frooti\n🍫 Sweets: Dairy Milk\n🍜 Meals: Maggi Noodles, Bread\n🧈 Dairy: Amul Butter\n\nJust scan any product to add it to your cart!"
  }

  // Price queries
  if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
    const matchedProduct = PRODUCTS.find(p => 
      q.includes(p.name.toLowerCase()) || 
      p.category.toLowerCase().includes(q)
    )
    
    if (matchedProduct) {
      return `${matchedProduct.name} costs ₹${matchedProduct.price}\n${matchedProduct.variant}\n\n${matchedProduct.category} section`
    }
    
    return "💰 Quick price list:\n\n• Hajmola: ₹10\n• Maggi/Frooti: ₹15\n• Lays/Kurkure: ₹20\n• Hide & Seek: ₹25\n• Dairy Milk: ₹30\n• Coca-Cola: ₹40\n• Bread: ₹45\n• Amul Butter: ₹55"
  }

  // Help/greeting
  if (q.includes('help') || q.includes('hello') || q.includes('hi ') || q === 'hi' || q === 'hey') {
    return "Hi there! 👋 I'm your shopping assistant.\n\nI can help you:\n• Find products and prices\n• Suggest combos and deals\n• Show what's in your cart\n• Recommend popular items\n\nTry asking: \"What should I buy with chips?\" or \"What's cheapest?\""
  }

  // Default response
  return "I can help you with:\n\n🛒 Cart questions\n💰 Prices and deals\n🎁 Combo recommendations\n📦 Product availability\n⭐ Popular items\n\nTry asking about specific products, combos, or deals!"
}

export default function CustomerAI({ cartItems = [] }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! 👋 I'm your shopping assistant. I can help you find products, suggest combos, answer questions about what's in stock, and make your shopping easier. How can I help you today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('✅ CustomerAI component mounted!')
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const q = input.trim()
    if (!q || loading) return

    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    // Simulate a small delay to make it feel natural
    setTimeout(() => {
      const response = generateResponse(q, cartItems)
      setMessages((m) => [...m, { role: 'assistant', text: response }])
      setLoading(false)
    }, 600)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Quick suggestion buttons
  const quickActions = [
    "What should I buy with chips?",
    "What's cheapest?",
    "Suggest a breakfast combo",
    "What's in my cart?",
  ]

  const handleQuickAction = (question) => {
    setInput(question)
    setTimeout(() => {
      if (question) {
        setMessages((m) => [...m, { role: 'user', text: question }])
        setLoading(true)
        setTimeout(() => {
          const response = generateResponse(question, cartItems)
          setMessages((m) => [...m, { role: 'assistant', text: response }])
          setLoading(false)
        }, 600)
      }
    }, 100)
  }

  return (
    <>
      {/* Floating chat bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="absolute w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl active:scale-95 transition-transform"
          style={{ 
            bottom: '100px', 
            left: '24px',
            background: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
            zIndex: 999,
            border: '3px solid white',
            boxShadow: '0 8px 32px rgba(52, 199, 89, 0.5), 0 0 0 4px rgba(52, 199, 89, 0.1)'
          }}
        >
          🤖
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="absolute rounded-[20px] flex flex-col shadow-2xl"
          style={{ 
            bottom: '100px',
            left: '24px',
            width: '320px',
            height: '460px',
            background: '#fff', 
            border: '1px solid rgba(0,0,0,0.1)',
            zIndex: 999
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between rounded-t-[20px]"
            style={{ background: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Shopping Assistant</p>
                <p className="text-white/70 text-[10px]">AI-Powered Helper</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-sm active:scale-90 transition-transform"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-3 py-2 rounded-[14px] text-xs leading-relaxed whitespace-pre-wrap"
                  style={
                    m.role === 'user'
                      ? {
                          background: '#34c759',
                          color: '#fff',
                          borderBottomRightRadius: 4,
                        }
                      : {
                          background: '#f2f2f7',
                          color: '#000',
                          borderBottomLeftRadius: 4,
                        }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Quick action chips - only show at start */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action)}
                    className="text-[10px] px-2.5 py-1.5 rounded-full font-medium active:scale-95 transition-transform"
                    style={{
                      background: 'rgba(52, 199, 89, 0.1)',
                      color: '#34c759',
                      border: '1px solid rgba(52, 199, 89, 0.2)',
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2 rounded-[14px] text-xs flex gap-1"
                  style={{ background: '#f2f2f7', borderBottomLeftRadius: 4 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-black/25 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-black/25 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-black/25 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-black/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              className="flex-1 rounded-[12px] px-3 py-2 text-xs outline-none"
              style={{ background: '#f2f2f7', border: '1px solid rgba(0,0,0,0.08)' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="text-white text-xs font-semibold rounded-[12px] px-4 py-2 active:scale-95 transition-transform disabled:opacity-40"
              style={{ background: '#34c759' }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}
