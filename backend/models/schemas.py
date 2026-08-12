from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    category: str
    cost_price: float
    sell_price: float
    stock: int
    threshold: int = 10
    unit: str = "units"
    expiry_date: Optional[str] = None
    barcode: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    cost_price: Optional[float] = None
    sell_price: Optional[float] = None
    stock: Optional[int] = None
    threshold: Optional[int] = None
    unit: Optional[str] = None
    expiry_date: Optional[str] = None
    sold_today: Optional[int] = None
    sold_yesterday: Optional[int] = None


class ProductOut(ProductBase):
    id: int
    sold_today: int
    sold_yesterday: int

    class Config:
        from_attributes = True


class CartItem(BaseModel):
    id: int
    name: str
    qty: int
    price: float
    emoji: Optional[str] = None
    variant: Optional[str] = None


class CheckoutRequest(BaseModel):
    receipt_id: str
    mobile: Optional[str] = None
    items: List[CartItem]
    total: float


class CheckoutResponse(BaseModel):
    success: bool
    receipt_id: str
    total: float
    message: str


class IdentifyRequest(BaseModel):
    image_base64: str  # base64 encoded image


class IdentifyResponse(BaseModel):
    name: str
    variant: str
    price: float
    confidence: float
    emoji: str
    id: Optional[int] = None


class CopilotRequest(BaseModel):
    question: str


class CopilotResponse(BaseModel):
    answer: str
