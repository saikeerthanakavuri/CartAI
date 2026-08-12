from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.db import get_db, Product
from models.schemas import ProductOut, ProductCreate, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[ProductOut])
def get_all_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"success": True, "message": f"Product {product_id} deleted"}


@router.get("/alerts/summary")
def get_alerts_summary(db: Session = Depends(get_db)):
    from datetime import date, timedelta
    products = db.query(Product).all()
    today = date.today()
    three_days = today + timedelta(days=3)

    critical = [p for p in products if p.stock <= p.threshold * 0.2]
    low = [p for p in products if p.threshold * 0.2 < p.stock <= p.threshold * 0.5]
    expiring = [
        p for p in products
        if p.expiry_date and today <= date.fromisoformat(p.expiry_date) <= three_days
    ]
    dropping = [
        p for p in products
        if p.sold_yesterday > 0 and
        ((p.sold_yesterday - p.sold_today) / p.sold_yesterday) * 100 > 15
    ]

    total_revenue = sum(p.sell_price * p.sold_today for p in products)
    total_profit = sum((p.sell_price - p.cost_price) * p.sold_today for p in products)

    return {
        "revenue_today": total_revenue,
        "profit_today": total_profit,
        "critical_stock": [{"id": p.id, "name": p.name, "stock": p.stock, "threshold": p.threshold, "unit": p.unit} for p in critical],
        "low_stock": [{"id": p.id, "name": p.name, "stock": p.stock, "threshold": p.threshold, "unit": p.unit} for p in low],
        "expiring_soon": [{"id": p.id, "name": p.name, "expiry_date": p.expiry_date, "stock": p.stock} for p in expiring],
        "dropping_sales": [{"id": p.id, "name": p.name, "sold_today": p.sold_today, "sold_yesterday": p.sold_yesterday} for p in dropping],
    }
