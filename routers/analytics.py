from fastapi import APIRouter, Depends, HTTPException
from psycopg.rows import dict_row
import psycopg
 
from database import get_db
 
router = APIRouter()
 
 
@router.get("/reviews")
async def get_reviews(conn: psycopg.AsyncConnection = Depends(get_db("analytics"))):
    """Returns all reviews."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM reviews;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/reviews/{product_id}")
async def get_reviews_by_product(product_id: int, conn: psycopg.AsyncConnection = Depends(get_db("analytics"))):
    """Returns all reviews for a specific product."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM reviews WHERE product_id = %s;", (product_id,))
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 