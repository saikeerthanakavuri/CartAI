// iOS 18 light — Login selector
export default function LoginSelector({ onCustomer, onShopkeeper, onBack }) {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center px-6"
      style={{ background: '#f2f2f7' }}
    >
      {/* App icon */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="w-24 h-24 rounded-[26px] flex items-center justify-center text-5xl mb-5"
          style={{
            background: 'linear-gradient(145deg, #007aff, #0051d0)',
            boxShadow: '0 8px 28px rgba(0,122,255,0.35)',
          }}
        >
          🛒
        </div>
        <h1 className="text-black text-3xl font-semibold" style={{ letterSpacing: '-0.5px' }}>
          CartAI
        </h1>
        <p className="text-black/40 text-sm mt-1.5 font-light">Smart shopping, powered by AI</p>
      </div>

      {/* Section label */}
      <p className="text-black/30 text-xs font-semibold tracking-widest uppercase mb-4">
        Continue as
      </p>

      {/* Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onCustomer}
          className="w-full py-4 rounded-[16px] flex items-center justify-between px-5 active:scale-[0.98] transition-transform"
          style={{
            background: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(0,122,255,0.12)' }}
            >
              👤
            </div>
            <div className="text-left">
              <p className="text-black font-semibold text-base">Customer</p>
              <p className="text-black/40 text-xs mt-0.5">Scan & shop with AI</p>
            </div>
          </div>
          <span className="text-black/20 text-xl font-light">›</span>
        </button>

        <button
          onClick={onShopkeeper}
          className="w-full py-4 rounded-[16px] flex items-center justify-between px-5 active:scale-[0.98] transition-transform"
          style={{
            background: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(52,199,89,0.12)' }}
            >
              🏪
            </div>
            <div className="text-left">
              <p className="text-black font-semibold text-base">Shopkeeper</p>
              <p className="text-black/40 text-xs mt-0.5">Manage your store</p>
            </div>
          </div>
          <span className="text-black/20 text-xl font-light">›</span>
        </button>
      </div>

      <button
        onClick={onBack}
        className="mt-8 text-[#007aff] text-sm font-medium active:opacity-60 transition-opacity"
      >
        ← Back to Home
      </button>
    </div>
  )
}
