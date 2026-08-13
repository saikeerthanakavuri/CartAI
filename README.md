# 🛒 CartAI - Real-Time Product Detection System

An intelligent shopping cart application with **real-time AI-powered product detection**. When you point your camera at products like Lays, Coca-Cola, or Maggi, the AI instantly recognizes them and adds them to your cart!

## 🚀 New Features - Real-Time Detection

### ✨ What Makes This Special

- **🤖 AI-Powered Recognition**: Uses Google Gemini Vision API to identify products instantly
- **📸 Real-Time Camera Detection**: Point camera → AI detects → Auto adds to cart
- **🎯 High Accuracy**: Advanced visual feature matching with confidence scores
- **⚡ Live Updates**: WebSocket-powered real-time inventory and cart sync
- **📱 Mobile-First**: Optimized for smartphone cameras and touch interfaces

### 🔥 How It Works

1. **Open AI Scanner Tab** - Tap the "📸 AI Scanner" tab in the app
2. **Start Detection** - Hit the "▶️ Start" button to activate camera
3. **Point & Detect** - Aim camera at any product (Lays, Coke, Bread, etc.)
4. **Auto-Add Magic** - High-confidence items (>80%) automatically added to cart
5. **Manual Confirm** - Lower confidence items ask for confirmation
6. **Real-Time Sync** - Cart and inventory update across all devices instantly

### 🛍️ Supported Products

The AI can currently detect:
- 🥔 **Lays Classic** - Yellow packet, potato chips
- 🥤 **Coca-Cola** - Red bottles/cans
- 🍞 **Bread Loaf** - Bakery items
- 🍜 **Maggi Noodles** - Yellow/red instant noodle packets
- 🍫 **Dairy Milk** - Purple Cadbury chocolate
- 🍪 **Parle-G Biscuits** - Orange biscuit packets
- 🥛 **Amul Milk** - Blue/white milk cartons

## 📱 Quick Start

### Option 1: One-Command Setup
```bash
./start.sh
```

### Option 2: Manual Setup

**Backend:**
```bash
# Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start backend server
python backend.py
```

**Frontend:**
```bash
# Install and start frontend
cd frontend
npm install
npm run dev
```

## 🌐 Access Points

- **App**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Technical Architecture

### Frontend (React + Vite)
- **Real-time detection component** with camera integration
- **Gemini Vision API** for AI product recognition
- **WebSocket client** for live updates
- **Responsive mobile UI** with gesture controls

### Backend (FastAPI)
- **RESTful API** for product and cart management
- **WebSocket server** for real-time updates
- **In-memory database** (easily upgradeable to PostgreSQL/MongoDB)
- **Detection analytics** and performance tracking

### AI Detection Pipeline
```
📱 Camera Input → 🤖 Gemini Vision API → 🎯 Visual Feature Matching → 
📊 Confidence Scoring → 🛒 Auto Cart Update → 📡 Real-time Sync
```

## 🎮 Demo Flow

1. **Customer Login** - Enter mobile number to start shopping
2. **Product Detection**:
   - Open "AI Scanner" tab
   - Point camera at Lays packet
   - AI detects: "Lays Classic - 87% confidence"
   - Automatically adds to cart
3. **Real-Time Updates**:
   - Stock levels update instantly
   - Cart syncs across devices
   - Shopkeeper sees live analytics

## 🛠️ Configuration

### Environment Variables (.env)
```env
# Google Gemini AI API Key (for product detection)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Backend URL
VITE_BACKEND_URL=http://localhost:8000
```

### Detection Confidence Levels
- **>90%**: Instant add (very confident)
- **80-90%**: Instant add with notification
- **60-80%**: Ask user confirmation
- **<60%**: Skip detection (too uncertain)

## 🚀 Production Deployment

### Enhancements for Scale
1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **ML Model Training**: Train custom models on store-specific products
3. **Edge Computing**: Run detection on device for privacy/speed
4. **Batch Processing**: Queue detection for high-traffic periods
5. **Analytics Dashboard**: Advanced insights for store owners

### Performance Optimizations
- Image compression before API calls
- Caching for frequent detections
- WebSocket connection pooling
- CDN for product images

## 📊 Detection Analytics

Track performance metrics:
- **Total detections**: Number of products scanned
- **Success rate**: Percentage of accurate detections
- **Top products**: Most frequently detected items
- **Customer behavior**: Shopping patterns and preferences

## 🎯 Business Impact

### For Customers
- **Faster shopping**: No manual product search
- **Error reduction**: AI prevents wrong item selection
- **Seamless experience**: Camera → Cart in seconds

### For Store Owners
- **Live inventory**: Real-time stock tracking
- **Customer insights**: Shopping behavior analytics
- **Reduced checkout time**: Items pre-added to cart

## 🔮 Future Roadmap

### Phase 2: Advanced AI
- **Barcode scanning** integration
- **Multiple product detection** in single frame
- **Voice commands** ("Add Lays to cart")
- **Expiry date detection** from package text

### Phase 3: Smart Features
- **Recommendation engine** based on cart contents
- **Price comparison** with nearby stores
- **Smart promotions** triggered by detections
- **Loyalty program** integration

## 🐛 Troubleshooting

### Camera Issues
- **Permission denied**: Allow camera access in browser
- **Poor detection**: Ensure good lighting and clear product view
- **Slow response**: Check internet connection for AI API calls

### Backend Issues
- **Port 8000 busy**: Kill existing processes or change port
- **API timeout**: Increase request timeout in frontend
- **WebSocket errors**: Restart both frontend and backend

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-detection`
3. Add new product patterns to `productImages.js`
4. Test detection accuracy
5. Submit pull request

## 📄 License

MIT License - Feel free to use in your projects!

## 🙏 Acknowledgments

- **Google Gemini** for Vision API
- **FastAPI** for high-performance backend
- **React + Vite** for smooth frontend experience
- **Framer Motion** for beautiful animations

---

**Ready to revolutionize shopping with AI?** 🚀

Run `./start.sh` and point your camera at a Lays packet to see the magic happen!
