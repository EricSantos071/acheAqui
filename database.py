import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg
import psycopg_pool
from psycopg.rows import dict_row # useful for returning results as dictionaries
from pathlib import Path # Searching stuff on directories
from dotenv import load_dotenv

#1. Load environment variables for security and safe measures (not obligatory btw) -------------------
# Always loads .env from the same folder as database.py
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

#Testing if it connects
print(">>> DATABASE_URL:", os.getenv("DATABASE_URL"))

#1.5 DB Moved away haha to an .env
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

# Min-Max size applied to avoid weird behaviour in Environment --------------------------------------
pool = psycopg_pool.AsyncConnectionPool(DATABASE_URL, open=False, min_size=1, max_size=10) 
# min_size=1  → keeps at least one connection alive (avoids cold-start latency)
# max_size=10 → caps concurrent connections (tune to your Postgres max_connections)

# Lifespan Manages the connection pool startup and shutdown.-----------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    await pool.open()
    yield
    await pool.close()

# App -----------------------------------------------------------------------------------------------
app = FastAPI(
    title="AcheAqui API", 
    version="1.0.0", 
    lifespan=lifespan,
)

# This is the future Front-End port, that's why it should be kep at 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # your frontend URL e.g. ["https://myapp.com"] in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#2. Schema-aware DB Dependency ---------------------------------------------------------------------
def get_db(schema: str = "public"):
    async def _get_conn() -> psycopg.AsyncConnection:
        async with pool.connection() as conn:
            await conn.execute(f"SET search_path TO {schema}, public;")
            yield conn
    return _get_conn

# Health-check endpoint (useful for debugging connectivity) ───────────────------------------------
@app.get("/health", tags=["Health"])
async def health_check(conn: psycopg.AsyncConnection = Depends(get_db())):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT version();")
            version = await cursor.fetchone()
            return {"status": "ok", "postgres_version": version[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB unreachable: {str(e)}")
    
# ══════════════════════════════════════════════════════════════════════════════
# REGISTERS SCHEMA — clients, address, entrepreneurs
# ══════════════════════════════════════════════════════════════════════════════
 
REGISTERS_TABLES = ["clients", "address", "entrepreneurs"]
 
@app.get("/registers/clients", tags=["Registers"])
async def get_clients(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns all clients."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM clients;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/registers/clients/{client_id}", tags=["Registers"])
async def get_client(client_id: int, conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns a single client by ID."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM clients WHERE id = %s;", (client_id,))
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Client not found")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/registers/address", tags=["Registers"])
async def get_addresses(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns all addresses."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM address;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/registers/entrepreneurs", tags=["Registers"])
async def get_entrepreneurs(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns all entrepreneurs."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM entrepreneurs;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/registers/entrepreneurs/{entrepreneur_id}", tags=["Registers"])
async def get_entrepreneur(entrepreneur_id: int, conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns a single entrepreneur by ID."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM entrepreneurs WHERE id = %s;", (entrepreneur_id,))
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Entrepreneur not found")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
# ══════════════════════════════════════════════════════════════════════════════
# INVENTORY SCHEMA — products, product_images, category
# ══════════════════════════════════════════════════════════════════════════════
 
@app.get("/inventory/products", tags=["Inventory"])
async def get_products(conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all products."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM products;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/inventory/products/{product_id}", tags=["Inventory"])
async def get_product(product_id: int, conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns a single product by ID."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM products WHERE id = %s;", (product_id,))
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Product not found")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/inventory/product_images", tags=["Inventory"])
async def get_product_images(conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all product images."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM product_images;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/inventory/product_images/{product_id}", tags=["Inventory"])
async def get_images_by_product(product_id: int, conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all images for a specific product."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM product_images WHERE product_id = %s;", (product_id,))
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/inventory/category", tags=["Inventory"])
async def get_categories(conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all categories."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM category;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ══════════════════════════════════════════════════════════════════════════════
# ORDERING SYSTEM SCHEMA — cart, orders, payments, promos, transactions, delivery
# ══════════════════════════════════════════════════════════════════════════════
 
@app.get("/ordering/cart", tags=["Ordering"])
async def get_cart(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all cart entries."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM cart;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/ordering/orders", tags=["Ordering"])
async def get_orders(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all orders."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM orders;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/ordering/orders/{order_id}", tags=["Ordering"])
async def get_order(order_id: int, conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns a single order by ID."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM orders WHERE id = %s;", (order_id,))
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Order not found")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/ordering/payments", tags=["Ordering"])
async def get_payments(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all payments."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM payments;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/ordering/promos", tags=["Ordering"])
async def get_promos(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all promos."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM promos;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/ordering/transactions", tags=["Ordering"])
async def get_transactions(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all transactions."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM transactions;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/ordering/delivery", tags=["Ordering"])
async def get_delivery(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all delivery records."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM delivery;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
# ══════════════════════════════════════════════════════════════════════════════
# ANALYTICS SCHEMA — reviews
# ══════════════════════════════════════════════════════════════════════════════
 
@app.get("/analytics/reviews", tags=["Analytics"])
async def get_reviews(conn: psycopg.AsyncConnection = Depends(get_db("analytics"))):
    """Returns all reviews."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM reviews;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.get("/analytics/reviews/{product_id}", tags=["Analytics"])
async def get_reviews_by_product(product_id: int, conn: psycopg.AsyncConnection = Depends(get_db("analytics"))):
    """Returns all reviews for a specific product."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM reviews WHERE product_id = %s;", (product_id,))
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
