#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import json
import asyncio
from datetime import datetime
from typing import List, Dict, Any
import base64
import io
from PIL import Image
import hashlib
import os

app = FastAPI(title="CartAI Backend", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
products_db = [
    {
        "id": 1,
        "name": "Lays Classic",
        "category": "Snacks",
        "cost_price": 20,
        "sell_price": 30,
        "stock": 10,
        "threshold": 15,
        "unit": "packs",
        "expiry_date": "2026-09-15",
        "sold_today": 48,
        "sold_yesterday": 43,
        "barcode": "8901262340015",
    },
    {
        "id": 2,
        "name": "Coca-Cola 2L",
        "category": "Beverages",
        "cost_price": 55,
        "sell_price": 70,
        "stock": 8,
        "threshold": 10,
        "unit": "bottles",
        "expiry_date": "2026-10-20",
        "sold_today": 35,
        "sold_yesterday": 38,
        "barcode": "8901262340022",
    },
    {
        "id": 3,
        "name": "Bread Loaf",
        "category": "Bakery",
        "cost_price": 25,
        "sell_price": 40,
        "stock": 6,
        "threshold": 10,
        "unit": "loaves",
        "expiry_date": "2026-08-13",
        "sold_today": 30,
        "sold_yesterday": 29,
        "barcode": "8901262340039",
    },
    {
        "id": 4,
        "name": "Maggi Noodles",
        "category": "Instant Food",
        "cost_price": 14,
        "sell_price": 30,
        "stock": 12,
        "threshold": 20,
        "unit": "packets",
        "expiry_date": "2027-02-10",
        "sold_today": 27,
        "sold_yesterday": 32,
        "barcode": "8901262340046",
    },
    {
        "id": 5,
        "name": "Dairy Milk",
        "category": "Chocolate",
        "cost_price": 30,
        "sell_price": 40,
        "stock": 15,
        "threshold": 12,
        "unit": "bars",
        "expiry_date": "2026-12-25",
        "sold_today": 22,
        "sold_yesterday": 19,
        "barcode": "8901262340053",
    },
    {
        "id": 6,
        "name": "Parle-G Biscuits",
        "category": "Snacks",
        "cost_price": 10,
        "sell_price": 15,
        "stock": 20,
        "threshold": 30,
        "unit": "packs",
        "expiry_date": "2026-11-30",
        "sold_today": 18,
        "sold_yesterday": 20,
        "barcode": "8901262340060",
    },
    {
        "id": 7,
        "name": "Amul Milk 1L",
        "category": "Dairy",
        "cost_price": 45,
        "sell_price": 60,
        "stock": 5,
        "threshold": 15,
        "unit": "packets",
        "expiry_date": "2026-08-12",
        "sold_today": 12,
        "sold_yesterday": 14,
        "barcode": "8901262340077",
    }
]

# Cart storage (customer_id -> cart_items)
carts_db = {}

# Transaction history
transactions_db = []

# Detection analytics
detection_stats = {
    "total_detections": 0,
    "successful_detections": 0,
    "products_detected": {},
    "daily_stats": {}
}

# WebSocket connections
connected_clients = {}

# Simple product detection simulation
def simulate_product_detection(image_data: bytes) -> List[Dict]:
    """
    Simulate AI product detection based on image analysis.
    In production, this would call actual ML models.
    """
    # Simple simulation - return random products with confidence scores
    import random
    
    detected_products = []
    num_detections = random.randint(0, 2)  # 0-2 products detected
    
    for _ in range(num_detections):
        product = random.choice(products_db)
        confidence = random.uniform(0.6, 0.95)
        
        detected_products.append({
            "product_id": product["id"],
            "product_name": product["name"],
            "confidence": confidence,
            "bounding_box": {
                "x": random.randint(10, 200),
                "y": random.randint(10, 200), 
                "width": random.randint(50, 150),
                "height": random.randint(50, 150)
            }
        })
    
    return detected_products

@app.get("/")
async def root():
    return {"message": "CartAI Backend API", "version": "1.0.0", "status": "running"}

@app.get("/products/")
async def get_products():
    """Get all products from inventory"""
    return products_db

@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    """Get specific product details"""
    product = next((p for p in products_db if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/api/detect-products")
async def detect_products(image: UploadFile = File(...)):
    """Detect products in uploaded image"""
    try:
        # Read image data
        image_data = await image.read()
        
        # Simulate detection (replace with actual AI detection)
        detected = simulate_product_detection(image_data)
        
        # Update stats
        detection_stats["total_detections"] += 1
        if detected:
            detection_stats["successful_detections"] += 1
            
        return {
            "detected_products": detected,
            "timestamp": datetime.now().isoformat(),
            "image_hash": hashlib.md5(image_data).hexdigest()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@app.patch("/api/products/{product_id}/stock")
async def update_product_stock(product_id: int, stock_update: Dict[str, Any]):
    """Update product stock"""
    product = next((p for p in products_db if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    quantity = stock_update.get("quantity", 1)
    operation = stock_update.get("operation", "subtract")
    
    if operation == "add":
        product["stock"] += quantity
    elif operation == "subtract":
        product["stock"] = max(0, product["stock"] - quantity)
    
    # Broadcast stock update to connected clients
    stock_update_msg = {
        "type": "stock_update",
        "payload": {
            "product_id": product_id,
            "new_stock": product["stock"],
            "change": quantity if operation == "add" else -quantity
        }
    }
    
    await broadcast_to_clients(stock_update_msg)
    
    return {"product_id": product_id, "new_stock": product["stock"]}

@app.post("/api/cart/add")
async def add_to_cart(cart_data: Dict[str, Any]):
    """Add item to customer cart"""
    customer_id = cart_data.get("customer_id")
    product_id = cart_data.get("product_id")
    quantity = cart_data.get("quantity", 1)
    
    if not customer_id or not product_id:
        raise HTTPException(status_code=400, detail="Missing customer_id or product_id")
    
    # Get product details
    product = next((p for p in products_db if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check stock
    if product["stock"] < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Initialize cart if doesn't exist
    if customer_id not in carts_db:
        carts_db[customer_id] = []
    
    # Add to cart
    cart = carts_db[customer_id]
    existing_item = next((item for item in cart if item["product_id"] == product_id), None)
    
    if existing_item:
        existing_item["quantity"] += quantity
    else:
        cart.append({
            "product_id": product_id,
            "product_name": product["name"],
            "price": product["sell_price"],
            "quantity": quantity,
            "added_at": datetime.now().isoformat()
        })
    
    # Broadcast cart update
    cart_update_msg = {
        "type": "cart_update",
        "payload": {
            "customer_id": customer_id,
            "cart_items": cart
        }
    }
    
    await broadcast_to_clients(cart_update_msg)
    
    return {"message": "Added to cart", "cart_items": cart}

@app.get("/api/cart/{customer_id}")
async def get_cart(customer_id: str):
    """Get customer cart"""
    cart = carts_db.get(customer_id, [])
    return {"customer_id": customer_id, "cart_items": cart}

@app.post("/api/cart/checkout")
async def checkout(checkout_data: Dict[str, Any]):
    """Process checkout"""
    customer_id = checkout_data.get("customer_id")
    payment_data = checkout_data.get("payment_data", {})
    
    if not customer_id:
        raise HTTPException(status_code=400, detail="Missing customer_id")
    
    cart = carts_db.get(customer_id, [])
    if not cart:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total
    total = sum(item["price"] * item["quantity"] for item in cart)
    
    # Update product stock
    for item in cart:
        product = next((p for p in products_db if p["id"] == item["product_id"]), None)
        if product:
            product["stock"] -= item["quantity"]
            product["sold_today"] += item["quantity"]
    
    # Create transaction record
    transaction = {
        "id": f"TXN{len(transactions_db) + 1:06d}",
        "receipt_id": f"RCP{len(transactions_db) + 1:06d}",
        "customer_id": customer_id,
        "mobile": customer_id,  # Using customer_id as mobile for simplicity
        "items": cart,
        "total": total,
        "payment_method": payment_data.get("method", "unknown"),
        "created_at": datetime.now().isoformat(),
        "status": "completed"
    }
    
    transactions_db.append(transaction)
    
    # Clear cart
    carts_db[customer_id] = []
    
    # Broadcast transaction completion
    transaction_msg = {
        "type": "transaction_completed",
        "payload": transaction
    }
    
    await broadcast_to_clients(transaction_msg)
    
    return transaction

@app.get("/cart/transactions")
async def get_transactions():
    """Get all transactions"""
    return transactions_db

@app.get("/api/analytics/detections")
async def get_detection_analytics(range: str = "24h"):
    """Get detection analytics"""
    return {
        "range": range,
        "stats": detection_stats,
        "top_detected_products": sorted(
            detection_stats.get("products_detected", {}).items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
    }

@app.post("/api/analytics/detection")
async def log_detection(detection_log: Dict[str, Any]):
    """Log detection event for analytics"""
    product_id = str(detection_log.get("product_id"))
    
    if product_id not in detection_stats["products_detected"]:
        detection_stats["products_detected"][product_id] = 0
    
    detection_stats["products_detected"][product_id] += 1
    
    return {"message": "Detection logged"}

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, customer_id: str = None):
    await websocket.accept()
    
    client_id = f"{customer_id or 'anonymous'}_{id(websocket)}"
    connected_clients[client_id] = {
        "websocket": websocket,
        "customer_id": customer_id,
        "connected_at": datetime.now().isoformat()
    }
    
    print(f"Client {client_id} connected")
    
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Echo back or handle specific message types
            await websocket.send_text(json.dumps({
                "type": "echo",
                "payload": message
            }))
            
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
        if client_id in connected_clients:
            del connected_clients[client_id]

async def broadcast_to_clients(message: Dict[str, Any]):
    """Broadcast message to all connected clients"""
    if not connected_clients:
        return
    
    message_str = json.dumps(message)
    disconnected_clients = []
    
    for client_id, client_info in connected_clients.items():
        try:
            await client_info["websocket"].send_text(message_str)
        except:
            disconnected_clients.append(client_id)
    
    # Remove disconnected clients
    for client_id in disconnected_clients:
        connected_clients.pop(client_id, None)

if __name__ == "__main__":
    print("🚀 Starting CartAI Backend Server...")
    print("📱 Frontend URL: http://localhost:5173")
    print("🔗 Backend API: http://localhost:8000")
    print("📊 API Docs: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
