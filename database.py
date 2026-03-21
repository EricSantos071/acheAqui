import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg
import psycopg_pool
from psycopg.rows import dict_row # useful for returning results as dictionaries
from dotenv import load_dotenv

#1. Load environment variables for security and safe measures (not obligatory btw)
load_dotenv()

#1.5 DB Moved away haha to an .env
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

# Min-Max size applied to no weird behaviour
pool = psycopg_pool.AsyncConnectionPool(DATABASE_URL, open=False, min_size=1, max_size=10) 
# min_size=1  → keeps at least one connection alive (avoids cold-start latency)
# max_size=10 → caps concurrent connections (tune to your Postgres max_connections)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the connection pool startup and shutdown.
    """
    await pool.open()
    yield
    await pool.close()

app = FastAPI(lifespan=lifespan)
# This setup uses FastAPI's lifespan event to open the connection pool on application startup and close it on shutdown.

#2. Create a dependency for database session
async def get_db_connection() -> psycopg.AsyncConnection:
    """
    Dependency that provides an asynchronous database connection from the pool.
    """
    async with pool.connection() as conn:
        yield conn

# Endpoints

#3. Interact with the existing database in your endpoints
@app.get("/items/")
async def read_items(conn: psycopg.AsyncConnection = Depends(get_db_connection)):
    """
    Reads all items from an existing table.
    """
    try:
        async with conn.cursor(row_factory=dict_row) as cursor:
            await cursor.execute("SELECT * FROM items;")
            items = await cursor.fetchall()
            return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/items/{item_id}")
async def read_item(item_id: int, conn: psycopg.AsyncConnection = Depends(get_db_connection)):
    """
    Reads a single item by ID from an existing table or return error if not found.
    """
    try:
        async with conn.cursor(row_factory=dict_row) as cursor:
            await cursor.execute("SELECT * FROM items WHERE id = %s;", (item_id,))
            item = await cursor.fetchone()
            if item is None:
                raise HTTPException(status_code=404, detail="Item not found")
            return item
    except HTTPException:
        raise  # re-raise 404 as-is
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ── 8. Health-check endpoint (useful for debugging connectivity) ───────────────
@app.get("/health")
async def health_check(conn: psycopg.AsyncConnection = Depends(get_db_connection)):
    """Quick connectivity test — returns DB server version."""
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT version();")
            version = await cursor.fetchone()
            return {"status": "ok", "postgres_version": version[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB unreachable: {str(e)}")
    
# ── TO:DO -> CORS — required for any frontend (React, Vue, etc.) ────────────────────
# Replace "http://localhost:3000" with your actual frontend origin in production.

# app.add_middleware(
    #CORSMiddleware,
    #allow_origins=["http://localhost:3000"],  # your frontend URL e.g. ["https://myapp.com"] in prod
    #allow_methods=["*"],
    #allow_headers=["*"],
#)