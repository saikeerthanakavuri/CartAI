from database.db import SessionLocal, init_db, Product

SEED_PRODUCTS = [
    {
        "id": 1,
        "name": "Lays Classic",
        "category": "Snacks",
        "cost_price": 20,
        "sell_price": 30,
        "stock": 4,
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
        "stock": 2,
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
        "stock": 3,
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
        "stock": 7,
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
        "stock": 18,
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
        "stock": 25,
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
        "stock": 6,
        "threshold": 15,
        "unit": "packets",
        "expiry_date": "2026-08-12",
        "sold_today": 12,
        "sold_yesterday": 14,
        "barcode": "8901262340077",
    },
]


def seed():
    init_db()
    db = SessionLocal()
    try:
        existing = db.query(Product).count()
        if existing == 0:
            for p in SEED_PRODUCTS:
                db.add(Product(**p))
            db.commit()
            print(f"✅ Seeded {len(SEED_PRODUCTS)} products")
        else:
            print(f"⚡ Database already has {existing} products — skipping seed")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
