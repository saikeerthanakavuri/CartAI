// Shared product catalog for both shopkeeper and customer
export const PRODUCTS = [
  {
    id: 1,
    name: 'Lays Classic',
    category: 'Snacks',
    costPrice: 20,
    sellPrice: 30,
    stock: 4,
    threshold: 15,
    unit: 'packs',
    expiryDate: '2026-09-15',
    soldToday: 48,
    soldYesterday: 43,
    barcode: '8901262340015',
  },
  {
    id: 2,
    name: 'Coca-Cola 2L',
    category: 'Beverages',
    costPrice: 55,
    sellPrice: 70,
    stock: 2,
    threshold: 10,
    unit: 'bottles',
    expiryDate: '2026-10-20',
    soldToday: 35,
    soldYesterday: 38,
    barcode: '8901262340022',
  },
  {
    id: 3,
    name: 'Bread Loaf',
    category: 'Bakery',
    costPrice: 25,
    sellPrice: 40,
    stock: 3,
    threshold: 10,
    unit: 'loaves',
    expiryDate: '2026-08-13',
    soldToday: 30,
    soldYesterday: 29,
    barcode: '8901262340039',
  },
  {
    id: 4,
    name: 'Maggi Noodles',
    category: 'Instant Food',
    costPrice: 14,
    sellPrice: 30,
    stock: 7,
    threshold: 20,
    unit: 'packets',
    expiryDate: '2027-02-10',
    soldToday: 27,
    soldYesterday: 32,
    barcode: '8901262340046',
  },
  {
    id: 5,
    name: 'Dairy Milk',
    category: 'Chocolate',
    costPrice: 30,
    sellPrice: 40,
    stock: 18,
    threshold: 12,
    unit: 'bars',
    expiryDate: '2026-12-25',
    soldToday: 22,
    soldYesterday: 19,
    barcode: '8901262340053',
  },
  {
    id: 6,
    name: 'Parle-G Biscuits',
    category: 'Snacks',
    costPrice: 10,
    sellPrice: 15,
    stock: 25,
    threshold: 30,
    unit: 'packs',
    expiryDate: '2026-11-30',
    soldToday: 18,
    soldYesterday: 20,
    barcode: '8901262340060',
  },
  {
    id: 7,
    name: 'Amul Milk 1L',
    category: 'Dairy',
    costPrice: 45,
    sellPrice: 60,
    stock: 6,
    threshold: 15,
    unit: 'packets',
    expiryDate: '2026-08-12',
    soldToday: 12,
    soldYesterday: 14,
    barcode: '8901262340077',
  },
]

// Helper functions
export const getTotalRevenue = (products) => {
  return products.reduce((sum, p) => sum + p.sellPrice * p.soldToday, 0)
}

export const getTotalProfit = (products) => {
  return products.reduce((sum, p) => sum + (p.sellPrice - p.costPrice) * p.soldToday, 0)
}

export const getCriticalStock = (products) => {
  return products.filter((p) => p.stock <= p.threshold * 0.2)
}

export const getLowStock = (products) => {
  return products.filter((p) => p.stock > p.threshold * 0.2 && p.stock <= p.threshold * 0.5)
}

export const getExpiringSoon = (products) => {
  const today = new Date()
  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(today.getDate() + 3)
  
  return products.filter((p) => {
    const expiry = new Date(p.expiryDate)
    return expiry <= threeDaysFromNow && expiry >= today
  })
}

export const getDroppingSales = (products) => {
  return products.filter((p) => {
    const dropPercent = ((p.soldYesterday - p.soldToday) / p.soldYesterday) * 100
    return dropPercent > 15 // More than 15% drop
  })
}
