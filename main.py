from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import pool
from routers import inventory, registers, ordering, analytics
from routers import auth  # ← new

@asynccontextmanager
async def lifespan(app: FastAPI):
    await pool.open()
    yield
    await pool.close()

app = FastAPI(
    title="AcheAqui API",
    version="1.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/auth",      tags=["Auth"])
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