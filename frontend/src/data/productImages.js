// Product image database with detection keywords and visual features
export const PRODUCT_IMAGES = {
  1: {
    name: 'Lays Classic',
    keywords: ['lays', 'chips', 'yellow', 'packet', 'crisp', 'potato'],
    colors: ['#FFD700', '#FF6B35', '#000000'], // Yellow, orange, black
    shapes: ['rectangular', 'packet'],
    brandLogo: 'lays',
    textPatterns: ['LAYS', 'CLASSIC', 'POTATO'],
    visualFeatures: {
      primaryColor: '#FFD700',
      hasLogo: true,
      logoPosition: 'center-top',
      packageType: 'foil-packet',
      textColor: '#000000'
    },
    imageUrl: '/images/products/lays-classic.jpg',
    barcodes: ['8901262340015'],
    confidence: 0.85
  },
  2: {
    name: 'Coca-Cola 2L',
    keywords: ['coca', 'cola', 'coke', 'red', 'bottle', 'drink'],
    colors: ['#DC143C', '#FFFFFF', '#000000'], // Red, white, black
    shapes: ['bottle', 'cylindrical'],
    brandLogo: 'coca-cola',
    textPatterns: ['COCA', 'COLA', 'COKE'],
    visualFeatures: {
      primaryColor: '#DC143C',
      hasLogo: true,
      logoPosition: 'center',
      packageType: 'plastic-bottle',
      textColor: '#FFFFFF'
    },
    imageUrl: '/images/products/coca-cola-2l.jpg',
    barcodes: ['8901262340022'],
    confidence: 0.90
  },
  3: {
    name: 'Bread Loaf',
    keywords: ['bread', 'loaf', 'white', 'bakery', 'slice'],
    colors: ['#DEB887', '#F5DEB3', '#8B4513'], // Tan, wheat, brown
    shapes: ['rectangular', 'loaf'],
    brandLogo: 'generic',
    textPatterns: ['BREAD', 'FRESH', 'BAKERY'],
    visualFeatures: {
      primaryColor: '#DEB887',
      hasLogo: false,
      logoPosition: 'none',
      packageType: 'plastic-bag',
      textColor: '#8B4513'
    },
    imageUrl: '/images/products/bread-loaf.jpg',
    barcodes: ['8901262340039'],
    confidence: 0.75
  },
  4: {
    name: 'Maggi Noodles',
    keywords: ['maggi', 'noodles', 'yellow', 'red', 'packet', 'instant'],
    colors: ['#FFD700', '#FF0000', '#000000'], // Yellow, red, black
    shapes: ['rectangular', 'packet'],
    brandLogo: 'maggi',
    textPatterns: ['MAGGI', 'NOODLES', '2 MINUTES'],
    visualFeatures: {
      primaryColor: '#FFD700',
      hasLogo: true,
      logoPosition: 'top-left',
      packageType: 'foil-packet',
      textColor: '#FF0000'
    },
    imageUrl: '/images/products/maggi-noodles.jpg',
    barcodes: ['8901262340046'],
    confidence: 0.88
  },
  5: {
    name: 'Dairy Milk',
    keywords: ['dairy', 'milk', 'chocolate', 'purple', 'cadbury'],
    colors: ['#663399', '#FFD700', '#FFFFFF'], // Purple, gold, white
    shapes: ['rectangular', 'bar'],
    brandLogo: 'cadbury',
    textPatterns: ['DAIRY MILK', 'CADBURY', 'CHOCOLATE'],
    visualFeatures: {
      primaryColor: '#663399',
      hasLogo: true,
      logoPosition: 'center',
      packageType: 'foil-wrapper',
      textColor: '#FFD700'
    },
    imageUrl: '/images/products/dairy-milk.jpg',
    barcodes: ['8901262340053'],
    confidence: 0.92
  },
  6: {
    name: 'Parle-G Biscuits',
    keywords: ['parle', 'biscuit', 'orange', 'yellow', 'packet', 'glucose'],
    colors: ['#FF8C00', '#FFD700', '#8B4513'], // Orange, yellow, brown
    shapes: ['rectangular', 'packet'],
    brandLogo: 'parle',
    textPatterns: ['PARLE-G', 'GLUCOSE', 'BISCUITS'],
    visualFeatures: {
      primaryColor: '#FF8C00',
      hasLogo: true,
      logoPosition: 'top-center',
      packageType: 'plastic-packet',
      textColor: '#8B4513'
    },
    imageUrl: '/images/products/parle-g.jpg',
    barcodes: ['8901262340060'],
    confidence: 0.80
  },
  7: {
    name: 'Amul Milk 1L',
    keywords: ['amul', 'milk', 'blue', 'white', 'packet', 'dairy'],
    colors: ['#0066CC', '#FFFFFF', '#FF0000'], // Blue, white, red
    shapes: ['rectangular', 'tetrapack'],
    brandLogo: 'amul',
    textPatterns: ['AMUL', 'MILK', 'FRESH'],
    visualFeatures: {
      primaryColor: '#0066CC',
      hasLogo: true,
      logoPosition: 'top-left',
      packageType: 'tetrapack',
      textColor: '#FFFFFF'
    },
    imageUrl: '/images/products/amul-milk.jpg',
    barcodes: ['8901262340077'],
    confidence: 0.85
  }
}

// AI Detection helper functions
export const findProductByVisualFeatures = (detectedFeatures) => {
  const matches = []
  
  for (const [id, product] of Object.entries(PRODUCT_IMAGES)) {
    let confidence = 0
    
    // Color matching
    if (detectedFeatures.colors) {
      const colorMatches = product.colors.filter(color => 
        detectedFeatures.colors.some(detected => 
          colorSimilarity(color, detected) > 0.7
        )
      )
      confidence += (colorMatches.length / product.colors.length) * 0.3
    }
    
    // Text pattern matching
    if (detectedFeatures.text) {
      const textMatches = product.textPatterns.filter(pattern =>
        detectedFeatures.text.toUpperCase().includes(pattern)
      )
      confidence += (textMatches.length / product.textPatterns.length) * 0.4
    }
    
    // Keyword matching
    if (detectedFeatures.keywords) {
      const keywordMatches = product.keywords.filter(keyword =>
        detectedFeatures.keywords.some(detected => 
          detected.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(detected.toLowerCase())
        )
      )
      confidence += (keywordMatches.length / product.keywords.length) * 0.3
    }
    
    if (confidence > 0.6) {
      matches.push({
        productId: parseInt(id),
        product: product,
        confidence: confidence * product.confidence
      })
    }
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence)
}

// Color similarity function (simple RGB distance)
function colorSimilarity(color1, color2) {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  )
  
  return 1 - (distance / 441.67) // Max distance for RGB
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Barcode lookup
export const findProductByBarcode = (barcode) => {
  for (const [id, product] of Object.entries(PRODUCT_IMAGES)) {
    if (product.barcodes.includes(barcode)) {
      return {
        productId: parseInt(id),
        product: product,
        confidence: 1.0
      }
    }
  }
  return null
}

// Quick product search by name
export const findProductByName = (searchName) => {
  for (const [id, product] of Object.entries(PRODUCT_IMAGES)) {
    if (product.name.toLowerCase().includes(searchName.toLowerCase()) ||
        product.keywords.some(keyword => 
          searchName.toLowerCase().includes(keyword.toLowerCase())
        )) {
      return {
        productId: parseInt(id),
        product: product,
        confidence: 0.95
      }
    }
  }
  return null
}
