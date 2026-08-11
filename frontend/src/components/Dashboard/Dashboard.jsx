import { useState } from 'react'
import AIChat from '../AIChat/AIChat'
import {
  PRODUCTS as INITIAL_PRODUCTS,
  getTotalRevenue,
  getTotalProfit,
  getCriticalStock,
  getLowStock,
  getExpiringSoon,
  getDroppingSales,
} from '../../data/products'

const card = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.05)',
}

export default function Dashboard({ onLogout }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [expandedSection, setExpandedSection] = useState(null)

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const revenue = getTotalRevenue(products)
  const profit = getTotalProfit(products)
  const topSellers = [...products].sort((a, b) => b.soldToday - a.soldToday).slice(0, 5)

  return (
    <div className="h-full w-full flex flex-col" style={{ background: '#f2f2f7' }}>
      {/* Header */}
      <div
        className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0"
        style={{
          background: 'rgba(242,242,247,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div>
          <p className="text-black/40 text-xs font-light">Store Dashboard</p>
          <h2 className="text-black font-semibold text-base mt-0.5" style={{ letterSpacing: '-0.2px' }}>
            shopkeeper@gmail.com
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ minHeight: 0 }}>
        {/* 1. Revenue Today */}
        <div className="mb-3 p-4" style={card}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black/40 text-xs font-light">Revenue Today</p>
              <p className="text-black text-2xl font-bold mt-1" style={{ letterSpacing: '-0.5px' }}>
                ₹{revenue.toLocaleString('en-IN')}
              </p>
              <p className="text-xs mt-1">
                <span className="font-medium" style={{ color: '#34c759' }}>
                  Profit: ₹{profit.toLocaleString('en-IN')}
                </span>
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* 2. Top Selling Products */}
        <SectionBar
          title="Top Selling Products"
          icon="🏆"
          count={topSellers.length}
          expanded={expandedSection === 'top'}
          onToggle={() => toggleSection('top')}
        >
          <div className="flex flex-col gap-2 mt-3">
            {topSellers.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-[12px]"
                style={{ background: '#f2f2f7' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{
                      background: i === 0 ? '#ff9500' : i === 1 ? '#8e8e93' : i === 2 ? '#a2845e' : '#007aff',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-black text-sm font-medium">{p.name}</p>
                    <p className="text-black/40 text-[10px]">{p.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-black text-sm font-semibold">{p.soldToday}</p>
                  <p className="text-black/40 text-[10px]">units sold</p>
                </div>
              </div>
            ))}
          </div>
        </SectionBar>

        {/* 3. Red Alerts */}
        <RedAlertsSection
          products={products}
          setProducts={setProducts}
          expanded={expandedSection === 'alerts'}
          onToggle={() => toggleSection('alerts')}
        />

        {/* 4. Add Sale */}
        <AddSaleSection
          products={products}
          setProducts={setProducts}
          expanded={expandedSection === 'sale'}
          onToggle={() => toggleSection('sale')}
        />

        {/* 5. Products List */}
        <ProductsListSection
          products={products}
          setProducts={setProducts}
          expanded={expandedSection === 'products'}
          onToggle={() => toggleSection('products')}
        />
      </div>

      {/* AI Chat */}
      <AIChat products={products} />
    </div>
  )
}

// Collapsible section bar component
function SectionBar({ title, icon, count, expanded, onToggle, children }) {
  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between active:opacity-70 transition-opacity"
        style={card}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <p className="text-black font-semibold text-sm">{title}</p>
            {count !== undefined && (
              <p className="text-black/40 text-[10px]">{count} items</p>
            )}
          </div>
        </div>
        <span className="text-black/30 text-lg transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0" style={{ ...card, marginTop: -12, paddingTop: 12, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          {children}
        </div>
      )}
    </div>
  )
}

// Red Alerts Section
function RedAlertsSection({ products, setProducts, expanded, onToggle }) {
  const critical = getCriticalStock(products)
  const low = getLowStock(products)
  const expiring = getExpiringSoon(products)
  const dropping = getDroppingSales(products)

  const allAlerts = critical.length + low.length + expiring.length + dropping.length

  const toggleRestocked = (productId) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.threshold + 10 } : p))
    )
  }

  return (
    <SectionBar
      title="Red Alerts"
      icon="🚨"
      count={allAlerts}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="flex flex-col gap-3 mt-3">
        {/* Critical Stock */}
        {(critical.length > 0 || low.length > 0) && (
          <div>
            <p className="text-black/50 text-[10px] font-medium mb-2">⚠️ CRITICAL STOCK</p>
            {[...critical, ...low].map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-[12px] mb-2"
                style={{ background: p.stock <= p.threshold * 0.2 ? 'rgba(255,59,48,0.08)' : 'rgba(255,149,0,0.08)' }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    onChange={() => toggleRestocked(p.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-black text-xs font-medium">{p.name}</p>
                    <p className="text-black/50 text-[10px]">
                      Only {p.stock} {p.unit} left (need {p.threshold})
                    </p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: p.stock <= p.threshold * 0.2 ? 'rgba(255,59,48,0.15)' : 'rgba(255,149,0,0.15)',
                    color: p.stock <= p.threshold * 0.2 ? '#ff3b30' : '#ff9500',
                  }}
                >
                  {p.stock <= p.threshold * 0.2 ? 'CRITICAL' : 'LOW'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expiring Soon */}
        {expiring.length > 0 && (
          <div>
            <p className="text-black/50 text-[10px] font-medium mb-2">📅 EXPIRING SOON</p>
            {expiring.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-[12px] mb-2"
                style={{ background: 'rgba(255,204,0,0.08)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black text-xs font-medium">{p.name}</p>
                    <p className="text-black/50 text-[10px]">
                      Expires: {new Date(p.expiryDate).toLocaleDateString()} · {p.stock} {p.unit} left
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,204,0,0.15)', color: '#cc9900' }}>
                    URGENT
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dropping Sales */}
        {dropping.length > 0 && (
          <div>
            <p className="text-black/50 text-[10px] font-medium mb-2">📉 DROPPING SALES</p>
            {dropping.map((p) => {
              const dropPercent = Math.round(((p.soldYesterday - p.soldToday) / p.soldYesterday) * 100)
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-[12px] mb-2"
                  style={{ background: 'rgba(88,86,214,0.08)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black text-xs font-medium">{p.name}</p>
                      <p className="text-black/50 text-[10px]">
                        Today: {p.soldToday} · Yesterday: {p.soldYesterday} ({dropPercent}% drop)
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(88,86,214,0.15)', color: '#5856d6' }}>
                      REDUCE RESTOCK
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {allAlerts === 0 && (
          <p className="text-black/40 text-xs text-center py-4">✅ No alerts — Everything looks good!</p>
        )}
      </div>
    </SectionBar>
  )
}

// Add Sale Section
function AddSaleSection({ products, setProducts, expanded, onToggle }) {
  const [saleType, setSaleType] = useState('single') // 'single' or 'combo'
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [comboItems, setComboItems] = useState([])
  const [comboDiscount, setComboDiscount] = useState(0)

  const addComboItem = () => {
    if (selectedProduct && quantity > 0) {
      const product = products.find((p) => p.id === parseInt(selectedProduct))
      if (product) {
        setComboItems([...comboItems, { product, quantity }])
        setSelectedProduct('')
        setQuantity(1)
      }
    }
  }

  const removeComboItem = (index) => {
    setComboItems(comboItems.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    if (saleType === 'single' && selectedProduct) {
      const product = products.find((p) => p.id === parseInt(selectedProduct))
      if (product) {
        const subtotal = product.sellPrice * quantity
        return subtotal - (subtotal * discount) / 100
      }
    } else if (saleType === 'combo') {
      const subtotal = comboItems.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0)
      return subtotal - (subtotal * comboDiscount) / 100
    }
    return 0
  }

  const processSale = () => {
    if (saleType === 'single' && selectedProduct && quantity > 0) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === parseInt(selectedProduct)
            ? { ...p, soldToday: p.soldToday + quantity, stock: Math.max(0, p.stock - quantity) }
            : p
        )
      )
      setSelectedProduct('')
      setQuantity(1)
      setDiscount(0)
      alert(`Sale added! Total: ₹${calculateTotal().toFixed(2)}`)
    } else if (saleType === 'combo' && comboItems.length > 0) {
      setProducts((prev) =>
        prev.map((p) => {
          const comboItem = comboItems.find((item) => item.product.id === p.id)
          if (comboItem) {
            return {
              ...p,
              soldToday: p.soldToday + comboItem.quantity,
              stock: Math.max(0, p.stock - comboItem.quantity),
            }
          }
          return p
        })
      )
      setComboItems([])
      setComboDiscount(0)
      alert(`Combo sale added! Total: ₹${calculateTotal().toFixed(2)}`)
    }
  }

  return (
    <SectionBar
      title="Add Sale"
      icon="➕"
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3">
        {/* Sale type toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSaleType('single')}
            className="flex-1 py-2 rounded-[10px] text-xs font-semibold transition-all"
            style={{
              background: saleType === 'single' ? '#007aff' : '#f2f2f7',
              color: saleType === 'single' ? '#fff' : '#000',
            }}
          >
            Single Item
          </button>
          <button
            onClick={() => setSaleType('combo')}
            className="flex-1 py-2 rounded-[10px] text-xs font-semibold transition-all"
            style={{
              background: saleType === 'combo' ? '#007aff' : '#f2f2f7',
              color: saleType === 'combo' ? '#fff' : '#000',
            }}
          >
            Combo
          </button>
        </div>

        {saleType === 'single' ? (
          <div className="flex flex-col gap-2">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2.5 rounded-[10px] text-xs outline-none"
              style={{ background: '#f2f2f7' }}
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ₹{p.sellPrice} (Stock: {p.stock})
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Qty"
                className="flex-1 p-2.5 rounded-[10px] text-xs outline-none"
                style={{ background: '#f2f2f7' }}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                placeholder="Discount %"
                className="flex-1 p-2.5 rounded-[10px] text-xs outline-none"
                style={{ background: '#f2f2f7' }}
              />
            </div>

            <div className="p-3 rounded-[10px]" style={{ background: '#f2f2f7' }}>
              <p className="text-black/50 text-[10px]">Total</p>
              <p className="text-black text-lg font-bold">₹{calculateTotal().toFixed(2)}</p>
            </div>

            <button
              onClick={processSale}
              disabled={!selectedProduct || quantity <= 0}
              className="w-full py-3 rounded-[12px] text-white font-semibold text-sm active:scale-98 transition-transform disabled:opacity-40"
              style={{ background: '#34c759' }}
            >
              Add Sale
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex-1 p-2.5 rounded-[10px] text-xs outline-none"
                style={{ background: '#f2f2f7' }}
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ₹{p.sellPrice}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Qty"
                className="w-16 p-2.5 rounded-[10px] text-xs outline-none"
                style={{ background: '#f2f2f7' }}
              />
              <button
                onClick={addComboItem}
                className="px-3 py-2.5 rounded-[10px] text-white font-semibold text-xs"
                style={{ background: '#007aff' }}
              >
                +
              </button>
            </div>

            {comboItems.length > 0 && (
              <div className="flex flex-col gap-1">
                {comboItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-[8px]"
                    style={{ background: '#f2f2f7' }}
                  >
                    <p className="text-xs text-black">
                      {item.product.name} × {item.quantity}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">₹{item.product.sellPrice * item.quantity}</p>
                      <button
                        onClick={() => removeComboItem(i)}
                        className="text-[#ff3b30] text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              type="number"
              min="0"
              max="100"
              value={comboDiscount}
              onChange={(e) => setComboDiscount(parseInt(e.target.value) || 0)}
              placeholder="Combo discount %"
              className="w-full p-2.5 rounded-[10px] text-xs outline-none"
              style={{ background: '#f2f2f7' }}
            />

            <div className="p-3 rounded-[10px]" style={{ background: '#f2f2f7' }}>
              <p className="text-black/50 text-[10px]">Combo Total</p>
              <p className="text-black text-lg font-bold">₹{calculateTotal().toFixed(2)}</p>
            </div>

            <button
              onClick={processSale}
              disabled={comboItems.length === 0}
              className="w-full py-3 rounded-[12px] text-white font-semibold text-sm active:scale-98 transition-transform disabled:opacity-40"
              style={{ background: '#34c759' }}
            >
              Add Combo Sale
            </button>
          </div>
        )}
      </div>
    </SectionBar>
  )
}

// Products List Section
function ProductsListSection({ products, setProducts, expanded, onToggle }) {
  const [adding, setAdding] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    costPrice: '',
    sellPrice: '',
    stock: '',
    threshold: '',
    unit: '',
    expiryDate: '',
  })

  const addProduct = () => {
    if (newProduct.name && newProduct.sellPrice && newProduct.stock) {
      const product = {
        id: Math.max(...products.map((p) => p.id)) + 1,
        name: newProduct.name,
        category: newProduct.category || 'Other',
        costPrice: parseInt(newProduct.costPrice) || 0,
        sellPrice: parseInt(newProduct.sellPrice),
        stock: parseInt(newProduct.stock),
        threshold: parseInt(newProduct.threshold) || 10,
        unit: newProduct.unit || 'units',
        expiryDate: newProduct.expiryDate || '2027-12-31',
        soldToday: 0,
        soldYesterday: 0,
        barcode: `890126234${Math.random().toString().slice(2, 6)}`,
      }
      setProducts([...products, product])
      setNewProduct({
        name: '',
        category: '',
        costPrice: '',
        sellPrice: '',
        stock: '',
        threshold: '',
        unit: '',
        expiryDate: '',
      })
      setAdding(false)
    }
  }

  return (
    <SectionBar
      title="Products List"
      icon="📦"
      count={products.length}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="mt-3">
        <button
          onClick={() => setAdding(!adding)}
          className="w-full py-2.5 rounded-[10px] text-xs font-semibold mb-3 active:scale-98 transition-transform"
          style={{ background: '#007aff', color: '#fff' }}
        >
          {adding ? 'Cancel' : '+ Add New Product'}
        </button>

        {adding && (
          <div className="flex flex-col gap-2 mb-3 p-3 rounded-[12px]" style={{ background: '#f2f2f7' }}>
            <input
              type="text"
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="p-2 rounded-[8px] text-xs outline-none"
              style={{ background: '#fff' }}
            />
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className="p-2 rounded-[8px] text-xs outline-none"
              style={{ background: '#fff' }}
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Cost ₹"
                value={newProduct.costPrice}
                onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                className="flex-1 p-2 rounded-[8px] text-xs outline-none"
                style={{ background: '#fff' }}
              />
              <input
                type="number"
                placeholder="Sell ₹"
                value={newProduct.sellPrice}
                onChange={(e) => setNewProduct({ ...newProduct, sellPrice: e.target.value })}
                className="flex-1 p-2 rounded-[8px] text-xs outline-none"
                style={{ background: '#fff' }}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="flex-1 p-2 rounded-[8px] text-xs outline-none"
                style={{ background: '#fff' }}
              />
              <input
                type="text"
                placeholder="Unit"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                className="flex-1 p-2 rounded-[8px] text-xs outline-none"
                style={{ background: '#fff' }}
              />
            </div>
            <input
              type="date"
              placeholder="Expiry date"
              value={newProduct.expiryDate}
              onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
              className="p-2 rounded-[8px] text-xs outline-none"
              style={{ background: '#fff' }}
            />
            <button
              onClick={addProduct}
              className="w-full py-2.5 rounded-[10px] text-xs font-semibold text-white"
              style={{ background: '#34c759' }}
            >
              Add Product
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-[12px]"
              style={{ background: '#f2f2f7' }}
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-black text-sm font-medium">{p.name}</p>
                  <p className="text-black/40 text-[10px]">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-black text-xs font-semibold">₹{p.sellPrice}</p>
                  <p className="text-black/40 text-[10px]">Stock: {p.stock}</p>
                </div>
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,122,255,0.1)', color: '#007aff' }}>
                  Cost: ₹{p.costPrice}
                </span>
                <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,199,89,0.1)', color: '#34c759' }}>
                  Sold: {p.soldToday}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionBar>
  )
}
