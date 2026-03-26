from fastapi import APIRouter, Depends, HTTPException
from psycopg.rows import dict_row
import psycopg
 
from database import get_db
 
router = APIRouter()
 
 
@router.get("/clients")
async def get_clients(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns all clients."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM clients;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/clients/{client_id}")
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
 
 
@router.get("/address")
async def get_addresses(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns all addresses."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM address;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/entrepreneurs")
async def get_entrepreneurs(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns all entrepreneurs."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM entrepreneurs;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
@router.get("/entrepreneurs/{entrepreneur_id}")
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
 