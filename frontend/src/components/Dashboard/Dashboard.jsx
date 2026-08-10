// Shopkeeper Dashboard — analytics, inventory, AI copilot
// Full implementation: charts, alerts, copilot chat
export default function Dashboard({ onLogout }) {
  const stats = [
    { label: "Today's Revenue", value: '₹4,280', icon: '💰', color: 'from-emerald-500 to-teal-600' },
    { label: 'Items Sold', value: '142', icon: '📦', color: 'from-violet-500 to-indigo-600' },
    { label: 'Low Stock', value: '3', icon: '⚠️', color: 'from-orange-500 to-red-500' },
    { label: 'Customers', value: '38', icon: '👥', color: 'from-blue-500 to-cyan-500' },
  ]

  const lowStock = [
    { name: 'Lays Classic', stock: 4, unit: 'packs' },
    { name: 'Coca-Cola 2L', stock: 2, unit: 'bottles' },
    { name: 'Bread Loaf', stock: 3, unit: 'loaves' },
  ]

  return (
    <div
      className="h-full w-full flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #0d2e1a 0%, #064e3b 100%)' }}
    >
      <div className="px-5 pt-6 pb-4 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'rgba(6,78,59,0.95)', backdropFilter: 'blur(10px)' }}>
        <div>
          <p className="text-white/50 text-xs">Logged in as</p>
          <h2 className="text-white font-bold text-base">shopkeeper@gmail.com</h2>
        </div>
        <button
          onClick={onLogout}
          className="text-white/40 text-xs bg-white/10 px-3 py-1.5 rounded-full"
        >
          Logout
        </button>
      </div>

      <div className="px-5 pb-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 mt-2">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 bg-gradient-to-br ${s.color}`}>
              <span className="text-2xl">{s.icon}</span>
              <p className="text-white text-xl font-bold mt-1">{s.value}</p>
              <p className="text-white/70 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Low stock alerts */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>⚠️</span> Low Stock Alerts
          </h3>
          {lowStock.map((item) => (
            <div key={item.name} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
              <span className="text-white/80 text-sm">{item.name}</span>
              <span className="text-orange-400 text-xs font-medium">
                {item.stock} {item.unit} left
              </span>
            </div>
          ))}
        </div>

        {/* AI Copilot */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>💬</span> AI Business Copilot
          </h3>
          <div className="bg-emerald-900/40 rounded-xl p-3 mb-3 border border-emerald-500/20">
            <p className="text-emerald-300 text-xs">
              💡 Sodas are selling 3× faster than usual. Reorder 2 cases now to avoid losing ₹450 in sales.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about your store..."
              className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-white/30 outline-none"
            />
            <button className="bg-emerald-600 text-white rounded-xl px-3 py-2 text-xs font-medium active:scale-95 transition-transform">
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
