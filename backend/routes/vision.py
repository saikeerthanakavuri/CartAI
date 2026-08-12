from fastapi import APIRouter, HTTPException
from models.schemas import IdentifyRequest, IdentifyResponse
import google.generativeai as genai
import base64
import json
import re
import os

router = APIRouter(prefix="/vision", tags=["vision"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAb8RN6KvGkkV86N-I3Ln1pcUO1g4WYFSkAb-x87Cbwqrdlm1Nw")

# Product catalog for price lookup after identification
PRODUCT_CATALOG = [
    {"id": 1,  "name": "Lays Classic",      "keywords": ["lays", "lay's", "chips", "classic salted"],          "price": 30, "emoji": "🥔", "variant": "Classic Salted · 50g"},
    {"id": 2,  "name": "Coca-Cola",         "keywords": ["coca-cola", "coke", "cola", "coca cola"],             "price": 70, "emoji": "🥤", "variant": "Chilled · 330ml Can"},
    {"id": 3,  "name": "Bread Loaf",        "keywords": ["bread", "loaf", "white bread", "wheat bread"],        "price": 40, "emoji": "🍞", "variant": "Whole Wheat · 400g"},
    {"id": 4,  "name": "Maggi Noodles",     "keywords": ["maggi", "noodles", "instant noodles", "masala"],      "price": 30, "emoji": "🍜", "variant": "Masala · 70g"},
    {"id": 5,  "name": "Dairy Milk",        "keywords": ["dairy milk", "cadbury", "chocolate", "dairy"],        "price": 40, "emoji": "🍫", "variant": "Milk Chocolate · 40g"},
    {"id": 6,  "name": "Parle-G Biscuits",  "keywords": ["parle", "parle-g", "biscuit", "glucose biscuit"],     "price": 15, "emoji": "🍪", "variant": "Glucose Biscuits · 100g"},
    {"id": 7,  "name": "Amul Milk",         "keywords": ["amul", "milk", "amul milk", "toned milk"],            "price": 60, "emoji": "🥛", "variant": "Toned Milk · 1L"},
    {"id": 8,  "name": "Kurkure",           "keywords": ["kurkure", "puffed snack", "masala munch"],            "price": 20, "emoji": "🌽", "variant": "Masala Munch · 50g"},
    {"id": 9,  "name": "Frooti",            "keywords": ["frooti", "mango drink", "mango juice", "frooty"],     "price": 15, "emoji": "🥭", "variant": "Mango Drink · 200ml"},
    {"id": 10, "name": "Amul Butter",       "keywords": ["amul butter", "butter", "pasteurised butter"],        "price": 55, "emoji": "🧈", "variant": "Pasteurised · 100g"},
]


def match_product(identified_name: str):
    name_lower = identified_name.lower()
    for product in PRODUCT_CATALOG:
        for keyword in product["keywords"]:
            if keyword in name_lower or name_lower in keyword:
                return product
    return None


@router.post("/identify", response_model=IdentifyResponse)
async def identify_product(payload: IdentifyRequest):
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Decode base64 image
        image_data = payload.image_base64
        if "," in image_data:
            image_data = image_data.split(",")[1]

        image_bytes = base64.b64decode(image_data)

        prompt = """You are a retail product identification AI for an Indian grocery store.
Look at this image and identify the product.

Respond ONLY with a JSON object in this exact format (no markdown, no extra text):
{
  "name": "exact product name",
  "variant": "size/flavor/variant description",
  "confidence": 94.5
}

Be specific - include brand name, flavor, and size if visible.
Examples: "Lays Classic Salted 50g", "Coca-Cola 330ml Can", "Maggi Masala Noodles 70g"
If you cannot identify a product clearly, use your best guess with lower confidence."""

        image_part = {
            "mime_type": "image/jpeg",
            "data": image_bytes,
        }

        response = model.generate_content([prompt, image_part])
        response_text = response.text.strip()

        # Parse JSON response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON in response")

        result = json.loads(json_match.group())
        identified_name = result.get("name", "Unknown Product")
        confidence = float(result.get("confidence", 85.0))

        # Try to match against our catalog
        matched = match_product(identified_name)

        if matched:
            return IdentifyResponse(
                id=matched["id"],
                name=matched["name"],
                variant=matched["variant"],
                price=matched["price"],
                confidence=confidence,
                emoji=matched["emoji"],
            )
        else:
            # Product not in catalog — return identified name with generic price
            return IdentifyResponse(
                id=None,
                name=identified_name,
                variant=result.get("variant", ""),
                price=0.0,
                confidence=confidence,
                emoji="📦",
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision API error: {str(e)}")
