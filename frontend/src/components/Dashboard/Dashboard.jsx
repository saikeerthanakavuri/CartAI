// iOS 18 light — Shopkeeper Dashboard
export default function Dashboard({ onLogout }) {
  const stats = [
    { label: 'Revenue',    value: '₹4,280', sub: 'Today',  icon: '💰', accent: '#34c759' },
    { label: 'Items Sold', value: '142',    sub: 'Today',  icon: '📦', accent: '#007aff' },
    { label: 'Low Stock',  value: '3',      sub: 'Alerts', icon: '⚠️', accent: '#ff9500' },
    { label: 'Customers',  value: '38',     sub: 'Visits', icon: '👥', accent: '#af52de' },
  ]

  const lowStock = [
    { name: 'Lays Classic',  stock: 4, unit: 'packs' },
    { name: 'Coca-Cola 2L',  stock: 2, unit: 'bottles' },
    { name: 'Bread Loaf',    stock: 3, unit: 'loaves' },
  ]

  const card = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.05)',
  }

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto" style={{ background: '#f2f2f7' }}>

      {/* Sticky header */}
      <div
        className="px-5 pt-4 pb-3 flex items-center justify-between sticky top-0 z-10"
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

      <div className="px-4 pb-10 pt-4">

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="p-4" style={card}>
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg mb-3"
                style={{ background: `${s.accent}18` }}
              >
                {s.icon}
              </div>
              <p className="text-black text-2xl font-bold" style={{ letterSpacing: '-0.5px' }}>
                {s.value}
              </p>
              <p className="text-black/40 text-xs mt-0.5 font-light">{s.sub} · {s.label}</p>
            </div>
          ))}
        </div>

        {/* Low stock */}
        <div className="p-4 mb-4" style={card}>
          <h3 className="text-black font-semibold text-sm mb-3 flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
              style={{ background: 'rgba(255,149,0,0.15)' }}
            >
              ⚠️
            </span>
            Low Stock Alerts
          </h3>
          {lowStock.map((item, i) => (
            <div
              key={item.name}
              className="flex justify-between items-center py-2.5"
              style={{ borderBottom: i < lowStock.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
            >
              <span className="text-black/80 text-sm font-light">{item.name}</span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,149,0,0.12)', color: '#ff9500' }}
              >
                {item.stock} {item.unit} left
              </span>
            </div>
          ))}
        </div>

        {/* AI Copilot */}
        <div className="p-4" style={card}>
          <h3 className="text-black font-semibold text-sm mb-3 flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
              style={{ background: 'rgba(0,122,255,0.12)' }}
            >
              ✨
            </span>
            AI Business Copilot
          </h3>

          <div
            className="rounded-[12px] p-3 mb-3"
            style={{ background: 'rgba(0,122,255,0.06)', border: '1px solid rgba(0,122,255,0.12)' }}
          >
            <p className="text-black/60 text-xs font-light leading-relaxed">
              💡 Sodas are selling 3× faster than usual. Reorder 2 cases now to avoid losing{' '}
              <span style={{ color: '#007aff', fontWeight: 500 }}>₹450 in sales</span>.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask about your store…"
              className="flex-1 rounded-[10px] px-3 py-2.5 text-black text-xs font-light placeholder-black/25 outline-none"
              style={{ background: '#f2f2f7', border: '1px solid rgba(0,0,0,0.08)' }}
            />
            <button
              className="text-white text-xs font-semibold rounded-[10px] px-4 py-2.5 active:scale-95 transition-transform"
              style={{ background: '#007aff' }}
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
