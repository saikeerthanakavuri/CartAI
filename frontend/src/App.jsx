import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import MobileFrame from './components/MobileFrame/MobileFrame'
import Login from './components/Auth/Login'
import HomeScreen from './components/HomeScreen/HomeScreen'
import LoginSelector from './components/LoginSelector/LoginSelector'
import CustomerLogin from './components/CustomerLogin/CustomerLogin'
import Cart from './components/Cart/Cart'
import Dashboard from './components/Dashboard/Dashboard'

// Screens: 'home' | 'login-selector' | 'customer-login' | 'shopkeeper-login' | 'cart'

function AppContent() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState('home')
  const [customer, setCustomer] = useState(null)

  // If user is authenticated, go directly to dashboard
  useEffect(() => {
    if (user && screen !== 'cart') {
      setScreen('dashboard')
    }
  }, [user])

  const navigate = (to, data = null) => {
    if (to === 'cart' && data) setCustomer(data)
    setScreen(to)
  }

  const handleLogout = async () => {
    const { logout } = useAuth()
    try {
      await logout()
      navigate('home')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f2f2f7' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🛒</div>
          <p className="text-black/50 text-sm">Loading CartAI...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, show dashboard
  if (user && screen !== 'customer-login' && screen !== 'cart') {
    return (
      <div className="min-h-screen flex items-center justify-center py-10"
        style={{ background: 'linear-gradient(135deg, #e8eaf0 0%, #d0d4de 100%)' }}>
        <MobileFrame>
          <Dashboard onLogout={handleLogout} />
        </MobileFrame>
      </div>
    )
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onOpenApp={() => navigate('login-selector')} />
      case 'login-selector':
        return (
          <LoginSelector
            onCustomer={() => navigate('customer-login')}
            onShopkeeper={() => navigate('home')} // Will show Firebase login
            onBack={() => navigate('home')}
          />
        )
      case 'customer-login':
        return (
          <CustomerLogin
            onLogin={(data) => navigate('cart', data)}
            onBack={() => navigate('login-selector')}
          />
        )
      case 'cart':
        return (
          <Cart
            customer={customer}
            onLogout={() => navigate('login-selector')}
          />
        )
      default:
        return (
          <div>
            <Login />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10"
      style={{ background: 'linear-gradient(135deg, #e8eaf0 0%, #d0d4de 100%)' }}>
      <MobileFrame>
        {screen === 'home' && user ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          renderScreen()
        )}
      </MobileFrame>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
