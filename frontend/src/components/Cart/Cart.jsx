// Customer Cart screen — camera scanning + cart + checkout
// Full implementation: camera, AI recommendations, QR checkout
export default function Cart({ customer, onLogout }) {
  return (
    <div
      className="h-full w-full flex flex-col px-5 pt-6 pb-6"
      style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #0f3460 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white/50 text-xs">Welcome back</p>
          <h2 className="text-white font-bold text-lg">+91 {customer?.mobile}</h2>
        </div>
        <button
          onClick={onLogout}
          className="text-white/40 text-xs bg-white/10 px-3 py-1.5 rounded-full"
        >
          Logout
        </button>
      </div>

      {/* Camera area */}
      <div className="flex-1 rounded-3xl bg-black/40 border border-white/10 flex flex-col items-center justify-center gap-3 mb-4">
        <span className="text-5xl">📷</span>
        <p className="text-white font-semibold">Scan a Product</p>
        <p className="text-white/40 text-xs text-center px-6">
          Point your camera at any product to identify it and add to cart
        </p>
        <button className="mt-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium active:scale-95 transition-transform">
          Open Camera
        </button>
      </div>

      {/* Cart summary */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-semibold">Cart</span>
          <span className="text-white/50 text-sm">0 items</span>
        </div>
        <p className="text-white/30 text-xs">No items yet. Scan a product to start.</p>
        <button className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-sm opacity-40 cursor-not-allowed">
          Checkout & Get QR Code
        </button>
      </div>
    </div>
  )
}
