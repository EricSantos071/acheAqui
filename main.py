from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
 
from database import pool  # import the pool from database.py
 
# Import all routers — each file in routers/ handles one schema
from routers import inventory, registers, ordering, analytics
 
# ── Lifespan ───────────────────────────────────────────────────────────────────
# This runs once when uvicorn starts (opens the pool) and once when it stops
# (closes the pool). Keeping it here in main.py keeps database.py clean.
@asynccontextmanager
async def lifespan(app: FastAPI):
    await pool.open()
    yield
    await pool.close()
 
# ── App instance ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="AcheAqui API",
    version="1.1.0",
    lifespan=lifespan,
)
 
# ── CORS ───────────────────────────────────────────────────────────────────────
# This allows your React frontend (running on port 3000) to call this API.
# In production, replace localhost:3000 with your real frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# ── Routers ────────────────────────────────────────────────────────────────────
# Each router is a mini-app that handles its own set of endpoints.
# The prefix means you don't have to repeat /inventory in every route inside
# the inventory router — it's added automatically.
app.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
app.include_router(registers.router, prefix="/registers", tags=["Registers"])
app.include_router(ordering.router,  prefix="/ordering",  tags=["Ordering"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
 
# ── Health check ───────────────────────────────────────────────────────────────
from fastapi import Depends
import psycopg
from database import get_db
 
@app.get("/health", tags=["Health"])
async def health_check(conn: psycopg.AsyncConnection = Depends(get_db())):
    async with conn.cursor() as cursor:
        await cursor.execute("SELECT version();")
        version = await cursor.fetchone()
        return {"status": "ok", "postgres_version": version[0]}
 