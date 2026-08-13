import { useState, useEffect, useRef, useMemo } from 'react'
import AIChat from '../AIChat/AIChat'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  PRODUCTS as INITIAL_PRODUCTS,
  getCriticalStock,
  getLowStock,
  getExpiringSoon,
  getDroppingSales,
} from '../../data/products'
import { getOffers, saveOffers, addOffer, toggleOffer, deleteOffer, TAG_COLORS } from '../../data/offersStore'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

// Map backend product shape → frontend shape
function mapBackendProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    costPrice: p.cost_price,
    sellPrice: p.sell_price,
    stock: p.stock,
    threshold: p.threshold,
    unit: p.unit,
    expiryDate: p.expiry_date,
    soldToday: p.sold_today,
    soldYesterday: p.sold_yesterday,
    barcode: p.barcode,
  }
}

const card = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.05)',
}

function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function uniquePaidTransactions(transactions) {
  const receipts = new Set()
  return transactions.filter(transaction => {
    if (!transaction.receipt_id || receipts.has(transaction.receipt_id) || Number(transaction.total) <= 0) return false
    receipts.add(transaction.receipt_id)
    return true
  })
}

function itemsCost(items, products) {
  const productById = new Map(products.map(product => [Number(product.id), product]))
  return (Array.isArray(items) ? items : []).reduce((sum, item) => {
    const product = productById.get(Number(item.id))
    return sum + (Number(product?.costPrice) || 0) * (Number(item.qty) || 0)
  }, 0)
}

function getTransactionStats(transactions, products) {
  const today = dateKey(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = dateKey(yesterdayDate)
  const totals = { revenue: 0, profit: 0, todayUnits: new Map(), yesterdayUnits: new Map(), allUnits: new Map() }

  transactions.forEach(transaction => {
    const key = dateKey(transaction.created_at)
    const items = Array.isArray(transaction.items) ? transaction.items : []
    const transactionTotal = Number(transaction.total) || 0
    const cost = itemsCost(items, products)
    if (key === today) {
      totals.revenue += transactionTotal
      totals.profit += transactionTotal - cost
    }
    items.forEach(item => {
      const id = Number(item.id)
      const qty = Number(item.qty) || 0
      const current = totals.allUnits.get(id) || { id, name: item.name, qty: 0 }
      totals.allUnits.set(id, { ...current, qty: current.qty + qty })
      if (key === today) totals.todayUnits.set(id, (totals.todayUnits.get(id) || 0) + qty)
      if (key === yesterday) totals.yesterdayUnits.set(id, (totals.yesterdayUnits.get(id) || 0) + qty)
    })
  })

  return totals
}

export default function Dashboard({ onLogout }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [expandedSection, setExpandedSection] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [toast, setToast] = useState(null)          // { text, type }
  const [transactions, setTransactions] = useState([])
  const prevProductsRef = useRef(null)
  const prevTransactionsRef = useRef(null)

  // Fetch live products from backend
  const fetchProducts = () => {
    fetch(`${BACKEND_URL}/products/`)
      .then(r => r.json())
      .then(data => {
        const mapped = data.map(mapBackendProduct)
        // Detect stock change vs previous fetch → show toast
        if (prevProductsRef.current) {
          const prev = prevProductsRef.current
          const changed = mapped.find(p => {
            const old = prev.find(o => o.id === p.id)
            return old && old.stock !== p.stock
          })
          if (changed) {
            const old = prev.find(o => o.id === changed.id)
            showToast(`🛒 New sale! ${changed.name} stock: ${old.stock} → ${changed.stock}`, 'success')
          }
        }
        prevProductsRef.current = mapped
        setProducts(mapped)
        setLastRefresh(new Date())
      })
      .catch(() => {
        console.warn('Dashboard: backend offline, using seed data')
      })
  }

  const fetchTransactions = () => {
    fetch(`${BACKEND_URL}/cart/transactions`)
      .then(r => r.json())
      .then(data => {
        const latest = uniquePaidTransactions(data).slice(0, 50)
        if (prevTransactionsRef.current?.length && latest[0]?.id !== prevTransactionsRef.current[0]?.id) {
          showToast(`🧾 New checkout recorded: ₹${latest[0].total}`, 'success')
        }
        prevTransactionsRef.current = latest
        setTransactions(latest)
      })
      .catch(() => {})
  }

  const showToast = (text, type = 'info') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    fetchProducts()
    fetchTransactions()
    const productInterval = setInterval(fetchProducts, 10000)
    const txInterval = setInterval(fetchTransactions, 4000)
    return () => { clearInterval(productInterval); clearInterval(txInterval) }
  }, [])

  // Show iOS notification after login
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true)
      // Auto hide after 5 seconds
      setTimeout(() => setShowNotification(false), 5000)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const transactionStats = useMemo(() => getTransactionStats(transactions, products), [transactions, products])
  const revenue = transactionStats.revenue
  const profit = transactionStats.profit
  const topSellers = [...transactionStats.allUnits.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
    .map(item => ({ ...item, category: products.find(product => Number(product.id) === item.id)?.category || 'Product', soldToday: item.qty }))

  return (
    <div className="h-full w-full flex flex-col relative" style={{ background: '#f2f2f7' }}>

      {/* ── Live Sale Toast ── */}
      {toast && (
        <div
          className="absolute top-2 left-4 right-4 z-50"
          style={{ animation: 'slideDown 0.3s ease' }}
        >
          <div
            className="rounded-[14px] px-4 py-3 flex items-center gap-3 shadow-xl"
            style={{
              background: toast.type === 'success' ? 'rgba(52,199,89,0.95)' : 'rgba(0,122,255,0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <span className="text-xl">🛒</span>
            <p className="text-white text-xs font-medium flex-1">{toast.text}</p>
            <button onClick={() => setToast(null)} className="text-white/60 text-sm active:opacity-60">✕</button>
          </div>
        </div>
      )}
      {/* iOS WhatsApp Notification */}
      {showNotification && (
        <div
          className="absolute top-2 left-4 right-4 z-50 animate-slide-down"
          onClick={() => setShowNotification(false)}
        >
          <div
            className="rounded-[18px] p-3 flex items-start gap-3 shadow-2xl backdrop-blur-xl"
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0"
              style={{ background: '#25d366' }}
            >
              💬
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-black font-semibold text-xs">WhatsApp</p>
                <p className="text-black/40 text-[10px]">now</p>
              </div>
              <p className="text-black/60 text-[11px] font-medium mb-0.5">CartAI Store Assistant</p>
              <p className="text-black text-xs leading-snug">
                🚨 Critical: Coca-Cola 2L down to 2 bottles! Restock now to avoid ₹1,400 loss today.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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
          {lastRefresh && (
            <p className="text-[10px] mt-0.5" style={{ color: '#34c759' }}>
              🟢 Live · {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchProducts(); fetchTransactions() }}
            className="text-[#007aff] text-xs font-medium px-3 py-1.5 rounded-full active:opacity-70"
            style={{ background: 'rgba(0,122,255,0.1)' }}
          >
            ↻ Refresh
          </button>
          <button
            onClick={onLogout}
            className="text-[#ff3b30] text-sm font-medium px-3.5 py-1.5 rounded-full active:opacity-70"
            style={{ background: 'rgba(255,59,48,0.1)' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ minHeight: 0 }}>
        {/* 1. Revenue Today */}
        <div className="mb-3 p-4" style={card}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black/40 text-xs font-light">Revenue Today</p>
              <p className="text-black text-2xl font-bold mt-1" style={{ letterSpacing: '-0.5px' }}>
                ₹{revenue.toLocaleString('en-IN')}
              </p>
              <p className="text-xs mt-1">
                <span className="font-medium" style={{ color: '#34c759' }}>
                  Profit: ₹{profit.toLocaleString('en-IN')}
                </span>
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* 2. Sales Chart — Today vs Yesterday */}
        <SalesChartSection
          products={products}
          transactionStats={transactionStats}
          expanded={expandedSection === 'chart'}
          onToggle={() => toggleSection('chart')}
        />

        {/* 3. Calendar - Earnings Tracker */}
        <CalendarSection
          transactions={transactions}
          products={products}
          expanded={expandedSection === 'calendar'}
          onToggle={() => toggleSection('calendar')}
        />

        {/* 3. Top Selling Products */}
        <SectionBar
          title="Top Selling Products"
          icon="🏆"
          count={topSellers.length}
          expanded={expandedSection === 'top'}
          onToggle={() => toggleSection('top')}
        >
          <div className="flex flex-col gap-2 mt-3">
            {topSellers.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-[12px]"
                style={{ background: '#f2f2f7' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{
                      background: i === 0 ? '#ff9500' : i === 1 ? '#8e8e93' : i === 2 ? '#a2845e' : '#007aff',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-black text-sm font-medium">{p.name}</p>
                    <p className="text-black/40 text-[10px]">{p.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-black text-sm font-semibold">{p.soldToday}</p>
                  <p className="text-black/40 text-[10px]">units sold</p>
                </div>
              </div>
            ))}
          </div>
        </SectionBar>

        {/* 3. Red Alerts */}
        <RedAlertsSection
          products={products}
          setProducts={setProducts}
          expanded={expandedSection === 'alerts'}
          onToggle={() => toggleSection('alerts')}
        />

        {/* 4. Add Sale */}
        <AddSaleSection
          products={products}
          setProducts={setProducts}
          expanded={expandedSection === 'sale'}
          onToggle={() => toggleSection('sale')}
        />

        {/* 5. Products List */}
        <ProductsListSection
          products={products}
          setProducts={setProducts}
          expanded={expandedSection === 'products'}
          onToggle={() => toggleSection('products')}
        />

        {/* 6. WhatsApp Alerts */}
        <WhatsAppAlertsSection
          expanded={expandedSection === 'whatsapp'}
          onToggle={() => toggleSection('whatsapp')}
        />

        {/* 7. Offers Manager */}
        <OffersManagerSection
          expanded={expandedSection === 'offers'}
          onToggle={() => toggleSection('offers')}
        />

        {/* 8. Demand Forecast */}
        <DemandForecastSection
          products={products}
          expanded={expandedSection === 'forecast'}
          onToggle={() => toggleSection('forecast')}
        />

        {/* 8. Recent Transactions */}
        <RecentTransactionsSection
          transactions={transactions}
          expanded={expandedSection === 'transactions'}
          onToggle={() => toggleSection('transactions')}
        />
      </div>

      {/* AI Chat */}
      <AIChat products={products} />
    </div>
  )
}

// ── Sales Chart Section ────────────────────────────────────────────
const CHART_COLORS = ['#007aff','#34c759','#ff9500','#ff3b30','#5856d6','#ff2d55','#af52de']

function SalesChartSection({ transactionStats, expanded, onToggle }) {
  const chartData = [...transactionStats.allUnits.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6)
    .map(item => ({
      name: item.name.length > 10 ? item.name.slice(0, 9) + '…' : item.name,
      Today: transactionStats.todayUnits.get(item.id) || 0,
      Yesterday: transactionStats.yesterdayUnits.get(item.id) || 0,
    }))

  return (
    <SectionBar
      title="Sales Chart"
      icon="📈"
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3">
        <p className="text-black/40 text-[10px] mb-3">Completed checkout units — Today vs Yesterday</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barCategoryGap="30%" barGap={2}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: 'rgba(0,0,0,0.5)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: 'rgba(0,0,0,0.4)' }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              contentStyle={{ borderRadius: 10, fontSize: 11, border: '1px solid rgba(0,0,0,0.08)' }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="Today" fill="#007aff" radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="Yesterday" fill="rgba(0,122,255,0.25)" radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 justify-center mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#007aff' }} />
            <span className="text-[10px] text-black/50">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(0,122,255,0.25)' }} />
            <span className="text-[10px] text-black/50">Yesterday</span>
          </div>
        </div>
      </div>
    </SectionBar>
  )
}

// Collapsible section bar component
function SectionBar({ title, icon, count, expanded, onToggle, children }) {
  return (
    <div className="mb-3 animate-fade-in">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between active:opacity-70 transition-all duration-200"
        style={card}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <p className="text-black font-semibold text-sm">{title}</p>
            {count !== undefined && (
              <p className="text-black/40 text-[10px]">{count} items</p>
            )}
          </div>
        </div>
        <span 
          className="text-black/30 text-lg transition-transform duration-300" 
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          ▼
        </span>
      </button>
      {expanded && (
        <div 
          className="px-4 pb-4 pt-0 animate-slide-down" 
          style={{ ...card, marginTop: -12, paddingTop: 12, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// Calendar Earnings Tracker Section
function CalendarSection({ transactions, products, expanded, onToggle }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDayDetail, setShowDayDetail] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  
  const earningsData = useMemo(() => transactions.reduce((data, transaction) => {
    const key = dateKey(transaction.created_at)
    if (!key) return data
    const current = data[key] || { revenue: 0, orders: 0, profit: 0 }
    const costs = itemsCost(transaction.items, products)
    data[key] = {
      revenue: current.revenue + (Number(transaction.total) || 0),
      orders: current.orders + 1,
      profit: current.profit + (Number(transaction.total) || 0) - costs,
    }
    return data
  }, {}), [transactions, products])
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth, year, month }
  }

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(selectedDate)
  
  const getDateKey = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getEarningLevel = (amount) => {
    if (!amount) return 'none'
    if (amount < 2500) return 'low'
    if (amount < 4000) return 'medium'
    return 'high'
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`
  const totalMonthEarnings = Object.entries(earningsData)
    .filter(([key]) => key.startsWith(monthPrefix))
    .reduce((sum, [, value]) => sum + value.revenue, 0)
  const avgDailyEarnings = Math.floor(totalMonthEarnings / daysInMonth)

  const handleDayClick = (day) => {
    setSelectedDay(day)
    setShowDayDetail(true)
  }

  return (
    <SectionBar
      title="Earnings Calendar"
      icon="📅"
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3">
        {/* Month stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-3 rounded-[12px]" style={{ background: '#f2f2f7' }}>
            <p className="text-black/40 text-[10px]">This Month</p>
            <p className="text-black text-lg font-bold">₹{totalMonthEarnings.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 rounded-[12px]" style={{ background: '#f2f2f7' }}>
            <p className="text-black/40 text-[10px]">Daily Average</p>
            <p className="text-black text-lg font-bold">₹{avgDailyEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Calendar header */}
        <div className="mb-2">
          <p className="text-black font-semibold text-sm text-center">{monthNames[month]} {year}</p>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-black/40 text-[10px] font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateKey = getDateKey(day)
            const dayData = earningsData[dateKey]
            const earnings = dayData?.revenue || 0
            const level = getEarningLevel(earnings)
            const isToday = day === new Date().getDate() && month === new Date().getMonth()
            
            const levelColors = {
              none: 'rgba(0,0,0,0.05)',
              low: 'rgba(255,149,0,0.3)',
              medium: 'rgba(52,199,89,0.5)',
              high: 'rgba(52,199,89,0.9)',
            }

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className="aspect-square rounded-[8px] flex flex-col items-center justify-center text-[10px] font-medium active:scale-95 transition-transform relative"
                style={{
                  background: levelColors[level],
                  border: isToday ? '2px solid #007aff' : 'none',
                }}
              >
                <span className={isToday ? 'text-[#007aff] font-bold' : 'text-black'}>{day}</span>
                {earnings && (
                  <span className="text-[8px] text-black/60 mt-0.5">
                    {earnings > 999 ? `${Math.floor(earnings / 1000)}k` : earnings}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: 'rgba(255,149,0,0.3)' }} />
            <span className="text-[10px] text-black/50">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: 'rgba(52,199,89,0.5)' }} />
            <span className="text-[10px] text-black/50">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: 'rgba(52,199,89,0.9)' }} />
            <span className="text-[10px] text-black/50">High</span>
          </div>
        </div>

        {/* Day Detail Modal */}
        {showDayDetail && selectedDay && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDayDetail(false)}
          >
            <div
              className="bg-white rounded-[20px] p-5 w-[280px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-black font-semibold text-base">
                  {monthNames[month]} {selectedDay}, {year}
                </h3>
                <button
                  onClick={() => setShowDayDetail(false)}
                  className="text-black/40 text-xl"
                >
                  ✕
                </button>
              </div>

              {earningsData[getDateKey(selectedDay)] ? (
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-[12px]" style={{ background: '#f2f2f7' }}>
                    <p className="text-black/40 text-xs mb-1">Revenue</p>
                    <p className="text-black text-2xl font-bold">
                      ₹{earningsData[getDateKey(selectedDay)].revenue.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-[12px]" style={{ background: '#f2f2f7' }}>
                      <p className="text-black/40 text-[10px] mb-1">Orders</p>
                      <p className="text-black text-lg font-bold">
                        {earningsData[getDateKey(selectedDay)].orders}
                      </p>
                    </div>
                    <div className="p-3 rounded-[12px]" style={{ background: '#f2f2f7' }}>
                      <p className="text-black/40 text-[10px] mb-1">Profit</p>
                      <p className="text-black text-lg font-bold">
                        ₹{earningsData[getDateKey(selectedDay)].profit.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDayDetail(false)}
                    className="w-full py-2.5 rounded-[12px] text-white font-semibold text-sm"
                    style={{ background: '#007aff' }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <p className="text-black/40 text-sm text-center py-4">No data for this day</p>
              )}
            </div>
          </div>
        )}
      </div>
    </SectionBar>
  )
}

// Red Alerts Section
function RedAlertsSection({ products, setProducts, expanded, onToggle }) {
  const critical = getCriticalStock(products)
  const low = getLowStock(products)
  const expiring = getExpiringSoon(products)
  const dropping = getDroppingSales(products)

  const allAlerts = critical.length + low.length + expiring.length + dropping.length

  const toggleRestocked = (productId) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.threshold + 10 } : p))
    )
  }

  return (
    <SectionBar
      title="Red Alerts"
      icon="🚨"
      count={allAlerts}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="flex flex-col gap-3 mt-3">
        {/* Critical Stock */}
        {(critical.length > 0 || low.length > 0) && (
          <div>
            <p className="text-black/50 text-[10px] font-medium mb-2">⚠️ CRITICAL STOCK</p>
            {[...critical, ...low].map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-[12px] mb-2"
                style={{ background: p.stock <= p.threshold * 0.2 ? 'rgba(255,59,48,0.08)' : 'rgba(255,149,0,0.08)' }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    onChange={() => toggleRestocked(p.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-black text-xs font-medium">{p.name}</p>
                    <p className="text-black/50 text-[10px]">
                      Only {p.stock} {p.unit} left (need {p.threshold})
                    </p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: p.stock <= p.threshold * 0.2 ? 'rgba(255,59,48,0.15)' : 'rgba(255,149,0,0.15)',
                    color: p.stock <= p.threshold * 0.2 ? '#ff3b30' : '#ff9500',
                  }}
                >
                  {p.stock <= p.threshold * 0.2 ? 'CRITICAL' : 'LOW'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expiring Soon */}
        {expiring.length > 0 && (
          <div>
            <p className="text-black/50 text-[10px] font-medium mb-2">📅 EXPIRING SOON</p>
            {expiring.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-[12px] mb-2"
                style={{ background: 'rgba(255,204,0,0.08)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black text-xs font-medium">{p.name}</p>
                    <p className="text-black/50 text-[10px]">
                      Expires: {new Date(p.expiryDate).toLocaleDateString()} · {p.stock} {p.unit} left
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,204,0,0.15)', color: '#cc9900' }}>
                    URGENT
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dropping Sales */}
        {dropping.length > 0 && (
          <div>
            <p className="text-black/50 text-[10px] font-medium mb-2">📉 DROPPING SALES</p>
            {dropping.map((p) => {
              const dropPercent = Math.round(((p.soldYesterday - p.soldToday) / p.soldYesterday) * 100)
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-[12px] mb-2"
                  style={{ background: 'rgba(88,86,214,0.08)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-xs font-medium">{p.name}</p>
                      <p className="text-black/50 text-[10px]">
                        Today: {p.soldToday} · Yesterday: {p.soldYesterday} ({dropPercent}% drop)
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(88,86,214,0.15)', color: '#5856d6' }}>
                      REDUCE RESTOCK
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {allAlerts === 0 && (
          <p className="text-black/40 text-xs text-center py-4">✅ No alerts — Everything looks good!</p>
        )}
      </div>
    </SectionBar>
  )
}

// Add Sale Section
function AddSaleSection({ products, setProducts, expanded, onToggle }) {
  const [saleType, setSaleType] = useState('single') // 'single' or 'combo'
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [comboItems, setComboItems] = useState([])
  const [comboDiscount, setComboDiscount] = useState(0)

  const addComboItem = () => {
    if (selectedProduct && quantity > 0) {
      const product = products.find((p) => p.id === parseInt(selectedProduct))
      if (product) {
        setComboItems([...comboItems, { product, quantity }])
        setSelectedProduct('')
        setQuantity(1)
      }
    }
  }

  const removeComboItem = (index) => {
    setComboItems(comboItems.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    if (saleType === 'single' && selectedProduct) {
      const product = products.find((p) => p.id === parseInt(selectedProduct))
      if (product) {
        const subtotal = product.sellPrice * quantity
        return subtotal - (subtotal * discount) / 100
      }
    } else if (saleType === 'combo') {
      const subtotal = comboItems.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0)
      return subtotal - (subtotal * comboDiscount) / 100
    }
    return 0
  }

  const processSale = () => {
    if (saleType === 'single' && selectedProduct && quantity > 0) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === parseInt(selectedProduct)
            ? { ...p, soldToday: p.soldToday + quantity, stock: Math.max(0, p.stock - quantity) }
            : p
        )
      )
      setSelectedProduct('')
      setQuantity(1)
      setDiscount(0)
      alert(`Sale added! Total: ₹${calculateTotal().toFixed(2)}`)
    } else if (saleType === 'combo' && comboItems.length > 0) {
      setProducts((prev) =>
        prev.map((p) => {
          const comboItem = comboItems.find((item) => item.product.id === p.id)
          if (comboItem) {
            return {
              ...p,
              soldToday: p.soldToday + comboItem.quantity,
              stock: Math.max(0, p.stock - comboItem.quantity),
            }
          }
          return p
        })
      )
      setComboItems([])
      setComboDiscount(0)
      alert(`Combo sale added! Total: ₹${calculateTotal().toFixed(2)}`)
    }
  }

  return (
    <SectionBar
      title="Add Sale"
      icon="➕"
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3">
        {/* Sale type toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSaleType('single')}
            className="flex-1 py-2 rounded-[10px] text-xs font-semibold transition-all"
            style={{
              background: saleType === 'single' ? '#007aff' : '#f2f2f7',
              color: saleType === 'single' ? '#fff' : '#000',
            }}
          >
            Single Item
          </button>
          <button
            onClick={() => setSaleType('combo')}
            className="flex-1 py-2 rounded-[10px] text-xs font-semibold transition-all"
            style={{
              background: saleType === 'combo' ? '#007aff' : '#f2f2f7',
              color: saleType === 'combo' ? '#fff' : '#000',
            }}
          >
            Combo
          </button>
        </div>

        {saleType === 'single' ? (
          <div className="flex flex-col gap-2">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2.5 rounded-[10px] text-xs outline-none"
              style={{ background: '#f2f2f7' }}
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ₹{p.sellPrice} (Stock: {p.stock})
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Qty"
                className="flex-1 p-2.5 rounded-[10px] text-xs outline-none"
                style={{ background: '#f2f2f7' }}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                placeholder="Discount %"
                className="flex-1 p-2.5 rounded-[10px] text-xs outline-none"
                style={{ background: '#f2f2f7' }}
              />
            </div>

            <div className="p-3 rounded-[10px]" style={{ background: '#f2f2f7' }}>
              <p className="text-black/50 text-[10px]">Total</p>
              <p className="text-black text-lg font-bold">₹{calculateTotal().toFixed(2)}</p>
            </div>

            <button
              onClick={processSale}
              disabled={!selectedProduct || quantity <= 0}
              className="w-full py-3 rounded-[12px] text-white font-semibold text-sm active:scale-98 transition-transform disabled:opacity-40"
              style={{ background: '#34c759' }}
            >
              Add Sale
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex-1 p-2.5 rounded-[10px] text-xs outline-none"
                style={{ background: '#f2f2f7' }}
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ₹{p.sellPrice}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Qty"
                className="w-16 p-2.5 rounded-[10px] text-xs outline-none"
                style={{ background: '#f2f2f7' }}
              />
              <button
                onClick={addComboItem}
                className="px-3 py-2.5 rounded-[10px] text-white font-semibold text-xs"
                style={{ background: '#007aff' }}
              >
                +
              </button>
            </div>

            {comboItems.length > 0 && (
              <div className="flex flex-col gap-1">
                {comboItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-[8px]"
                    style={{ background: '#f2f2f7' }}
                  >
                    <p className="text-xs text-black">
                      {item.product.name} × {item.quantity}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">₹{item.product.sellPrice * item.quantity}</p>
                      <button
                        onClick={() => removeComboItem(i)}
                        className="text-[#ff3b30] text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              type="number"
              min="0"
              max="100"
              value={comboDiscount}
              onChange={(e) => setComboDiscount(parseInt(e.target.value) || 0)}
              placeholder="Combo discount %"
              className="w-full p-2.5 rounded-[10px] text-xs outline-none"
              style={{ background: '#f2f2f7' }}
            />

            <div className="p-3 rounded-[10px]" style={{ background: '#f2f2f7' }}>
              <p className="text-black/50 text-[10px]">Combo Total</p>
              <p className="text-black text-lg font-bold">₹{calculateTotal().toFixed(2)}</p>
            </div>

            <button
              onClick={processSale}
              disabled={comboItems.length === 0}
              className="w-full py-3 rounded-[12px] text-white font-semibold text-sm active:scale-98 transition-transform disabled:opacity-40"
              style={{ background: '#34c759' }}
            >
              Add Combo Sale
            </button>
          </div>
        )}
      </div>
    </SectionBar>
  )
}

// Products List Section
function ProductsListSection({ products, setProducts, expanded, onToggle }) {
  const [adding, setAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    costPrice: '',
    sellPrice: '',
    stock: '',
    threshold: '',
    unit: '',
    expiryDate: '',
  })

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addProduct = () => {
    if (newProduct.name && newProduct.sellPrice && newProduct.stock) {
      const product = {
        id: Math.max(...products.map((p) => p.id)) + 1,
        name: newProduct.name,
        category: newProduct.category || 'Other',
        costPrice: parseInt(newProduct.costPrice) || 0,
        sellPrice: parseInt(newProduct.sellPrice),
        stock: parseInt(newProduct.stock),
        threshold: parseInt(newProduct.threshold) || 10,
        unit: newProduct.unit || 'units',
        expiryDate: newProduct.expiryDate || '2027-12-31',
        soldToday: 0,
        soldYesterday: 0,
        barcode: `890126234${Math.random().toString().slice(2, 6)}`,
      }
      setProducts([...products, product])
      setNewProduct({
        name: '',
        category: '',
        costPrice: '',
        sellPrice: '',
        stock: '',
        threshold: '',
        unit: '',
        expiryDate: '',
      })
      setAdding(false)
    }
  }

  return (
    <SectionBar
      title="Products List"
      icon="📦"
      count={products.length}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3">
        <button
          onClick={() => setAdding(!adding)}
          className="w-full py-2.5 rounded-[10px] text-xs font-semibold mb-3 active:scale-98 transition-transform"
          style={{ background: '#007aff', color: '#fff' }}
        >
          {adding ? 'Cancel' : '+ Add New Product'}
        </button>

        {/* Search bar */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 rounded-[10px] text-xs outline-none"
            style={{ background: '#f2f2f7', border: '1px solid rgba(0,0,0,0.08)' }}
          />
        </div>

        {adding && (
          <div className="flex flex-col gap-2 mb-3 p-3 rounded-[12px]" style={{ background: '#f2f2f7' }}>
            <input
              type="text"
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="p-2 rounded-[8px] text-xs outline-none"
              style={{ background: '#fff' }}
            />
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="p-2 rounded-[8px] text-xs outline-none"
              style={{ background: '#fff' }}
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Cost ₹"
                value={newProduct.costPrice}
                onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                className="flex-1 p-2 rounded-[8px] text-xs outline-none"
                style={{ background: '#fff' }}
              />
              <input
                type="number"
                placeholder="Sell ₹"
                value={newProduct.sellPrice}
                onChange={(e) => setNewProduct({ ...newProduct, sellPrice: e.target.value })}
                className="flex-1 p-2 rounded-[8px] text-xs outline-none"
                style={{ background: '#fff' }}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="flex-1 p-2 rounded-[8px] text-xs outline-none"
                style={{ background: '#fff' }}
              />
              <input
                type="text"
                placeholder="Unit"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                className="flex-1 p-2 rounded-[8px] text-xs outline-none"
                style={{ background: '#fff' }}
              />
            </div>
            <input
              type="date"
              placeholder="Expiry date"
              value={newProduct.expiryDate}
              onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
              className="p-2 rounded-[8px] text-xs outline-none"
              style={{ background: '#fff' }}
            />
            <button
              onClick={addProduct}
              className="w-full py-2.5 rounded-[10px] text-xs font-semibold text-white"
              style={{ background: '#34c759' }}
            >
              Add Product
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {filteredProducts.length === 0 ? (
            <p className="text-black/40 text-xs text-center py-4">No products found</p>
          ) : (
            filteredProducts.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-[12px]"
              style={{ background: '#f2f2f7' }}
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-black text-sm font-medium">{p.name}</p>
                  <p className="text-black/40 text-[10px]">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-black text-xs font-semibold">₹{p.sellPrice}</p>
                  <p className="text-black/40 text-[10px]">Stock: {p.stock}</p>
                </div>
              </div>
              {/* Stock progress bar */}
              <div className="mb-2">
                {(() => {
                  const pct = Math.min(100, Math.round((p.stock / (p.threshold * 2)) * 100))
                  const color = p.stock <= p.threshold * 0.2 ? '#ff3b30'
                    : p.stock <= p.threshold * 0.5 ? '#ff9500'
                    : '#34c759'
                  return (
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[9px] text-black/40">Stock level</span>
                        <span className="text-[9px] font-medium" style={{ color }}>
                          {p.stock} / {p.threshold * 2} {p.unit}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,122,255,0.1)', color: '#007aff' }}>
                  Cost: ₹{p.costPrice}
                </span>
                <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,199,89,0.1)', color: '#34c759' }}>
                  Sold: {p.soldToday}
                </span>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </SectionBar>
  )
}

// WhatsApp Alerts Section
function WhatsAppAlertsSection({ expanded, onToggle }) {
  return (
    <SectionBar
      title="WhatsApp Alerts"
      icon="💬"
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3">
        <WhatsAppSettings />
      </div>
    </SectionBar>
  )
}

// WhatsApp Settings Component
function WhatsAppSettings() {
  const [enabled, setEnabled] = useState(true)
  const [phone, setPhone] = useState('+91 98765 43210')
  const [editingPhone, setEditingPhone] = useState(false)
  const [tempPhone, setTempPhone] = useState(phone)

  const alertTypes = [
    { id: 'critical', label: 'Critical Stock Alerts', icon: '🚨', on: true },
    { id: 'daily', label: 'Daily Sales Summary', icon: '📊', on: true },
    { id: 'expiry', label: 'Expiry Reminders', icon: '📅', on: false },
  ]

  const [toggles, setToggles] = useState(
    Object.fromEntries(alertTypes.map((a) => [a.id, a.on]))
  )

  return (
    <div>
      <p className="text-black font-semibold text-sm mb-3">💬 WhatsApp Alerts</p>
      
      {/* Master toggle */}
      <div className="flex items-center justify-between p-3 rounded-[12px] mb-3" style={{ background: '#f2f2f7' }}>
        <div>
          <p className="text-black text-xs font-medium">Enable WhatsApp Notifications</p>
          <p className="text-black/40 text-[10px]">{enabled ? 'Active' : 'Disabled'}</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className="w-12 h-7 rounded-full relative transition-colors duration-200"
          style={{ background: enabled ? '#34c759' : 'rgba(0,0,0,0.15)' }}
        >
          <span
            className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200"
            style={{ left: enabled ? '22px' : '2px' }}
          />
        </button>
      </div>

      {/* Phone number */}
      <div className="p-3 rounded-[12px] mb-3" style={{ background: '#f2f2f7' }}>
        <p className="text-black/40 text-[10px] font-medium mb-2">PHONE NUMBER</p>
        {editingPhone ? (
          <div className="flex gap-2">
            <input
              type="tel"
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value)}
              className="flex-1 text-xs text-black outline-none rounded-[8px] px-3 py-2"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}
              autoFocus
            />
            <button
              onClick={() => { setPhone(tempPhone); setEditingPhone(false) }}
              className="text-white text-xs font-semibold px-3 py-2 rounded-[8px]"
              style={{ background: '#007aff' }}
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📱</span>
              <p className="text-black font-medium text-xs">{phone}</p>
            </div>
            <button
              onClick={() => { setTempPhone(phone); setEditingPhone(true) }}
              className="text-[#007aff] text-xs font-medium active:opacity-60"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Alert types */}
      <div className="flex flex-col gap-2">
        {alertTypes.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between p-3 rounded-[12px]"
            style={{ background: '#f2f2f7' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{a.icon}</span>
              <p className="text-black text-xs font-medium">{a.label}</p>
            </div>
            <button
              onClick={() => setToggles((t) => ({ ...t, [a.id]: !t[a.id] }))}
              disabled={!enabled}
              className="w-10 h-6 rounded-full relative transition-colors duration-200"
              style={{
                background: enabled && toggles[a.id] ? '#007aff' : 'rgba(0,0,0,0.15)',
                opacity: enabled ? 1 : 0.4,
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
                style={{ left: enabled && toggles[a.id] ? '18px' : '2px' }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}


// ── Demand Forecast Section ───────────────────────────────────────
function DemandForecastSection({ products, expanded, onToggle }) {
  // Simple rule-based forecast: at current sell rate, how many hours of stock left?
  const forecasts = products
    .map(p => {
      // avg hourly sell rate (assume store open 12 hrs, use soldToday as proxy)
      const hourlyRate = p.soldToday > 0 ? p.soldToday / 12 : 0
      const hoursLeft = hourlyRate > 0 ? Math.round(p.stock / hourlyRate) : null
      const unitsNeeded = Math.max(0, p.threshold * 2 - p.stock)
      const revenueAtRisk = hoursLeft !== null && hoursLeft < 6
        ? Math.round(hourlyRate * Math.max(0, 6 - hoursLeft) * p.sellPrice)
        : 0
      return { ...p, hourlyRate, hoursLeft, unitsNeeded, revenueAtRisk }
    })
    .sort((a, b) => {
      // Sort: critical (< 3h) first, then low (< 8h), then rest
      const urgencyA = a.hoursLeft !== null && a.hoursLeft < 3 ? 0 : a.hoursLeft !== null && a.hoursLeft < 8 ? 1 : 2
      const urgencyB = b.hoursLeft !== null && b.hoursLeft < 3 ? 0 : b.hoursLeft !== null && b.hoursLeft < 8 ? 1 : 2
      return urgencyA - urgencyB
    })

  const criticalCount = forecasts.filter(f => f.hoursLeft !== null && f.hoursLeft < 3).length
  const warningCount = forecasts.filter(f => f.hoursLeft !== null && f.hoursLeft >= 3 && f.hoursLeft < 8).length

  return (
    <SectionBar
      title="Demand Forecast"
      icon="🔮"
      count={criticalCount + warningCount > 0 ? `${criticalCount + warningCount} need attention` : undefined}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3 flex flex-col gap-2">
        <p className="text-black/40 text-[10px] mb-1">
          Based on today's sales rate — estimated stock runway per product
        </p>
        {forecasts.map(p => {
          const isCritical = p.hoursLeft !== null && p.hoursLeft < 3
          const isWarning = p.hoursLeft !== null && p.hoursLeft >= 3 && p.hoursLeft < 8
          const color = isCritical ? '#ff3b30' : isWarning ? '#ff9500' : '#34c759'
          const bg = isCritical ? 'rgba(255,59,48,0.06)' : isWarning ? 'rgba(255,149,0,0.06)' : 'rgba(52,199,89,0.06)'

          return (
            <div key={p.id} className="p-3 rounded-[12px]" style={{ background: bg }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-black text-xs font-semibold">{p.name}</p>
                    {(isCritical || isWarning) && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: isCritical ? 'rgba(255,59,48,0.15)' : 'rgba(255,149,0,0.15)', color }}
                      >
                        {isCritical ? 'REORDER NOW' : 'REORDER SOON'}
                      </span>
                    )}
                  </div>
                  <p className="text-black/50 text-[10px]">
                    {p.stock} {p.unit} left · selling ~{p.hourlyRate.toFixed(1)}/hr
                  </p>
                  {p.revenueAtRisk > 0 && (
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: '#ff3b30' }}>
                      ⚠️ ₹{p.revenueAtRisk} revenue at risk
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm" style={{ color }}>
                    {p.hoursLeft !== null
                      ? p.hoursLeft < 1
                        ? '< 1h'
                        : p.hoursLeft > 48
                          ? '2+ days'
                          : `~${p.hoursLeft}h`
                      : '∞'
                    }
                  </p>
                  <p className="text-black/40 text-[9px]">remaining</p>
                  {p.unitsNeeded > 0 && (
                    <p className="text-[9px] mt-0.5" style={{ color: '#007aff' }}>
                      +{p.unitsNeeded} to restock
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </SectionBar>
  )
}

// ── Recent Transactions Section ──────────────────────────────────
function RecentTransactionsSection({ transactions, expanded, onToggle }) {
  return (
    <SectionBar
      title="Recent Transactions"
      icon="🧾"
      count={transactions.length}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3 flex flex-col gap-2">
        {transactions.length === 0 ? (
          <p className="text-black/40 text-xs text-center py-4">
            No transactions yet — checkout a cart to see it here!
          </p>
        ) : (
          transactions.map(tx => {
            const items = Array.isArray(tx.items) ? tx.items : []
            const timeAgo = tx.created_at ? formatTimeAgo(tx.created_at) : 'just now'
            return (
              <div key={tx.id} className="p-3 rounded-[12px]" style={{ background: '#f2f2f7' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center text-base shrink-0"
                      style={{ background: 'rgba(0,122,255,0.1)' }}
                    >
                      🛒
                    </div>
                    <div>
                      <p className="text-black text-xs font-semibold font-mono">{tx.receipt_id}</p>
                      <p className="text-black/40 text-[10px]">
                        {tx.mobile ? `+91 ${tx.mobile}` : 'Walk-in'} · {timeAgo}
                      </p>
                    </div>
                  </div>
                  <p className="text-black font-bold text-sm">₹{tx.total}</p>
                </div>
                {items.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {items.map((item, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.6)' }}
                      >
                        {item.name} ×{item.qty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </SectionBar>
  )
}

function formatTimeAgo(isoString) {
  const now = new Date()
  const then = new Date(isoString)
  const diffSec = Math.floor((now - then) / 1000)
  if (diffSec < 60) return 'just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return then.toLocaleDateString('en-IN')
}

// ── Offers Manager Section ────────────────────────────────────────
function OffersManagerSection({ expanded, onToggle }) {
  const [offers, setOffers] = useState(getOffers)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', discount: '', tag: 'HOT' })

  const handleToggle = (id) => setOffers(toggleOffer(id))
  const handleDelete = (id) => setOffers(deleteOffer(id))

  const handleAdd = () => {
    if (!form.title || !form.discount) return
    const tagStyle = TAG_COLORS[form.tag] || TAG_COLORS['DEAL']
    const updated = addOffer({ ...form, ...tagStyle })
    setOffers(updated)
    setForm({ title: '', description: '', discount: '', tag: 'HOT' })
    setAdding(false)
  }

  const activeCount = offers.filter(o => o.active).length

  return (
    <SectionBar
      title="Offers Manager"
      icon="🎁"
      count={`${activeCount} active`}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3 flex flex-col gap-2">
        <button
          onClick={() => setAdding(!adding)}
          className="w-full py-2.5 rounded-[10px] text-xs font-semibold active:scale-95 transition-transform"
          style={{ background: adding ? '#f2f2f7' : '#007aff', color: adding ? '#ff3b30' : '#fff' }}
        >
          {adding ? '✕ Cancel' : '+ Create New Offer'}
        </button>

        {adding && (
          <div className="p-3 rounded-[12px] flex flex-col gap-2" style={{ background: '#f2f2f7' }}>
            <input
              placeholder="Offer title (e.g. Weekend Special 🎉)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="p-2 rounded-[8px] text-xs outline-none"
              style={{ background: '#fff' }}
            />
            <input
              placeholder="Description (e.g. Buy 2 get 1 free on snacks)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="p-2 rounded-[8px] text-xs outline-none"
              style={{ background: '#fff' }}
            />
            <div className="flex gap-2">
              <input
                placeholder="Discount text (e.g. Save ₹20)"
                value={form.discount}
                onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                className="flex-1 p-2 rounded-[8px] text-xs outline-none"
                style={{ background: '#fff' }}
              />
              <select
                value={form.tag}
                onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                className="p-2 rounded-[8px] text-xs outline-none shrink-0"
                style={{ background: '#fff' }}
              >
                {Object.keys(TAG_COLORS).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={!form.title || !form.discount}
              className="w-full py-2 rounded-[10px] text-xs font-semibold text-white disabled:opacity-40"
              style={{ background: '#34c759' }}
            >
              ✓ Publish Offer → Appears in Customer Cart
            </button>
          </div>
        )}

        {offers.map(offer => (
          <div
            key={offer.id}
            className="p-3 rounded-[12px] flex items-center gap-3"
            style={{
              background: offer.active ? offer.bg || '#f2f2f7' : '#f2f2f7',
              border: `1px solid ${offer.active ? (offer.border || 'rgba(0,0,0,0.08)') : 'rgba(0,0,0,0.06)'}`,
              opacity: offer.active ? 1 : 0.55,
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-black text-xs font-semibold truncate">{offer.title}</p>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{
                    background: `${offer.color}22`,
                    color: offer.color,
                  }}
                >
                  {offer.tag}
                </span>
              </div>
              <p className="text-black/50 text-[10px] truncate">{offer.description}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: offer.color }}>{offer.discount}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Active toggle */}
              <button
                onClick={() => handleToggle(offer.id)}
                className="w-10 h-6 rounded-full relative transition-colors duration-200"
                style={{ background: offer.active ? '#34c759' : 'rgba(0,0,0,0.15)' }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
                  style={{ left: offer.active ? '18px' : '2px' }}
                />
              </button>
              {/* Delete */}
              <button
                onClick={() => handleDelete(offer.id)}
                className="text-[#ff3b30] text-xs active:opacity-60"
              >
                🗑
              </button>
            </div>
          </div>
        ))}

        {offers.length === 0 && (
          <p className="text-black/40 text-xs text-center py-3">No offers yet — create one above!</p>
        )}

        <p className="text-black/30 text-[10px] text-center mt-1">
          Active offers appear instantly in the customer cart
        </p>
      </div>
    </SectionBar>
  )
}
