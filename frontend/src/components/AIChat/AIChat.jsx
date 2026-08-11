import { useState, useRef, useEffect } from 'react'
import { getTotalRevenue, getTotalProfit, getCriticalStock, getExpiringSoon, getDroppingSales } from '../../data/products.js'

export default function AIChat({ products }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your AI store assistant. I can analyze your sales, suggest restocks, spot trends, and help grow your profits. Ask me anything!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Try Chrome or Edge.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
  }

  const generateSmartResponse = (query) => {
    const q = query.toLowerCase()
    const revenue = getTotalRevenue(products)
    const profit = getTotalProfit(products)
    const critical = getCriticalStock(products)
    const expiring = getExpiringSoon(products)
    const dropping = getDroppingSales(products)
    const topSellers = [...products].sort((a, b) => b.soldToday - a.soldToday).slice(0, 3)
    const lowSellers = [...products].sort((a, b) => a.soldToday - b.soldToday).slice(0, 3)
    
    // Revenue & Sales queries
    if (q.match(/revenue|earning|sales|money|much.*made|today.*sales|income|turnover/)) {
      return `Today's revenue is ₹${revenue.toLocaleString('en-IN')} with ₹${profit.toLocaleString('en-IN')} profit (${Math.round((profit/revenue)*100)}% margin). Your top seller is ${topSellers[0].name} with ${topSellers[0].soldToday} units sold. ${critical.length > 0 ? `⚠️ But you have ${critical.length} products critically low on stock - restock ${critical[0].name} immediately!` : 'Stock levels are healthy.'}`
    }
    
    // Stock & Restock queries
    if (q.match(/stock|restock|inventory|low|what.*should.*buy|need.*order|running.*out|shortage/)) {
      if (critical.length === 0) return "✅ All stock levels are good! No urgent restocking needed."
      const criticalList = critical.map(p => `${p.name} (only ${p.stock} ${p.unit} left)`).join(', ')
      return `🚨 URGENT: ${critical.length} critical items need restocking NOW:\n\n${criticalList}\n\nRestock these today to avoid losing sales. ${critical[0].name} is your priority - you risk losing ₹${critical[0].sellPrice * 10} in potential sales.`
    }
    
    // Profit & Growth queries - expanded for combo/deals
    if (q.match(/profit|increase|grow|improve|more.*money|how.*can|combo|deal|bundle|offer|promo|discount|boost|maximize/)) {
      const bestMargin = [...products].sort((a, b) => (b.sellPrice - b.costPrice) - (a.sellPrice - a.costPrice))[0]
      
      // If specifically about combos/deals
      if (q.match(/combo|deal|bundle|offer|promo/)) {
        return `💰 Smart combo ideas to boost sales:\n\n1. "${topSellers[0].name} + ${topSellers[1].name}" combo - Your top 2 sellers bundled with 10% off\n2. "${bestMargin.name} + ${topSellers[2].name}" - Push high-margin ${bestMargin.name} (₹${bestMargin.sellPrice - bestMargin.costPrice} profit/unit)\n3. "Buy 2 Get 1 at 50% off" on snacks\n4. "Meal Deal" - Bread + Dairy + Beverage for ₹100\n\nCombo deals increase basket value by 25-30% and help move slow stock. Try these today!`
      }
      
      return `💰 To increase profits:\n\n1. Push ${topSellers[0].name} more - it's your #1 seller (${topSellers[0].soldToday} units today)\n2. ${bestMargin.name} has your best margin (₹${bestMargin.sellPrice - bestMargin.costPrice} profit per unit)\n3. Create combos: ${topSellers[0].name} + ${topSellers[1].name} for 10% off\n4. Place high-margin items at eye level\n\nCombo deals boost basket value by 25%. Current profit: ₹${profit.toLocaleString('en-IN')}.`
    }
    
    // Expiry queries
    if (q.match(/expir|waste|old|spoil|throw|fresh|shelf.*life/)) {
      if (expiring.length === 0) return "✅ No products expiring soon. All good!"
      const expiryList = expiring.map(p => `${p.name} expires ${new Date(p.expiryDate).toLocaleDateString()}`).join('\n')
      return `📅 ${expiring.length} products expiring in next 3 days:\n\n${expiryList}\n\nRun a quick sale or offer 20% discount to clear them before expiry. Don't let inventory go to waste!`
    }
    
    // Top products queries
    if (q.match(/top|best|selling|popular|most.*sold|fastest.*moving|star.*product/)) {
      return `🏆 Top 3 sellers today:\n\n1. ${topSellers[0].name} - ${topSellers[0].soldToday} units (₹${topSellers[0].sellPrice * topSellers[0].soldToday})\n2. ${topSellers[1].name} - ${topSellers[1].soldToday} units (₹${topSellers[1].sellPrice * topSellers[1].soldToday})\n3. ${topSellers[2].name} - ${topSellers[2].soldToday} units (₹${topSellers[2].sellPrice * topSellers[2].soldToday})\n\nKeep these well-stocked - they're your revenue drivers!`
    }
    
    // Worst/Low performers
    if (q.match(/worst|slow.*moving|not.*selling|least|low.*sales|dead.*stock/)) {
      return `📉 Slowest movers today:\n\n1. ${lowSellers[0].name} - only ${lowSellers[0].soldToday} units\n2. ${lowSellers[1].name} - only ${lowSellers[1].soldToday} units\n3. ${lowSellers[2].name} - only ${lowSellers[2].soldToday} units\n\nActions: Run a promo, reduce restock, or bundle with fast movers to clear stock.`
    }
    
    // Dropping sales queries
    if (q.match(/drop|slow|less|demand|falling|down|declining|decrease/)) {
      if (dropping.length === 0) return "✅ No significant sales drops today. All products performing normally."
      const dropList = dropping.map(p => `${p.name}: ${p.soldToday} today vs ${p.soldYesterday} yesterday`).join('\n')
      return `📉 ${dropping.length} products with dropping sales:\n\n${dropList}\n\nConsider: 1) Reduce restock quantities, 2) Run a promo to clear stock, 3) Sales might be seasonal.`
    }
    
    // Specific product queries
    const mentionedProduct = products.find(p => q.includes(p.name.toLowerCase().replace(/\s+/g, '')))
    if (mentionedProduct) {
      const margin = mentionedProduct.sellPrice - mentionedProduct.costPrice
      const profitToday = margin * mentionedProduct.soldToday
      return `📦 ${mentionedProduct.name}:\n\n• Sold: ${mentionedProduct.soldToday} units today\n• Stock: ${mentionedProduct.stock} ${mentionedProduct.unit} left\n• Price: ₹${mentionedProduct.sellPrice} (₹${margin} profit per unit)\n• Today's profit: ₹${profitToday}\n• Expires: ${new Date(mentionedProduct.expiryDate).toLocaleDateString()}\n\n${mentionedProduct.stock <= mentionedProduct.threshold * 0.2 ? '⚠️ CRITICAL: Restock immediately!' : mentionedProduct.stock <= mentionedProduct.threshold * 0.5 ? '⚠️ Running low - restock soon' : '✅ Stock level is good'}`
    }
    
    // Recommendations
    if (q.match(/recommend|suggest|advice|should.*do|what.*now|help.*grow|tip|insight/)) {
      return `💡 Top recommendations right now:\n\n1. ${critical.length > 0 ? `🚨 Restock ${critical[0].name} ASAP (only ${critical[0].stock} left)` : '✅ Stock levels are good'}\n2. 🏆 Promote ${topSellers[0].name} - it's trending hard today\n3. 💰 Create combo: ${topSellers[0].name} + ${topSellers[1].name} = +25% sales\n4. ${expiring.length > 0 ? `⚡ Quick sale on ${expiring[0].name} (expires soon)` : '📊 Monitor slow-moving items'}\n\nTake these actions today to maximize profit!`
    }
    
    // Forecast
    if (q.match(/forecast|predict|tomorrow|future|next.*day|expect|trend/)) {
      const expectedRevenue = Math.floor(revenue * (0.95 + Math.random() * 0.1))
      return `🔮 Tomorrow's forecast:\n\n• Expected revenue: ₹${expectedRevenue.toLocaleString('en-IN')} (±5%)\n• High demand: ${topSellers[0].name}, ${topSellers[1].name}\n• Restock tonight: ${critical.map(p => p.name).join(', ') || 'None'}\n• Trend: Weekends see 15-20% higher sales\n\nPrepare accordingly!`
    }
    
    // Comparison queries
    if (q.match(/compar|versus|vs|better|which.*sell|difference/)) {
      return `📊 Product comparison:\n\nBest profit margin: ${[...products].sort((a, b) => (b.sellPrice - b.costPrice) - (a.sellPrice - a.costPrice))[0].name}\nFastest moving: ${topSellers[0].name}\nSlowest moving: ${lowSellers[0].name}\n\nFocus on high-margin + high-volume products for best returns.`
    }
    
    // Alert/problem queries
    if (q.match(/alert|problem|issue|wrong|worry|urgent|critical/)) {
      const alerts = []
      if (critical.length > 0) alerts.push(`🚨 ${critical.length} products critically low`)
      if (expiring.length > 0) alerts.push(`📅 ${expiring.length} items expiring soon`)
      if (dropping.length > 0) alerts.push(`📉 ${dropping.length} products with dropping sales`)
      
      if (alerts.length === 0) return "✅ No alerts! Everything is running smoothly."
      return `⚠️ Current alerts:\n\n${alerts.join('\n')}\n\nAddress these to avoid revenue loss. Want details on any of these?`
    }
    
    // Performance/Analytics
    if (q.match(/performance|analytics|report|summary|overview|status/)) {
      return `📈 Store Performance Report:\n\n💰 Financial:\n• Revenue: ₹${revenue.toLocaleString('en-IN')}\n• Profit: ₹${profit.toLocaleString('en-IN')} (${Math.round((profit/revenue)*100)}%)\n\n📦 Inventory:\n• ${products.length} total products\n• ${critical.length} critical alerts\n• ${expiring.length} expiring soon\n\n🏆 Top seller: ${topSellers[0].name}\n\nOverall: ${critical.length === 0 && expiring.length === 0 ? 'Excellent! 🎉' : 'Needs attention ⚠️'}`
    }
    
    // Category/segment questions
    if (q.match(/category|segment|type|snack|beverage|food/)) {
      const categories = [...new Set(products.map(p => p.category))]
      const catRevenue = categories.map(cat => {
        const catProducts = products.filter(p => p.category === cat)
        const catRev = catProducts.reduce((sum, p) => sum + p.sellPrice * p.soldToday, 0)
        return { cat, rev: catRev }
      }).sort((a, b) => b.rev - a.rev)
      
      return `📂 Category Performance:\n\n${catRevenue.map((c, i) => `${i+1}. ${c.cat}: ₹${c.rev.toLocaleString('en-IN')}`).join('\n')}\n\nTop category: ${catRevenue[0].cat} is driving ${Math.round((catRevenue[0].rev/revenue)*100)}% of revenue.`
    }
    
    // When to restock
    if (q.match(/when.*restock|timing|schedule/)) {
      return `⏰ Restocking schedule:\n\n• Critical items (${critical.length}): Restock TODAY\n• Expiring items (${expiring.length}): Clear or discount NOW\n• Fast movers: Restock every 2-3 days\n• Slow movers: Weekly check\n\nBest time: Late evening after closing or early morning before opening.`
    }
    
    // Customer behavior
    if (q.match(/customer|buying.*pattern|behavior|prefer/)) {
      return `👥 Customer insights:\n\n• Most popular: ${topSellers[0].name} (${topSellers[0].soldToday} sold)\n• Average basket: ₹${Math.floor(revenue / (topSellers.reduce((sum, p) => sum + p.soldToday, 0) / 3))}\n• Peak hours: 4-5 PM typically\n\nTip: Bundle popular items with slow movers to boost overall sales.`
    }
    
    // Negative/complaint handling
    if (q.match(/not.*working|bad|terrible|useless|stupid|dumb|hate/)) {
      return `I'm here to help! 😊 Let me show you what I can do:\n\n• Real-time revenue tracking\n• Stock alerts before you run out\n• Profit optimization tips\n• Smart combo suggestions\n• Sales forecasting\n\nTry: "What should I restock?" or "Show me today's revenue"`
    }
    
    // Thanks/positive
    if (q.match(/thank|thanks|appreciate|helpful|good|great|awesome|perfect/)) {
      return `You're welcome! 😊 Happy to help grow your business. Need anything else?\n\nQuick tip: Check your alerts tab regularly to stay ahead of stock issues!`
    }
    
    // Confused/vague
    if (q.match(/don.*know|confused|not.*sure|maybe|idk|dunno/)) {
      return `No worries! Let me help you explore:\n\n1. "Show revenue" - See today's earnings\n2. "What to restock?" - Get stock alerts\n3. "Combo ideas" - Boost sales with deals\n4. "Top sellers" - See what's moving\n\nWhat interests you most?`
    }
    
    // Yes/No responses
    if (q.match(/^(yes|yeah|yep|yup|ok|okay|sure|no|nope|nah)$/)) {
      return `Let's focus on your store! Try asking:\n\n• "How's my revenue today?"\n• "What should I restock?"\n• "Give me combo ideas"\n• "Show alerts"\n\nWhat would you like to know?`
    }
    
    // Greeting
    if (q.match(/hello|hi|hey|good.*morning|good.*evening|good.*afternoon/)) {
      const timeHour = new Date().getHours()
      const greeting = timeHour < 12 ? 'Good morning' : timeHour < 17 ? 'Good afternoon' : 'Good evening'
      return `${greeting}! 👋 Quick snapshot: ₹${revenue.toLocaleString('en-IN')} revenue today, ${critical.length} urgent alerts. What would you like to know?`
    }
    
    // Help/capabilities
    if (q.match(/help|what.*can.*you|capabilities|features|what.*do/)) {
      return `🤖 I'm your AI store analyst! I can:\n\n💰 Track revenue & profit in real-time\n📦 Alert you before stock runs out\n🏆 Show top & worst performing products\n💡 Suggest combos & deals to boost sales\n🔮 Forecast tomorrow's demand\n📊 Compare products & categories\n📅 Track expiring items\n\nTry asking anything about your store!`
    }
    
    // Catch-all with smart context
    // If they're asking a question, give them options
    if (q.includes('?') || q.match(/what|how|why|when|where|tell.*me|show.*me/)) {
      return `I can help you with:\n\n💰 Revenue & profit analysis\n📦 Stock alerts & restocking\n🏆 Top selling products\n💡 Combo ideas & promotions\n🔮 Sales forecasting\n📊 Product comparisons\n📅 Expiry tracking\n\nTry: "What should I restock?" or "Show combo ideas" or "How to increase profits?"`
    }
    
    // Final fallback - assume they want overview
    return `📊 Store Overview:\n\n• Revenue: ₹${revenue.toLocaleString('en-IN')}\n• Profit: ₹${profit.toLocaleString('en-IN')}\n• Top seller: ${topSellers[0].name} (${topSellers[0].soldToday} units)\n• ${critical.length} critical alerts\n• ${expiring.length} expiring soon\n\nI can analyze revenue, suggest restocks, create combo deals, forecast sales, and more. What would you like to know?`
  }

  const sendMessage = () => {
    const q = input.trim()
    if (!q || loading) return

    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    // Simulate thinking delay for realism
    setTimeout(() => {
      const response = generateSmartResponse(q)
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

  return (
    <>
      {/* Floating chat bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg active:scale-95 transition-transform z-50"
          style={{ background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)' }}
        >
          ✨
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="absolute bottom-5 right-5 w-[340px] h-[500px] rounded-[20px] flex flex-col shadow-2xl z-50"
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between rounded-t-[20px]"
            style={{ background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                ✨
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AI Assistant</p>
                <p className="text-white/70 text-[10px]">Smart Analytics Engine</p>
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
                          background: '#007aff',
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
            <button
              onClick={startVoiceInput}
              disabled={listening}
              className="text-white text-sm rounded-[12px] px-3 py-2 active:scale-95 transition-transform disabled:opacity-40"
              style={{ background: listening ? '#ff3b30' : '#34c759' }}
              title="Voice input"
            >
              {listening ? '🎤' : '🎙️'}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={listening ? "Listening..." : "Ask me anything..."}
              className="flex-1 rounded-[12px] px-3 py-2 text-xs outline-none"
              style={{ background: '#f2f2f7', border: '1px solid rgba(0,0,0,0.08)' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="text-white text-xs font-semibold rounded-[12px] px-4 py-2 active:scale-95 transition-transform disabled:opacity-40"
              style={{ background: '#007aff' }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}
