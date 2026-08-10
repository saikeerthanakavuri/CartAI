// Login choice screen — Customer or Shopkeeper
export default function LoginSelector({ onCustomer, onShopkeeper, onBack }) {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center px-6 gap-6"
      style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-4xl shadow-xl shadow-violet-500/40 mb-3">
          🛒
        </div>
        <h1 className="text-white text-2xl font-bold">CartAI</h1>
        <p className="text-white/50 text-sm mt-1">Who are you?</p>
      </div>

      {/* Customer button */}
      <button
        onClick={onCustomer}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-lg shadow-lg shadow-violet-500/30 active:scale-95 transition-transform flex items-center justify-center gap-3"
      >
        <span className="text-2xl">👤</span>
        Customer
      </button>

      {/* Shopkeeper button */}
      <button
        onClick={onShopkeeper}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform flex items-center justify-center gap-3"
      >
        <span className="text-2xl">🏪</span>
        Shopkeeper
      </button>

      {/* Back */}
      <button onClick={onBack} className="text-white/40 text-sm mt-2 active:text-white/70">
        ← Back to Home
      </button>
    </div>
  )
}
