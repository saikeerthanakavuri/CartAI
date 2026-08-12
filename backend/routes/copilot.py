from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db, Product
from models.schemas import CopilotRequest, CopilotResponse
import google.generativeai as genai
from datetime import date, timedelta
import os

router = APIRouter(prefix="/copilot", tags=["copilot"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAb8RN6KvGkkV86N-I3Ln1pcUO1g4WYFSkAb-x87Cbwqrdlm1Nw")


def build_store_context(db: Session) -> str:
    products = db.query(Product).all()
    today = date.today()
    three_days = today + timedelta(days=3)

    total_revenue = sum(p.sell_price * p.sold_today for p in products)
    total_profit = sum((p.sell_price - p.cost_price) * p.sold_today for p in products)
    top_sellers = sorted(products, key=lambda p: p.sold_today, reverse=True)[:3]

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

    context = f"""
Current Store Data ({today.strftime('%d %B %Y')}):
- Total Revenue Today: ₹{total_revenue:,.0f}
- Total Profit Today: ₹{total_profit:,.0f} ({round((total_profit/total_revenue)*100) if total_revenue > 0 else 0}% margin)
- Total Products: {len(products)}

Top 3 Sellers Today:
{chr(10).join(f"{i+1}. {p.name} — {p.sold_today} units sold (₹{p.sell_price} each)" for i, p in enumerate(top_sellers))}

Critical Stock ({len(critical)} items):
{chr(10).join(f"- {p.name}: only {p.stock} {p.unit} left (threshold: {p.threshold})" for p in critical) or "None"}

Low Stock ({len(low)} items):
{chr(10).join(f"- {p.name}: {p.stock} {p.unit} left" for p in low) or "None"}

Expiring Soon ({len(expiring)} items):
{chr(10).join(f"- {p.name}: expires {p.expiry_date}, {p.stock} left" for p in expiring) or "None"}

Dropping Sales ({len(dropping)} items):
{chr(10).join(f"- {p.name}: {p.sold_today} today vs {p.sold_yesterday} yesterday" for p in dropping) or "None"}

All Products:
{chr(10).join(f"- {p.name} ({p.category}): cost ₹{p.cost_price}, sell ₹{p.sell_price}, stock {p.stock} {p.unit}, sold today {p.sold_today}" for p in products)}
    """.strip()

    return context


@router.post("/ask", response_model=CopilotResponse)
async def ask_copilot(payload: CopilotRequest, db: Session = Depends(get_db)):
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        store_context = build_store_context(db)

        prompt = f"""You are an AI business copilot for a small Indian retail store owner.
You have access to their real-time store data below.

{store_context}

Shopkeeper's question: {payload.question}

Instructions:
- Give practical, actionable advice specific to this store's data
- Be concise and friendly — keep it under 120 words unless deep analysis is needed
- Use ₹ for currency
- Reference actual product names and numbers from the data
- Suggest realistic actions they can take today
- Use emojis sparingly to highlight key points

Answer:"""

        response = model.generate_content(prompt)
        answer = response.text.strip()

        return CopilotResponse(answer=answer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot error: {str(e)}")
