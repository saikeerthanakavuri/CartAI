import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function Checkout({ cartItems, customer, onDone, onBack }) {
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0)

  // Build receipt ID and timestamp
  const receiptId = useMemo(() => 'CART-' + Date.now().toString(36).toUpperCase(), [])
  const timestamp = useMemo(() => {
    const now = new Date()
    return now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
  }, [])

  // QR payload — compact JSON string the cashier/exit scanner would verify
  const qrPayload = useMemo(() => JSON.stringify({
    receipt: receiptId,
    mobile: customer?.mobile,
    items: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    total: totalPrice,
    ts: timestamp,
  }), [receiptId, customer, cartItems, totalPrice, timestamp])

  const card = {
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.05)',
  }

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto" style={{ background: '#f2f2f7' }}>

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-60 transition-opacity flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.06)' }}
        >
          <span className="text-black/60 text-base leading-none" style={{ marginTop: -1 }}>‹</span>
        </button>
        <div>
          <p className="text-black/40 text-xs font-light">Order Confirmed</p>
          <h2 className="text-black font-semibold text-xl mt-0.5" style={{ letterSpacing: '-0.4px' }}>
            Your Receipt 🧾
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-8">

        {/* ── QR Code card ── */}
        <div className="flex flex-col items-center py-6 gap-4" style={card}>
          {/* Success ring */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-1"
            style={{ background: 'rgba(52,199,89,0.12)', border: '2px solid rgba(52,199,89,0.3)' }}
          >
            ✓
          </div>

          <div className="text-center">
            <p className="text-black font-semibold text-base" style={{ letterSpacing: '-0.2px' }}>
              Scan to Exit
            </p>
            <p className="text-black/40 text-xs mt-1 font-light">
              Show this QR at the store exit
            </p>
          </div>

          {/* QR Code */}
          <div
            className="p-4 rounded-[16px]"
            style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <QRCodeSVG
              value={qrPayload}
              size={160}
              bgColor="#ffffff"
              fgColor="#1c1c1e"
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Receipt ID */}
          <div className="text-center">
            <p
              className="text-xs font-mono font-semibold tracking-widest"
              style={{ color: '#007aff' }}
            >
              {receiptId}
            </p>
            <p className="text-black/30 text-[10px] mt-0.5 font-light">{timestamp}</p>
          </div>
        </div>

        {/* ── Order summary ── */}
        <div className="p-4" style={card}>
          <h3 className="text-black font-semibold text-sm mb-3 flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
              style={{ background: 'rgba(0,122,255,0.1)' }}
            >
              🛍️
            </span>
            Order Summary · {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </h3>

          <div className="flex flex-col gap-2.5">
            {cartItems.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center justify-between"
                style={{
                  paddingBottom: i < cartItems.length - 1 ? 10 : 0,
                  borderBottom: i < cartItems.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <p className="text-black text-xs font-medium">{item.name}</p>
                    <p className="text-black/40 text-[10px] font-light">{item.variant}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-black text-xs font-semibold">₹{item.price * item.qty}</p>
                  <p className="text-black/30 text-[10px] font-light">×{item.qty} · ₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Total row */}
          <div
            className="flex justify-between items-center mt-3 pt-3"
            style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
          >
            <div>
              <p className="text-black font-semibold text-sm">Total Paid</p>
              <p className="text-black/35 text-[10px] font-light mt-0.5">+91 {customer?.mobile}</p>
            </div>
            <p className="text-black font-bold text-xl" style={{ letterSpacing: '-0.5px' }}>
              ₹{totalPrice}
            </p>
          </div>
        </div>

        {/* ── Savings callout (if more than 1 item) ── */}
        {totalItems > 1 && (
          <div
            className="px-4 py-3 rounded-[14px] flex items-center gap-3"
            style={{ background: 'rgba(52,199,89,0.09)', border: '1px solid rgba(52,199,89,0.2)' }}
          >
            <span className="text-lg">🎉</span>
            <p className="text-xs font-light" style={{ color: '#1d6b34' }}>
              You saved time with{' '}
              <span className="font-semibold">CartAI self-checkout</span>
              {' '}— no cashier queue!
            </p>
          </div>
        )}

        {/* ── Done button ── */}
        <button
          onClick={onDone}
          className="w-full py-3.5 rounded-[14px] text-white font-semibold text-base active:scale-[0.98] transition-transform mt-1"
          style={{ background: '#007aff' }}
        >
          Done · Shop Again
        </button>
      </div>
    </div>
  )
}
