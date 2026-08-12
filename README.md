<div align="center">

# 🛒 CartAI

### Intelligent Retail Assistant for Smarter Shopping and Store Management

*AI-in-Business Cluster: **Retail Intelligence & Decision Support***  
*Target: Small & Medium Indian Retail Businesses*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![AI Powered](https://img.shields.io/badge/Powered%20By-Multimodal%20AI-blueviolet)](https://github.com/saikeerthanakavuri/CartAI)

</div>

---

## 🎯 Project Context

**AI Business Application Cluster:** Retail Intelligence & Decision Support Systems

This project addresses AI adoption barriers identified in research on small and medium Indian businesses, specifically:
- **Technical complexity** → Solved with natural-language AI interface
- **High implementation cost** → Solved with software-only, no-hardware approach  
- **Lack of data literacy** → Solved with automated, explainable insights
- **Trust concerns** → Solved with transparent, own-data-based recommendations

---

## Problem Statement

Small and medium-sized retailers often rely on manual inventory tracking, traditional checkout processes, and intuition-based decisions for product placement and promotions. This can result in stockouts, excess inventory, missed cross-selling opportunities, and inefficient customer service. Store owners may have sales data but lack simple tools to convert it into actionable business insights. Customers also face delays during checkout and receive limited personalized product recommendations.

---

## Proposed Solution

CartAI is a full-stack AI-powered retail intelligence platform designed for small and medium-sized retailers. It combines customer-facing shopping assistance with an intelligent business dashboard.

Customers can use a standard camera to identify products, automatically add them to a digital cart, and receive AI-generated complementary product recommendations. For example, after selecting chips, the system can suggest a suitable dip or beverage based on purchasing patterns.

At the business level, every transaction updates the inventory database and contributes to the store's sales intelligence. The system analyzes historical and real-time sales data to forecast product demand, identify products approaching low-stock levels, and surface actionable insights through a natural-language business copilot — allowing store owners to query their own data in plain English without needing dedicated analysts or complex dashboards.

---

## Innovation & Uniqueness

Unlike conventional retail systems that primarily record transactions, CartAI turns transaction data into actionable business intelligence. Its key innovation is connecting the customer shopping experience directly with the retailer's decision-making system. A single product interaction can trigger a recommendation for the customer while simultaneously updating inventory and sales intelligence for the store owner.

The natural-language business copilot further reduces the technical barrier for small retailers by allowing them to interact with their business data using ordinary questions instead of complex dashboards. This makes advanced AI capabilities accessible without requiring dedicated data analysts or expensive infrastructure.

---

## User Flow

### Entry Point — Mobile Phone UI
On opening the website, users see a **simulated mobile phone frame** on screen. The phone displays a home screen with various app icons, including the CartAI app. Clicking the CartAI app icon presents two login choices:

---

### 👤 Customer Login
- Login via **mobile number**
- After login, the customer accesses the shopping interface:
  - Camera-based product scanning
  - Live cart with AI recommendations
  - QR code checkout

### 🏪 Shopkeeper Login
- Login via **Gmail** (hardcoded credentials)
  - Email: `shopkeeper@gmail.com`
- After login, the shopkeeper accesses the business dashboard:
  - Real-time inventory & sales analytics
  - Low-stock alerts and demand forecasts
  - Natural-language AI business copilot

---

## Core Features

### 📷 1. Camera-Based Product Identification
CartAI uses a **Multimodal Vision AI model** to identify any product held in front of a standard webcam or tablet camera — resolving the product name, variant, and price and adding it directly to the digital cart. No barcode scanner required.

---

### 🧠 2. AI-Powered Product Recommendations
Every product scan triggers an intelligent recommendation engine built on association rule mining (Apriori/FP-Growth). When a customer scans chips, the system surfaces a relevant pairing — *"Add salsa and save 10%"* — based on real purchasing patterns.

**Business impact:** Increases Average Order Value (AOV) on every transaction.

---

### ⚡ 3. Frictionless QR Code Checkout
When a customer is done shopping, CartAI generates an instant **QR code digital receipt**. One scan completes payment and lets them walk out — no cashier needed.

| Traditional Checkout | CartAI |
|---|---|
| ~5 minutes per customer | ~5 seconds per customer |
| Requires a cashier | Fully self-serve |
| Paper receipts | Digital, instant |

---

### 📊 4. Real-Time Inventory & Sales Dashboard
Every product scanned automatically deducts from the inventory database. Store managers get a live dashboard showing:

- Daily and hourly revenue trends
- Top-selling products
- Peak shopping hours
- Live shelf stock levels with low-inventory alerts
- Demand forecasts powered by Scikit-learn

---

### 💬 5. Natural-Language Business Copilot
A conversational AI assistant built into the owner dashboard. Ask it anything in plain English:

> *"Which items are running low on stock?"*
> → *"Sodas are selling 3× faster than usual. Reorder 2 cases now to avoid losing $150 in sales."*

> *"How can I increase profits today?"*
> → *"Your top upsell window is 3–5 PM. Enable the chips + dip bundle discount during that period."*

---

## Expected Impact & Feasibility

CartAI is targeted at small and medium-sized retail stores that cannot afford sophisticated enterprise retail systems. It can help:

- Reduce manual inventory effort
- Identify potential stockouts earlier
- Increase average basket value through relevant recommendations
- Provide faster access to business insights

The system is built as a **software-first solution** using existing cameras and readily available AI APIs, avoiding specialized hardware requirements. A functional prototype can be developed within 24 hours using simulated or sample retail transaction data, demonstrating the complete workflow from product recognition and recommendation to inventory updates, demand forecasting, and AI-generated business insights.

---

## Why It Matters

| Pain Point | CartAI Solution |
|---|---|
| Manual inventory tracking | Real-time automatic deduction on every scan |
| Missed cross-selling opportunities | AI recommendations based on purchase patterns |
| Slow, cashier-dependent checkout | QR code self-checkout in seconds |
| Sales data with no actionable insights | Natural-language business copilot |
| Enterprise tools too expensive | Software-first, no specialized hardware needed |

---

## AI Adoption for Small Indian Businesses

### Research Context
CartAI addresses documented barriers to AI adoption in small and medium Indian retail businesses, particularly in the **Retail Intelligence & Decision Support** cluster of AI business applications.

### Adoption Barriers Addressed

#### 1. **Technical Complexity** → Natural Language Interface
**Barrier:** Shop owners lack technical training to use complex analytics dashboards.  
**Solution:** AI copilot answers questions in plain English:
- "Which items are running low on stock?"
- "How can I increase profits today?"

No SQL queries, no dashboard training needed.

#### 2. **High Implementation Cost** → Software-First Approach
**Barrier:** Enterprise POS and inventory systems cost ₹50,000-500,000 upfront.  
**Solution:** CartAI uses existing cameras and commodity hardware:
- Any webcam or mobile camera works
- SQLite database (free)
- Open-source ML libraries
- Cloud APIs (pay-per-use, not upfront)

**Estimated Cost:** < ₹5,000 for setup

#### 3. **Lack of Data Literacy** → Automated Insights
**Barrier:** Owners don't know what metrics to track or how to interpret them.  
**Solution:** System automatically surfaces insights:
- "Sodas are selling 3× faster than usual. Reorder now."
- "Your top upsell window is 3-5 PM."

No manual analysis required.

#### 4. **Trust & Transparency** → Explainable AI
**Barrier:** Black-box AI systems feel risky; owners don't understand recommendations.  
**Solution:** CartAI shows reasoning:
- "87% of customers buy Coca-Cola with Lays" (shows the data)
- Real-time inventory updates (owner sees it happening)
- Recommendations based on their own store data

#### 5. **Integration Difficulty** → All-in-One System
**Barrier:** Multiple disconnected systems (POS, inventory, CRM) don't talk to each other.  
**Solution:** Single integrated platform:
- Customer scans → Cart updates → Inventory adjusts → Analytics update
- One database, one interface, real-time sync

### Why Small Indian Retailers Would Adopt CartAI

#### Immediate Value
- **Day 1:** See faster checkout (5 min → 5 sec per customer)
- **Week 1:** Get low-stock alerts before running out
- **Month 1:** Identify best-selling combos and optimize stock

#### Low Risk
- **No long-term contract** required
- **No specialized hardware** investment
- **No staff retraining** (customers use their own phones)

#### Built for Indian Context
- Recognizes local products (Parle-G, Amul, Maggi, etc.)
- ₹ currency and pricing
- Works with intermittent internet (local database)
- Mobile-first (customers use phones, not store hardware)

---

## Project Structure

```
CartAI/
├── frontend/               # React.js + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── MobileFrame/        # Mobile phone UI wrapper
│   │   │   ├── HomeScreen/         # App grid / home screen
│   │   │   ├── LoginSelector/      # Customer vs Shopkeeper choice
│   │   │   ├── CustomerLogin/      # Mobile number login
│   │   │   ├── ShopkeeperLogin/    # Gmail login
│   │   │   ├── Cart/               # Customer cart & scanner
│   │   │   └── Dashboard/          # Shopkeeper analytics dashboard
│   │   ├── pages/          # Route-level page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                # Python + FastAPI
│   ├── main.py             # App entry point
│   ├── routes/             # API route handlers
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── cart.py
│   │   ├── inventory.py
│   │   └── copilot.py
│   ├── models/             # DB models & schemas
│   ├── services/           # Business logic
│   │   ├── vision.py       # Multimodal product identification
│   │   ├── recommender.py  # Apriori/FP-Growth engine
│   │   ├── forecasting.py  # Scikit-learn demand forecasting
│   │   └── copilot.py      # LLM API integration
│   ├── database/
│   │   └── cartai.db       # SQLite database
│   └── requirements.txt
│
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS, Framer Motion |
| Camera Integration | HTML5 Camera API (getUserMedia), OpenCV |
| Computer Vision | Multimodal Vision AI API |
| Backend | Python, FastAPI |
| Database | SQLite |
| Recommendation Engine | Python, Pandas, NumPy, MLxtend (Apriori/FP-Growth) |
| Demand Forecasting | Pandas, Scikit-learn |
| AI Business Copilot | LLM API |
| Dashboard & Analytics | Recharts |
| Version Control | Git & GitHub |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/saikeerthanakavuri/CartAI.git
cd CartAI

# Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
```

> Detailed setup, environment variables, and deployment guides will be added as the project develops.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built for the <strong>AI & ML – Retail Business Intelligence</strong> track
</div>
