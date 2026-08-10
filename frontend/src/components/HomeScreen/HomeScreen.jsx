// Home screen with app grid — CartAI app icon is clickable
const apps = [
  { id: 'phone',    icon: '📞', label: 'Phone' },
  { id: 'messages', icon: '💬', label: 'Messages' },
  { id: 'camera',  icon: '📷', label: 'Camera' },
  { id: 'maps',    icon: '🗺️',  label: 'Maps' },
  { id: 'music',   icon: '🎵', label: 'Music' },
  { id: 'weather', icon: '🌤️', label: 'Weather' },
  { id: 'notes',   icon: '📝', label: 'Notes' },
  { id: 'settings',icon: '⚙️', label: 'Settings' },
  { id: 'cartai',  icon: '🛒', label: 'CartAI', highlight: true },
  { id: 'calc',    icon: '🧮', label: 'Calculator' },
  { id: 'clock',   icon: '⏰', label: 'Clock' },
  { id: 'gallery', icon: '🖼️', label: 'Gallery' },
]

export default function HomeScreen({ onOpenApp }) {
  return (
    <div
      className="h-full w-full flex flex-col px-4 pt-6 pb-8"
      style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Date */}
      <div className="text-center mb-6">
        <p className="text-white/60 text-sm">Monday, 10 August</p>
        <p className="text-white text-5xl font-thin">9:41</p>
      </div>

      {/* App grid */}
      <div className="grid grid-cols-4 gap-4 flex-1">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={app.id === 'cartai' ? onOpenApp : undefined}
            className={`flex flex-col items-center gap-1 group ${
              app.id === 'cartai' ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform ${
                app.highlight
                  ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/40 group-active:scale-90'
                  : 'bg-white/10 backdrop-blur group-active:scale-90'
              }`}
              style={app.highlight ? { border: '2px solid rgba(255,255,255,0.3)' } : {}}
            >
              {app.icon}
            </div>
            <span className={`text-xs ${app.highlight ? 'text-violet-300 font-semibold' : 'text-white/70'}`}>
              {app.label}
            </span>
          </button>
        ))}
      </div>

      {/* Dock */}
      <div className="flex justify-around mt-4 bg-white/10 backdrop-blur rounded-3xl py-3 px-4">
        <span className="text-2xl">📞</span>
        <span className="text-2xl">🌐</span>
        <span className="text-2xl">📧</span>
        <span className="text-2xl">🎵</span>
      </div>
    </div>
  )
}
