import { useState } from 'react'
import MobileFrame from './components/MobileFrame/MobileFrame'
import HomeScreen from './components/HomeScreen/HomeScreen'
import LoginSelector from './components/LoginSelector/LoginSelector'
import CustomerLogin from './components/CustomerLogin/CustomerLogin'
import ShopkeeperLogin from './components/ShopkeeperLogin/ShopkeeperLogin'
import Cart from './components/Cart/Cart'
import Dashboard from './components/Dashboard/Dashboard'

// Screens: 'home' | 'login-selector' | 'customer-login' | 'shopkeeper-login' | 'cart' | 'dashboard'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [customer, setCustomer] = useState(null)

  const navigate = (to, data = null) => {
    if (to === 'cart' && data) setCustomer(data)
    setScreen(to)
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onOpenApp={() => navigate('login-selector')} />
      case 'login-selector':
        return (
          <LoginSelector
            onCustomer={() => navigate('customer-login')}
            onShopkeeper={() => navigate('shopkeeper-login')}
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
      case 'shopkeeper-login':
        return (
          <ShopkeeperLogin
            onLogin={() => navigate('dashboard')}
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
      case 'dashboard':
        return <Dashboard onLogout={() => navigate('login-selector')} />
      default:
        return <HomeScreen onOpenApp={() => navigate('login-selector')} />
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10"
      style={{ background: 'linear-gradient(135deg, #e8eaf0 0%, #d0d4de 100%)' }}
    >
      <MobileFrame>
        {renderScreen()}
      </MobileFrame>
    </div>
  )
}
