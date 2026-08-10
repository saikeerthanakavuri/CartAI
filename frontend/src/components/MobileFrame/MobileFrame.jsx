// Mobile phone frame wrapper — all screens render inside this
export default function MobileFrame({ children }) {
  return (
    <div className="relative flex flex-col" style={{ width: 390, height: 844 }}>
      {/* Phone shell */}
      <div
        className="relative rounded-[48px] overflow-hidden shadow-2xl border-4 border-slate-600"
        style={{
          width: 390,
          height: 844,
          background: '#1e1e2e',
          boxShadow: '0 0 0 6px #0f0f1a, 0 30px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Status bar */}
        <div className="flex justify-between items-center px-6 pt-4 pb-1 text-white text-xs font-medium" style={{ background: 'transparent', zIndex: 10, position: 'relative' }}>
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span>●●●●</span>
            <span>WiFi</span>
            <span>🔋</span>
          </div>
        </div>

        {/* Dynamic Island / notch */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-black"
          style={{ width: 120, height: 34, zIndex: 20 }}
        />

        {/* Screen content */}
        <div className="absolute inset-0 top-12 overflow-hidden rounded-b-[44px]">
          {children}
        </div>
      </div>
    </div>
  )
}
