// Product reference images database
export const PRODUCT_TEMPLATES = {
  1: {
    name: "Lays Classic",
    variant: "Classic Salted · 50g",
    price: 30,
    emoji: "🥔",
    templates: [
      {
        // Color signature for Lays
        dominantColors: ["#FFD700", "#FFA500", "#000000"], // Yellow, orange, black
        colorRanges: {
          yellow: { min: 15, max: 100 }, // 15-100% yellow expected
          red: { min: 0, max: 20 },      // 0-20% red allowed
          blue: { min: 0, max: 15 }      // 0-15% blue allowed
        },
        textPatterns: ["LAYS", "CLASSIC", "POTATO"],
        shapeFeatures: {
          aspectRatio: { min: 0.6, max: 1.4 }, // roughly square-ish packet
          rectangularity: 0.7 // packet shape
        }
      }
    ]
  },
  2: {
    name: "Coca-Cola 2L",
    variant: "Beverages · bottles",
    price: 70,
    emoji: "🥤",
    templates: [
      {
        // Color signature for Coca-Cola
        dominantColors: ["#DC143C", "#FFFFFF", "#000000"], // Red, white, black
        colorRanges: {
          // The red label is only a portion of a real 2L bottle (and an even
          // smaller portion of a camera frame), so 20% made Coca-Cola almost
          // impossible to recognise outside of a studio-style photo.
          red: { min: 5, max: 100 },
          // Do not require white: walls and lighting change that dramatically.
          yellow: { min: 0, max: 35 },
          white: { min: 0, max: 100 }
        },
        textPatterns: ["COCA", "COLA", "COKE"],
        shapeFeatures: {
          aspectRatio: { min: 2.0, max: 4.0 }, // tall bottle
          rectangularity: 0.3 // bottle/cylinder shape
        }
      }
    ]
  },
  3: {
    name: "Bread Loaf",
    variant: "Bakery · loaves", 
    price: 40,
    emoji: "🍞",
    templates: [
      {
        // Color signature for Bread
        dominantColors: ["#DEB887", "#F5DEB3", "#8B4513"], // Tan, wheat, brown
        colorRanges: {
          brown: { min: 10, max: 80 },   // 10-80% brown expected
          red: { min: 0, max: 15 },      // 0-15% red allowed
          yellow: { min: 0, max: 30 }    // 0-30% yellow allowed
        },
        textPatterns: ["BREAD", "FRESH", "BAKERY"],
        shapeFeatures: {
          aspectRatio: { min: 1.2, max: 2.5 }, // rectangular loaf
          rectangularity: 0.8 // bread loaf shape
        }
      }
    ]
  },
  4: {
    name: "Maggi Noodles",
    variant: "Masala · 70g",
    price: 30,
    emoji: "🍜",
    templates: [
      {
        // Color signature for Maggi
        dominantColors: ["#FFD700", "#FF0000", "#000000"], // Yellow, red, black
        colorRanges: {
          yellow: { min: 20, max: 100 }, // 20-100% yellow expected
          red: { min: 10, max: 50 },     // 10-50% red expected
          blue: { min: 0, max: 10 }      // 0-10% blue allowed
        },
        textPatterns: ["MAGGI", "NOODLES", "2 MINUTES"],
        shapeFeatures: {
          aspectRatio: { min: 0.8, max: 1.5 }, // packet shape
          rectangularity: 0.75
        }
      }
    ]
  },
  5: {
    name: "Dairy Milk",
    variant: "Milk Chocolate · 40g",
    price: 40,
    emoji: "🍫",
    templates: [
      {
        // Color signature for Dairy Milk
        dominantColors: ["#663399", "#FFD700", "#FFFFFF"], // Purple, gold, white
        colorRanges: {
          purple: { min: 15, max: 80 },  // 15-80% purple expected
          gold: { min: 5, max: 30 },     // 5-30% gold expected
          red: { min: 0, max: 20 }       // 0-20% red allowed
        },
        textPatterns: ["DAIRY MILK", "CADBURY", "CHOCOLATE"],
        shapeFeatures: {
          aspectRatio: { min: 1.5, max: 3.0 }, // chocolate bar
          rectangularity: 0.9
        }
      }
    ]
  },
  6: {
    name: "Parle-G Biscuits",
    variant: "Snacks · packs",
    price: 15,
    emoji: "🍪",
    templates: [
      {
        // Color signature for Parle-G
        dominantColors: ["#FF8C00", "#FFD700", "#8B4513"], // Orange, yellow, brown
        colorRanges: {
          orange: { min: 15, max: 70 },  // 15-70% orange expected
          yellow: { min: 5, max: 40 },   // 5-40% yellow expected
          red: { min: 0, max: 25 }       // 0-25% red allowed
        },
        textPatterns: ["PARLE", "GLUCOSE", "BISCUITS"],
        shapeFeatures: {
          aspectRatio: { min: 0.7, max: 1.3 }, // packet shape
          rectangularity: 0.8
        }
      }
    ]
  },
  7: {
    name: "Amul Milk 1L",
    variant: "Dairy · packets",
    price: 60,
    emoji: "🥛",
    templates: [
      {
        // Color signature for Amul Milk
        dominantColors: ["#0066CC", "#FFFFFF", "#FF0000"], // Blue, white, red
        colorRanges: {
          blue: { min: 15, max: 60 },    // 15-60% blue expected
          white: { min: 20, max: 70 },   // 20-70% white expected
          yellow: { min: 0, max: 15 }    // 0-15% yellow allowed
        },
        textPatterns: ["AMUL", "MILK", "FRESH"],
        shapeFeatures: {
          aspectRatio: { min: 1.8, max: 3.5 }, // tetrapack shape
          rectangularity: 0.85
        }
      }
    ]
  }
}

// Enhanced color detection with better accuracy
export function analyzeImageColors(imageData) {
  const data = imageData.data
  const colorCounts = {
    red: 0, green: 0, blue: 0, yellow: 0, orange: 0, purple: 0, brown: 0, white: 0, black: 0
  }
  let totalPixels = 0
  
  // Sample every 20th pixel for better performance
  for (let i = 0; i < data.length; i += 80) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
    
    if (a < 128) continue // Skip transparent pixels
    totalPixels++
    
    // Color classification with better thresholds
    if (r > 180 && g < 100 && b < 100) colorCounts.red++
    else if (r > 150 && g > 150 && b < 80) colorCounts.yellow++
    else if (r > 200 && g > 100 && b < 50) colorCounts.orange++
    else if (r > 80 && r < 150 && g < 100 && b > 120) colorCounts.purple++
    else if (r > 100 && g > 60 && b < 60) colorCounts.brown++
    else if (r > 200 && g > 200 && b > 200) colorCounts.white++
    else if (r < 80 && g < 80 && b < 80) colorCounts.black++
    else if (r < 100 && g < 150 && b > 120) colorCounts.blue++
    else colorCounts.green++
  }
  
  // Convert to percentages
  const colorPercentages = {}
  Object.keys(colorCounts).forEach(color => {
    colorPercentages[color] = (colorCounts[color] / totalPixels) * 100
  })
  
  return colorPercentages
}

// Template matching algorithm
export function matchProductTemplate(imageData) {
  const colors = analyzeImageColors(imageData)
  const matches = []
  
  console.log('🎨 Image Color Analysis:', colors)
  
  for (const [productId, product] of Object.entries(PRODUCT_TEMPLATES)) {
    for (const template of product.templates) {
      let matchScore = 0
      let totalChecks = 0
      
      // A match must be based on colours that identify this product. The old
      // implementation awarded points merely because a colour was *below* a
      // maximum (for example, a face is not blue), which made unrelated
      // camera scenes look like Lays or other products.
      for (const [color, range] of Object.entries(template.colorRanges)) {
        const actualPercentage = colors[color] || 0
        if (range.min <= 0) continue

        totalChecks++
        
        if (actualPercentage >= range.min && actualPercentage <= range.max) {
          matchScore += 1
          console.log(`✅ ${product.name} - ${color}: ${actualPercentage.toFixed(1)}% (expected: ${range.min}-${range.max}%)`)
        } else {
          console.log(`❌ ${product.name} - ${color}: ${actualPercentage.toFixed(1)}% (expected: ${range.min}-${range.max}%)`)
        }
      }
      
      const confidence = totalChecks > 0 ? matchScore / totalChecks : 0
      
      if (confidence > 0.6) { // At least 60% of color checks must pass
        matches.push({
          productId: parseInt(productId),
          product,
          confidence: confidence,
          matchScore,
          totalChecks
        })
        
        console.log(`🎯 ${product.name} - Match Score: ${matchScore}/${totalChecks} (${(confidence * 100).toFixed(1)}%)`)
      }
    }
  }
  
  // Sort by confidence and return best match
  matches.sort((a, b) => b.confidence - a.confidence)
  
  if (matches.length > 0) {
    console.log(`🏆 Best Match: ${matches[0].product.name} with ${(matches[0].confidence * 100).toFixed(1)}% confidence`)
  }
  
  return matches
}
