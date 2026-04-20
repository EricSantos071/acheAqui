from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import psycopg

from database import pool, get_db
from routers import inventory, registers, ordering, analytics, auth
from auth import get_current_user # fix to get the authentication btn to trigger

@asynccontextmanager
async def lifespan(app: FastAPI):
    await pool.open()
    yield
    await pool.close()

app = FastAPI(
    title="AcheAqui API",
    version="1.2.1",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",  # ← Fix to see if it pulls the API now lol
        ],
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

# -- Authentication Button check
@app.get("/me", tags=["Auth"])
async def get_me(current_user: dict = Depends(get_current_user)):
    """Returns the currently logged-in client's basic info."""
    return {
        "clients_id": current_user["clients_id"],
        "first_name": current_user["first_name"],
        "last_name": current_user["last_name"],
        "email": current_user["email"],
        "is_entrepreneur": current_user["entrepreneur_id"] is not None,
        "entrepreneur_id": current_user["entrepreneur_id"],
    }
 