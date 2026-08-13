const STORAGE_KEY = 'cartai-product-reference-images-v1'

// Seeded from the catalogue photos supplied by the store. Kept in /public so
// the scanner never depends on third-party image URLs or their CORS policy.
export const SEEDED_PRODUCT_REFERENCES = {
  1: ['/product-references/lays-1.jpg', '/product-references/lays-2.jpg', '/product-references/lays-3.jpg'],
  2: ['/product-references/coca-cola-1.jpg', '/product-references/coca-cola-2.jpg', '/product-references/coca-cola-3.jpg'],
  3: ['/product-references/bread-1.jpg', '/product-references/bread-2.jpg', '/product-references/bread-3.jpg'],
  4: ['/product-references/maggi-1.jpg', '/product-references/maggi-2.png', '/product-references/maggi-3.jpg'],
  5: ['/product-references/dairy-milk-1.jpg', '/product-references/dairy-milk-2.jpg', '/product-references/dairy-milk-3.jpg'],
  6: ['/product-references/parle-g-1.jpg', '/product-references/parle-g-2.webp', '/product-references/parle-g-3.jpg'],
  7: ['/product-references/amul-milk-1.jpg', '/product-references/amul-milk-2.jpg', '/product-references/amul-milk-3.jpg'],
}

function readReferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getProductReferences() {
  const saved = readReferences()
  return Object.fromEntries(
    new Set([...Object.keys(SEEDED_PRODUCT_REFERENCES), ...Object.keys(saved)]).values()
      .map(productId => [productId, [...(SEEDED_PRODUCT_REFERENCES[productId] || []), ...(saved[productId] || [])]])
  )
}

export function saveProductReference(productId, imageDataUrl) {
  const references = readReferences()
  references[productId] = [...(references[productId] || []), imageDataUrl]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(references))
  return getProductReferences()
}

// Keep a reference photo small enough for local storage and fast enough to
// include in live vision requests.
export function resizeReferenceImage(file, maxSize = 360) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the image'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('Could not load the image'))
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
