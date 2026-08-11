// iOS 18 light — Customer Cart
export default function Cart({ customer, onLogout }) {
  const card = {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.05)',
  }

  return (
    <div className="h-full w-full flex flex-col px-5 pt-5 pb-5" style={{ background: '#f2f2f7' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-black/40 text-xs font-light">Welcome back</p>
          <h2 className="text-black font-semibold text-base mt-0.5" style={{ letterSpacing: '-0.2px' }}>
            +91 {customer?.mobile}
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

      {/* Camera scan area */}
      <div
        className="flex-1 flex flex-col items-center justify-center gap-3 mb-4"
        style={{ ...card, borderRadius: 20 }}
      >
        {/* Scan frame */}
        <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
          <span className="text-[56px]">📷</span>
          {[
            { top: 0, left: 0, borderTop: '2.5px solid #007aff', borderLeft: '2.5px solid #007aff' },
            { top: 0, right: 0, borderTop: '2.5px solid #007aff', borderRight: '2.5px solid #007aff' },
            { bottom: 0, left: 0, borderBottom: '2.5px solid #007aff', borderLeft: '2.5px solid #007aff' },
            { bottom: 0, right: 0, borderBottom: '2.5px solid #007aff', borderRight: '2.5px solid #007aff' },
          ].map((s, i) => (
            <div key={i} className="absolute" style={{ ...s, width: 20, height: 20, borderRadius: 3 }} />
          ))}
        </div>

        <p className="text-black font-semibold text-base" style={{ letterSpacing: '-0.2px' }}>
          Scan a Product
        </p>
        <p className="text-black/35 text-xs text-center px-8 font-light leading-relaxed">
          Point your camera at any product to identify it and add to cart
        </p>
        <button
          className="mt-1 px-7 py-2.5 rounded-[10px] text-white text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: '#007aff' }}
        >
          Open Camera
        </button>
      </div>

      {/* Cart summary */}
      <div className="p-4" style={card}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-black font-semibold text-sm">Cart</span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.4)' }}
          >
            0 items
          </span>
        </div>
        <p className="text-black/25 text-xs font-light mb-3">
          No items yet. Scan a product to start.
        </p>
        <button
          disabled
          className="w-full py-3 rounded-[10px] text-white font-semibold text-sm opacity-30 cursor-not-allowed"
          style={{ background: '#007aff' }}
        >
          Checkout &amp; Get QR Code
        </button>
      </div>
    </div>
  )
}
