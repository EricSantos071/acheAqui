from fastapi import APIRouter, Depends, HTTPException
from psycopg.rows import dict_row
import psycopg
 
from database import get_db
 
router = APIRouter()
 
 
@router.get("/cart")
async def get_cart(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all cart entries."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM cart;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/orders")
async def get_orders(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all orders."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM orders;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/orders/{order_id}")
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
 
 
@router.get("/payments")
async def get_payments(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all payments."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM payments;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/promos")
async def get_promos(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all promos."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM promos;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/transactions")
async def get_transactions(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all transactions."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM transactions;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/delivery")
async def get_delivery(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all delivery records."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM delivery;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 