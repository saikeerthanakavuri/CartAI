from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = "sqlite:///./cartai.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    cost_price = Column(Float, nullable=False)
    sell_price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False)
    threshold = Column(Integer, nullable=False, default=10)
    unit = Column(String, nullable=False, default="units")
    expiry_date = Column(String, nullable=True)
    sold_today = Column(Integer, nullable=False, default=0)
    sold_yesterday = Column(Integer, nullable=False, default=0)
    barcode = Column(String, nullable=True)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(String, nullable=False)
    mobile = Column(String, nullable=True)
    total = Column(Float, nullable=False)
    discount = Column(Float, nullable=False, default=0)
    items_json = Column(String, nullable=False)  # JSON string of cart items
    offers_json = Column(String, nullable=False, default='[]')  # JSON string of applied offers
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    # Add new columns to existing DB if they don't exist yet (safe migrations)
    with engine.connect() as conn:
        from sqlalchemy import text
        existing = [row[1] for row in conn.execute(text("PRAGMA table_info(transactions)"))]
        if 'discount' not in existing:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN discount FLOAT NOT NULL DEFAULT 0"))
        if 'offers_json' not in existing:
            conn.execute(text("ALTER TABLE transactions ADD COLUMN offers_json TEXT NOT NULL DEFAULT '[]'"))
        conn.commit()
