from fastapi import APIRouter, Depends, HTTPException
from psycopg.rows import dict_row
import psycopg
 
from database import get_db
 
# APIRouter is like a mini FastAPI app.
# We don't add the /inventory prefix here — main.py does that via include_router.
router = APIRouter()
 
 
@router.get("/products")
async def get_products(conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all products."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM products;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/products/{product_id}")
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
 
 
@router.get("/product_images")
async def get_product_images(conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all product images."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM product_images;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/product_images/{product_id}")
async def get_images_by_product(product_id: int, conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all images for a specific product."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM product_images WHERE product_id = %s;", (product_id,))
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/category")
async def get_categories(conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all categories."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM category;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 