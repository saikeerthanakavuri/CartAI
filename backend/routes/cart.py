from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db, Product, Transaction
from models.schemas import CheckoutRequest, CheckoutResponse
import json

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("/checkout", response_model=CheckoutResponse)
def checkout(payload: CheckoutRequest, db: Session = Depends(get_db)):
    # Validate stock availability
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.id).first()
        if product and product.stock < item.qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {item.name}. Only {product.stock} {product.unit} available."
            )

    # Deduct stock and update sold_today for each item
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.id).first()
        if product:
            product.stock = max(0, product.stock - item.qty)
            product.sold_today = product.sold_today + item.qty

    # Record the transaction (with discount + offers)
    transaction = Transaction(
        receipt_id=payload.receipt_id,
        mobile=payload.mobile,
        total=payload.total,
        discount=payload.discount or 0,
        items_json=json.dumps([item.model_dump() for item in payload.items]),
        offers_json=json.dumps(payload.offers or []),
    )
    db.add(transaction)
    db.commit()

    return CheckoutResponse(
        success=True,
        receipt_id=payload.receipt_id,
        total=payload.total,
        message="Checkout successful! Inventory updated.",
    )


@router.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).order_by(Transaction.created_at.desc()).limit(100).all()
    result = []
    for t in transactions:
        result.append({
            "id": t.id,
            "receipt_id": t.receipt_id,
            "mobile": t.mobile,
            "total": t.total,
            "discount": getattr(t, 'discount', 0) or 0,
            "items": json.loads(t.items_json),
            "offers": json.loads(getattr(t, 'offers_json', None) or '[]'),
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })
    return result
