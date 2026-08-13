// Shared offers store using localStorage so shopkeeper-created offers
// appear in the customer cart without needing a backend.

const STORAGE_KEY = 'cartai_offers'

const DEFAULT_OFFERS = [
  {
    id: 'o1',
    title: 'Combo Deal 🔥',
    description: 'Buy Lays + Coca-Cola together',
    discount: 'Save ₹10',
    tag: 'HOT',
    color: '#ff3b30',
    bg: 'linear-gradient(135deg, #fff1f0 0%, #ffe4e2 100%)',
    border: 'rgba(255,59,48,0.2)',
    active: true,
  },
  {
    id: 'o2',
    title: 'Happy Hours ⚡',
    description: '3 PM – 5 PM · 15% off all Beverages',
    discount: '15% OFF',
    tag: 'TODAY',
    color: '#007aff',
    bg: 'linear-gradient(135deg, #f0f6ff 0%, #ddeeff 100%)',
    border: 'rgba(0,122,255,0.2)',
    active: true,
  },
  {
    id: 'o3',
    title: 'Snack Bundle 🍫',
    description: 'Any 3 Snacks for just ₹55',
    discount: '₹55 Bundle',
    tag: 'LIMITED',
    color: '#ff9500',
    bg: 'linear-gradient(135deg, #fff9f0 0%, #ffefd6 100%)',
    border: 'rgba(255,149,0,0.2)',
    active: true,
  },
  {
    id: 'o4',
    title: 'Fresh Pick 🍞',
    description: 'Bread + Amul Butter combo',
    discount: 'Save ₹15',
    tag: 'FRESH',
    color: '#34c759',
    bg: 'linear-gradient(135deg, #f0fff4 0%, #d6f5e0 100%)',
    border: 'rgba(52,199,89,0.2)',
    active: true,
  },
]

export function getOffers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (_) {}
  return DEFAULT_OFFERS
}

export function saveOffers(offers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers))
  } catch (_) {}
}

export function addOffer(offer) {
  const offers = getOffers()
  const newOffer = {
    ...offer,
    id: 'o_' + Date.now(),
    active: true,
  }
  const updated = [...offers, newOffer]
  saveOffers(updated)
  return updated
}

export function toggleOffer(id) {
  const offers = getOffers()
  const updated = offers.map(o => o.id === id ? { ...o, active: !o.active } : o)
  saveOffers(updated)
  return updated
}

export function deleteOffer(id) {
  const offers = getOffers()
  const updated = offers.filter(o => o.id !== id)
  saveOffers(updated)
  return updated
}

// Tag → color mapping for new offers
export const TAG_COLORS = {
  'HOT':     { color: '#ff3b30', bg: 'linear-gradient(135deg, #fff1f0 0%, #ffe4e2 100%)', border: 'rgba(255,59,48,0.2)' },
  'TODAY':   { color: '#007aff', bg: 'linear-gradient(135deg, #f0f6ff 0%, #ddeeff 100%)', border: 'rgba(0,122,255,0.2)' },
  'LIMITED': { color: '#ff9500', bg: 'linear-gradient(135deg, #fff9f0 0%, #ffefd6 100%)', border: 'rgba(255,149,0,0.2)' },
  'FRESH':   { color: '#34c759', bg: 'linear-gradient(135deg, #f0fff4 0%, #d6f5e0 100%)', border: 'rgba(52,199,89,0.2)' },
  'DEAL':    { color: '#5856d6', bg: 'linear-gradient(135deg, #f5f0ff 0%, #e8e0ff 100%)', border: 'rgba(88,86,214,0.2)' },
}
