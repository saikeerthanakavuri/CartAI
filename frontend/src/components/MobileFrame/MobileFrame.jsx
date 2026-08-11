// iPhone 16 Pro style frame — titanium finish, Dynamic Island, light status bar
export default function MobileFrame({ children }) {
  return (
    <div className="relative" style={{ width: 393, height: 852 }}>

      {/* Side buttons — left: silent + volume */}
      <div className="absolute" style={{ left: -4, top: 110, width: 4, height: 28, background: 'linear-gradient(90deg,#8e8e93,#aeaeb2)', borderRadius: '3px 0 0 3px', boxShadow: '-1px 0 3px rgba(0,0,0,0.2)' }} />
      <div className="absolute" style={{ left: -4, top: 158, width: 4, height: 56, background: 'linear-gradient(90deg,#8e8e93,#aeaeb2)', borderRadius: '3px 0 0 3px', boxShadow: '-1px 0 3px rgba(0,0,0,0.2)' }} />
      <div className="absolute" style={{ left: -4, top: 226, width: 4, height: 56, background: 'linear-gradient(90deg,#8e8e93,#aeaeb2)', borderRadius: '3px 0 0 3px', boxShadow: '-1px 0 3px rgba(0,0,0,0.2)' }} />

      {/* Power button — right */}
      <div className="absolute" style={{ right: -4, top: 178, width: 4, height: 76, background: 'linear-gradient(270deg,#8e8e93,#aeaeb2)', borderRadius: '0 3px 3px 0', boxShadow: '1px 0 3px rgba(0,0,0,0.2)' }} />

      {/* Outer titanium shell */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: 52,
          background: 'linear-gradient(145deg, #c8c8cc 0%, #a0a0a5 30%, #c8c8cc 60%, #9a9a9f 100%)',
          boxShadow:
            '0 50px 120px rgba(0,0,0,0.35), 0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5) inset, 0 0 0 1px rgba(0,0,0,0.15)',
        }}
      />

      {/* Inner bezel (black) */}
      <div
        className="absolute bg-black"
        style={{ inset: 3, borderRadius: 50 }}
      />

      {/* Screen glass */}
      <div
        className="absolute overflow-hidden"
        style={{ inset: 5, borderRadius: 47, background: '#f2f2f7' }}
      >
        {/* Status bar — light theme */}
        <div
          className="relative flex items-center justify-between"
          style={{
            height: 54,
            padding: '0 24px',
            fontSize: 15,
            fontWeight: 600,
            color: '#000',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          }}
        >
          {/* Time */}
          <span style={{ letterSpacing: '-0.3px', fontSize: 16 }}>9:41</span>

          {/* Dynamic Island */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: 10,
              width: 120,
              height: 34,
              background: '#000',
              borderRadius: 20,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#1c1c1e' }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0a5a9c', opacity: 0.9 }} />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1.5">
            {/* Signal */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="#000">
              <rect x="0" y="8" width="3" height="4" rx="0.5" />
              <rect x="4.5" y="5" width="3" height="7" rx="0.5" />
              <rect x="9" y="2" width="3" height="10" rx="0.5" />
              <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.3" />
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#000">
              <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
              <path d="M8 6C9.8 6 11.4 6.8 12.5 8l1.4-1.4A8 8 0 0 0 8 4a8 8 0 0 0-5.9 2.6L3.5 8A5.5 5.5 0 0 1 8 6z" opacity="0.7" />
              <path d="M8 2C11 2 13.7 3.3 15.5 5.4L16.9 4A10 10 0 0 0 8 0a10 10 0 0 0-8.9 4l1.4 1.4A8 8 0 0 1 8 2z" opacity="0.4" />
            </svg>
            {/* Battery */}
            <div className="flex items-center gap-0.5">
              <div style={{ width: 25, height: 12, border: '1.5px solid rgba(0,0,0,0.35)', borderRadius: 3, padding: 1.5 }}>
                <div style={{ width: '80%', height: '100%', background: '#000', borderRadius: 1.5 }} />
              </div>
              <div style={{ width: 2, height: 5, background: 'rgba(0,0,0,0.3)', borderRadius: '0 1px 1px 0' }} />
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="absolute overflow-hidden" style={{ top: 54, left: 0, right: 0, bottom: 30 }}>
          {children}
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center" style={{ height: 30 }}>
          <div style={{ width: 120, height: 5, background: 'rgba(0,0,0,0.18)', borderRadius: 3 }} />
        </div>
      </div>
    </div>
  )
}
