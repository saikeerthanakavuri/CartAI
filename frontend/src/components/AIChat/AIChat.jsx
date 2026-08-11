import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { PRODUCTS, getTotalRevenue, getTotalProfit, getCriticalStock, getExpiringSoon, getDroppingSales } from '../../data/products.js'

const API_KEY = 'AIzaSyAb8RN6KvGkkV86N-I3Ln1pcUO1g4WYFSkAb-x87Cbwqrdlm1Nw'

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
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const getStoreContext = () => {
    const revenue = getTotalRevenue(products)
    const profit = getTotalProfit(products)
    const critical = getCriticalStock(products)
    const expiring = getExpiringSoon(products)
    const dropping = getDroppingSales(products)
    
    const topSellers = [...products].sort((a, b) => b.soldToday - a.soldToday).slice(0, 3)
    
    return `
Current Store Data (${new Date().toLocaleDateString()}):
- Total Revenue Today: ₹${revenue}
- Total Profit Today: ₹${profit}
- Total Products: ${products.length}

Top 3 Sellers Today:
${topSellers.map((p, i) => `${i + 1}. ${p.name} - ${p.soldToday} units sold (₹${p.sellPrice} each)`).join('\n')}

Critical Stock Alerts (${critical.length}):
${critical.map(p => `- ${p.name}: Only ${p.stock} ${p.unit} left (threshold: ${p.threshold})`).join('\n') || 'None'}

Expiring Soon (${expiring.length}):
${expiring.map(p => `- ${p.name}: Expires ${p.expiryDate} (${p.stock} units left)`).join('\n') || 'None'}

Dropping Sales (${dropping.length}):
${dropping.map(p => `- ${p.name}: Sold ${p.soldToday} today vs ${p.soldYesterday} yesterday (${Math.round(((p.soldYesterday - p.soldToday) / p.soldYesterday) * 100)}% drop)`).join('\n') || 'None'}

All Products:
${products.map(p => `- ${p.name} (${p.category}): Cost ₹${p.costPrice}, Sell ₹${p.sellPrice}, Stock: ${p.stock} ${p.unit}, Sold today: ${p.soldToday}`).join('\n')}
    `.trim()
  }

  const sendMessage = async () => {
    const q = input.trim()
    if (!q || loading) return

    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const genAI = new GoogleGenerativeAI(API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

      const prompt = `You are an AI assistant for a small shopkeeper managing their store inventory and sales.

${getStoreContext()}

User Question: ${q}

Instructions:
- Give practical, actionable advice for a small store owner
- Use the store data above to give specific recommendations
- Be concise and friendly
- Use ₹ for currency
- If asked about specific products, reference the actual data
- Suggest realistic actions they can take today
- Keep responses under 100 words unless analysis requires more

Answer:`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      setMessages((m) => [...m, { role: 'assistant', text }])
    } catch (error) {
      console.error('Gemini API error:', error)
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: "Sorry, I couldn't process that. Please try again or check your internet connection.",
        },
      ])
    } finally {
      setLoading(false)
    }
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
          className="fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg active:scale-95 transition-transform z-50"
          style={{ background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)' }}
        >
          ✨
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-5 right-5 w-[340px] h-[500px] rounded-[20px] flex flex-col shadow-2xl z-50"
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
                <p className="text-white/70 text-[10px]">Powered by Gemini</p>
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
