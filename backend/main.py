from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import init_db
from database.seed import seed
from routes import products, cart, vision, copilot

app = FastAPI(
    title="CartAI Backend",
    description="AI-powered retail intelligence API",
    version="1.0.0",
)

# CORS — allow frontend dev server and any origin for demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    seed()
    print("🛒 CartAI backend started")


@app.get("/")
def root():
    return {"status": "ok", "message": "CartAI API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# Register routes
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(vision.router)
app.include_router(copilot.router)
