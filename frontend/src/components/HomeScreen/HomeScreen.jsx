// iOS 18 light home screen
const apps = [
  { id: 'phone',    icon: '📞', label: 'Phone',      bg: '#34c759' },
  { id: 'messages', icon: '💬', label: 'Messages',   bg: '#34c759' },
  { id: 'camera',  icon: '📷', label: 'Camera',     bg: '#1c1c1e' },
  { id: 'maps',    icon: '🗺️',  label: 'Maps',       bg: '#fff' },
  { id: 'music',   icon: '🎵', label: 'Music',      bg: '#fc3158' },
  { id: 'weather', icon: '☀️', label: 'Weather',    bg: '#1e90ff' },
  { id: 'notes',   icon: '📝', label: 'Notes',      bg: '#ffd60a' },
  { id: 'settings',icon: '⚙️', label: 'Settings',   bg: '#8e8e93' },
  { id: 'cartai',  icon: '🛒', label: 'CartAI',     highlight: true },
  { id: 'scanner', icon: '🚪', label: 'Exit Scan',  bg: '#1c1c1e', scannerApp: true },
  { id: 'clock',   icon: '⏰', label: 'Clock',      bg: '#1c1c1e' },
  { id: 'photos',  icon: '🖼️', label: 'Photos',     bg: '#fff' },
]

export default function HomeScreen({ onOpenApp, onOpenScanner }) {
  return (
    <div
      className="h-full w-full flex flex-col px-5 pt-4 pb-3"
      style={{
        background: 'linear-gradient(180deg, #a8c8f8 0%, #b8d4f8 30%, #d4e8ff 70%, #e8f4ff 100%)',
      }}
    >
      {/* Date & time */}
      <div className="text-center mb-6 mt-1">
        <p className="text-black/50 text-sm font-medium tracking-wide">Monday, 10 August</p>
        <p
          className="text-black/90 font-thin mt-0.5"
          style={{ fontSize: 60, lineHeight: 1, letterSpacing: '-2px' }}
        >
          9:41
        </p>
      </div>

      {/* App grid */}
      <div className="grid grid-cols-4 gap-y-5 gap-x-1 flex-1">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={
              app.id === 'cartai' ? onOpenApp
              : app.scannerApp ? onOpenScanner
              : undefined
            }
            className={`flex flex-col items-center gap-1.5 group ${
              app.id === 'cartai' || app.scannerApp ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <div
              className="w-[58px] h-[58px] rounded-[14px] flex items-center justify-center text-[26px] transition-all duration-150 group-active:scale-90 group-active:brightness-90"
              style={
                app.highlight
                  ? {
                      background: 'linear-gradient(145deg, #007aff, #0051d0)',
                      boxShadow: '0 4px 14px rgba(0,122,255,0.45)',
                    }
                  : {
                      background: app.bg || '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }
              }
            >
              {app.icon}
            </div>
            <span
              className="text-[11px] font-medium"
              style={{
                color: app.highlight ? '#fff' : 'rgba(0,0,0,0.8)',
                textShadow: app.highlight
                  ? '0 1px 3px rgba(0,0,0,0.3)'
                  : '0 1px 2px rgba(255,255,255,0.6)',
              }}
            >
              {app.label}
            </span>
          </button>
        ))}
      </div>

      {/* Dock */}
      <div
        className="flex justify-around mt-4 py-3 px-4 rounded-[26px]"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.7)',
        }}
      >
        {[
          { icon: '📞', bg: '#34c759' },
          { icon: '🌐', bg: '#007aff' },
          { icon: '📧', bg: '#007aff' },
          { icon: '🎵', bg: '#fc3158' },
        ].map(({ icon, bg }, i) => (
          <div
            key={i}
            className="w-[52px] h-[52px] rounded-[13px] flex items-center justify-center text-2xl"
            style={{ background: bg, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            {icon}
          </div>
        ))}
      </div>
    </div>
  )
}
