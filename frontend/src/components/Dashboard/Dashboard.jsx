import { useState, useRef, useEffect } from 'react'

// ── Dummy data ──────────────────────────────────────────────────────────────
const REVENUE_DATA = {
  today: '₹4,280',
  yesterday: '₹3,950',
  thisWeek: '₹28,640',
  orders: 38,
  avgOrder: '₹112',
  peakHour: '4–5 PM',
  hourly: [
    { hour: '9AM', amt: 320 }, { hour: '10AM', amt: 580 }, { hour: '11AM', amt: 740 },
    { hour: '12PM', amt: 920 }, { hour: '1PM', amt: 680 }, { hour: '2PM', amt: 420 },
    { hour: '3PM', amt: 510 }, { hour: '4PM', amt: 1100 }, { hour: '5PM', amt: 960 },
    { hour: '6PM', amt: 750 }, { hour: '7PM', amt: 430 }, { hour: '8PM', amt: 290 },
  ],
}

const TOP_PRODUCTS = [
  { rank: 1, name: 'Lays Classic', category: 'Snacks', sold: 48, revenue: '₹1,440', trend: '+12%' },
  { rank: 2, name: 'Coca-Cola 2L', category: 'Beverages', sold: 35, revenue: '₹2,450', trend: '+8%' },
  { rank: 3, name: 'Bread Loaf', category: 'Bakery', sold: 30, revenue: '₹1,200', trend: '+5%' },
  { rank: 4, name: 'Maggi Noodles', category: 'Instant Food', sold: 27, revenue: '₹810', trend: '-3%' },
  { rank: 5, name: 'Dairy Milk', category: 'Chocolate', sold: 22, revenue: '₹880', trend: '+18%' },
]

const RED_ALERTS = [
  { name: 'Coca-Cola 2L', stock: 2, threshold: 10, unit: 'bottles', loss: '₹1,400', urgency: 'critical' },
  { name: 'Lays Classic', stock: 4, threshold: 15, unit: 'packs', urgency: 'high' },
  { name: 'Bread Loaf', stock: 3, threshold: 10, unit: 'loaves', loss: '₹600', urgency: 'high' },
  { name: 'Maggi Noodles', stock: 7, threshold: 20, unit: 'packets', urgency: 'medium' },
]

// ── AI assistant — canned smart responses ───────────────────────────────────
const AI_RESPONSES = {
  revenue: '💰 Your revenue today is ₹4,280 — up 8.4% from yesterday (₹3,950). Peak hour is 4–5 PM with ₹1,100 in sales. You\'re on track for your best day this week!',
  stock: '⚠️ 4 products need urgent attention: Coca-Cola 2L is critically low at 2 bottles — you risk losing ₹1,400 in sales. Restock immediately.',
  recommend: '🎯 Best move right now: Enable a "Chips + Dip" combo deal before 4 PM — your peak hour. Lays is your #1 seller and bundling it with a dip can increase basket value by 20–30%.',
  profit: '📈 To increase profits today: Push Dairy Milk — it\'s trending +18% this week. Place it near the checkout counter for impulse buys. Also restock Coca-Cola before your 4 PM rush.',
  forecast: '🔮 Tomorrow\'s forecast: Cold drinks demand will be high (weekend effect). Stock up 20+ units of Coca-Cola and Mango drinks tonight. Bread and Maggi will see usual weekday levels.',
  top: '🏆 Your top 3 sellers today: (1) Lays Classic — 48 units, (2) Coca-Cola 2L — 35 units, (3) Bread Loaf — 30 units. Dairy Milk is trending fast at +18% growth.',
  default: '🤖 I can help you with revenue insights, stock alerts, product recommendations, demand forecasts, and profit tips. Try asking: "What should I restock?" or "How can I increase profits today?"',
}

function getAIResponse(input) {
  const q = input.toLowerCase()
  if (q.includes('revenue') || q.includes('sales') || q.includes('money') || q.includes('earn')) return AI_RESPONSES.revenue
  if (q.includes('stock') || q.includes('restock') || q.includes('low') || q.includes('alert') || q.includes('empty')) return AI_RESPONSES.stock
  if (q.includes('profit') || q.includes('increase') || q.includes('improve') || q.includes('better')) return AI_RESPONSES.profit
  if (q.includes('recommend') || q.includes('promote') || q.includes('deal') || q.includes('offer') || q.includes('today')) return AI_RESPONSES.recommend
  if (q.includes('forecast') || q.includes('tomorrow') || q.includes('predict') || q.includes('demand')) return AI_RESPONSES.forecast
  if (q.includes('top') || q.includes('best') || q.includes('selling') || q.includes('popular')) return AI_RESPONSES.top
  return AI_RESPONSES.default
}

// ── Shared card style ────────────────────────────────────────────────────────
const card = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.05)',
}

// ── Tab: Revenue ─────────────────────────────────────────────────────────────
function RevenueTab() {
  const max = Math.max(...REVENUE_DATA.hourly.map((h) => h.amt))

  return (
    <div className="flex flex-col gap-3">
      {/* Today's headline */}
      <div className="p-4" style={card}>
        <p className="text-black/40 text-xs font-light mb-1">Total Revenue</p>
        <p className="text-black text-3xl font-bold" style={{ letterSpacing: '-1px' }}>
          {REVENUE_DATA.today}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs font-medium" style={{ color: '#34c759' }}>▲ 8.4%</span>
          <span className="text-black/30 text-xs">vs yesterday {REVENUE_DATA.yesterday}</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Orders', value: REVENUE_DATA.orders },
          { label: 'Avg Order', value: REVENUE_DATA.avgOrder },
          { label: 'Peak Hour', value: REVENUE_DATA.peakHour },
        ].map((s) => (
          <div key={s.label} className="p-3 text-center" style={card}>
            <p className="text-black font-bold text-sm">{s.value}</p>
            <p className="text-black/35 text-[10px] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hourly bar chart */}
      <div className="p-4" style={card}>
        <p className="text-black font-semibold text-sm mb-3">Hourly Sales</p>
        <div className="flex items-end gap-1 h-20">
          {REVENUE_DATA.hourly.map((h) => (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm"
                style={{
                  height: `${(h.amt / max) * 72}px`,
                  background: h.hour === '4PM' ? '#007aff' : 'rgba(0,122,255,0.2)',
                }}
              />
              <span className="text-[8px] text-black/30">{h.hour}</span>
            </div>
          ))}
        </div>
        <p className="text-black/35 text-[10px] mt-2 text-center">
          Peak: {REVENUE_DATA.peakHour} · ₹1,100
        </p>
      </div>

      {/* Save or Lose widget */}
      <div
        className="p-4 rounded-[16px]"
        style={{ background: 'linear-gradient(135deg,#ff3b30 0%,#ff6b35 100%)', border: 'none' }}
      >
        <p className="text-white/70 text-[10px] font-light mb-1">⚡ URGENT INSIGHT</p>
        <p className="text-white font-semibold text-sm leading-snug">
          You will lose <span className="font-bold">₹1,400</span> today if Coca-Cola goes out of stock in the next 2 hours.
        </p>
        <p className="text-white/60 text-[10px] mt-2">Restock now → prevent revenue loss</p>
      </div>
    </div>
  )
}

// ── Tab: Top Products ─────────────────────────────────────────────────────────
function TopProductsTab() {
  const maxSold = Math.max(...TOP_PRODUCTS.map((p) => p.sold))

  return (
    <div className="flex flex-col gap-3">
      <div className="p-4" style={card}>
        <p className="text-black/40 text-xs font-light">Ranked by units sold today</p>
        <p className="text-black font-semibold text-base mt-0.5">Top Selling Products</p>
      </div>

      {TOP_PRODUCTS.map((p) => (
        <div key={p.name} className="p-4" style={card}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: p.rank === 1 ? '#ff9500' : p.rank === 2 ? '#8e8e93' : p.rank === 3 ? '#a2845e' : '#007aff',
                }}
              >
                {p.rank}
              </span>
              <div>
                <p className="text-black font-medium text-sm">{p.name}</p>
                <p className="text-black/35 text-[10px]">{p.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-black font-semibold text-sm">{p.revenue}</p>
              <p
                className="text-[10px] font-medium"
                style={{ color: p.trend.startsWith('+') ? '#34c759' : '#ff3b30' }}
              >
                {p.trend}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${(p.sold / maxSold) * 100}%`,
                background: p.rank === 1 ? '#ff9500' : '#007aff',
              }}
            />
          </div>
          <p className="text-black/35 text-[10px] mt-1">{p.sold} units sold</p>
        </div>
      ))}
    </div>
  )
}

// ── Tab: Red Alerts ───────────────────────────────────────────────────────────
function RedAlertsTab() {
  const urgencyConfig = {
    critical: { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)', label: 'CRITICAL' },
    high: { color: '#ff9500', bg: 'rgba(255,149,0,0.1)', label: 'HIGH' },
    medium: { color: '#ffcc00', bg: 'rgba(255,204,0,0.1)', label: 'MEDIUM' },
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Summary banner */}
      <div
        className="p-4 rounded-[16px] flex items-center gap-3"
        style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.15)' }}
      >
        <span className="text-2xl">🚨</span>
        <div>
          <p className="text-[#ff3b30] font-semibold text-sm">{RED_ALERTS.length} Active Alerts</p>
          <p className="text-black/50 text-xs">1 critical · 2 high · 1 medium</p>
        </div>
      </div>

      {/* Alert cards */}
      {RED_ALERTS.map((a) => {
        const cfg = urgencyConfig[a.urgency]
        const pct = Math.round((a.stock / a.threshold) * 100)
        return (
          <div key={a.name} className="p-4" style={card}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-black font-medium text-sm">{a.name}</p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                {cfg.label}
              </span>
            </div>

            {/* Stock bar */}
            <div className="w-full h-2 rounded-full mb-2" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: cfg.color }}
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-black/50 text-xs">
                {a.stock} {a.unit} left · threshold {a.threshold}
              </p>
              {a.loss && (
                <p className="text-xs font-medium" style={{ color: '#ff3b30' }}>
                  Risk: {a.loss} loss
                </p>
              )}
            </div>
          </div>
        )
      })}

      {/* Demand forecast */}
      <div
        className="p-4 rounded-[16px]"
        style={{ background: 'linear-gradient(135deg,#007aff 0%,#5856d6 100%)' }}
      >
        <p className="text-white/70 text-[10px] mb-1">📈 DEMAND FORECAST</p>
        <p className="text-white font-semibold text-sm leading-snug">
          Cold drinks predicted high demand tomorrow. Restock 20+ units tonight.
        </p>
        <p className="text-white/60 text-[10px] mt-2">Powered by sales trend analysis</p>
      </div>
    </div>
  )
}

// ── Tab: AI Assistant ─────────────────────────────────────────────────────────
function AIAssistantTab() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "👋 Hi! I'm **StoreGenie**, your AI business assistant. Ask me anything about your store — revenue, stock, what to promote, or how to increase profits today!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const quickPrompts = [
    'What should I restock?',
    'How to increase profits today?',
    'Show me top selling products',
    "Tomorrow's forecast?",
  ]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = (text) => {
    const q = text || input.trim()
    if (!q) return
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', text: getAIResponse(q) }])
      setLoading(false)
    }, 900)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') send()
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="p-4 pb-2" style={card}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg,#007aff,#5856d6)' }}
          >
            ✨
          </div>
          <div>
            <p className="text-black font-semibold text-sm">StoreGenie</p>
            <p className="text-black/35 text-[10px]">AI Business Copilot · Always on</p>
          </div>
          <span
            className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(52,199,89,0.12)', color: '#34c759' }}
          >
            ● Live
          </span>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 overflow-x-auto py-2 px-0 no-scrollbar">
        {quickPrompts.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full active:opacity-70 transition-opacity"
            style={{ background: 'rgba(0,122,255,0.1)', color: '#007aff', whiteSpace: 'nowrap' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 py-2" style={{ minHeight: 0 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] px-3 py-2 rounded-[14px] text-xs leading-relaxed"
              style={
                m.role === 'user'
                  ? { background: '#007aff', color: '#fff', borderBottomRightRadius: 4 }
                  : { background: '#fff', color: '#000', borderBottomLeftRadius: 4, ...card }
              }
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-3 py-2 rounded-[14px] text-xs"
              style={{ background: '#fff', ...card, borderBottomLeftRadius: 4 }}
            >
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-black/25 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-black/25 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-black/25 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask StoreGenie anything…"
          className="flex-1 rounded-[12px] px-3 py-2.5 text-black text-xs font-light placeholder-black/25 outline-none"
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim()}
          className="text-white text-xs font-semibold rounded-[12px] px-4 py-2.5 active:scale-95 transition-transform disabled:opacity-40"
          style={{ background: '#007aff' }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'revenue', label: 'Revenue', icon: '💰' },
  { id: 'products', label: 'Top Sellers', icon: '🏆' },
  { id: 'alerts', label: 'Alerts', icon: '🚨' },
  { id: 'ai', label: 'StoreGenie', icon: '✨' },
]

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('revenue')

  const renderTab = () => {
    switch (activeTab) {
      case 'revenue': return <RevenueTab />
      case 'products': return <TopProductsTab />
      case 'alerts': return <RedAlertsTab />
      case 'ai': return <AIAssistantTab />
      default: return <RevenueTab />
    }
  }

  return (
    <div className="h-full w-full flex flex-col" style={{ background: '#f2f2f7' }}>

      {/* Sticky header */}
      <div
        className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0"
        style={{
          background: 'rgba(242,242,247,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div>
          <p className="text-black/40 text-xs font-light">Store Dashboard</p>
          <h2 className="text-black font-semibold text-base mt-0.5" style={{ letterSpacing: '-0.2px' }}>
            shopkeeper@gmail.com
          </h2>
        </div>
        <button
          onClick={onLogout}
          className="text-[#ff3b30] text-sm font-medium px-3.5 py-1.5 rounded-full active:opacity-70"
          style={{ background: 'rgba(255,59,48,0.1)' }}
        >
          Sign Out
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="flex shrink-0 px-3 pt-2 pb-1 gap-1 overflow-x-auto no-scrollbar"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all active:scale-95"
            style={
              activeTab === t.id
                ? { background: '#007aff', color: '#fff' }
                : { background: 'transparent', color: 'rgba(0,0,0,0.45)' }
            }
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className={`flex-1 overflow-y-auto px-4 pt-4 pb-10 ${activeTab === 'ai' ? 'flex flex-col' : ''}`}
        style={{ minHeight: 0 }}
      >
        {renderTab()}
      </div>
    </div>
  )
}
