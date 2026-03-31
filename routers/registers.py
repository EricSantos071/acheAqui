import os
from fastapi import APIRouter, Depends, HTTPException, Header, status
from psycopg.rows import dict_row
import psycopg

from database import get_db
from auth import get_current_user
from models.registers import (
    AddressCreate, AddressUpdate, AddressResponse,
    EntrepreneurCreate, EntrepreneurUpdate, EntrepreneurResponse,
    ClientCreate, ClientUpdate, ClientResponse,
)

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# ADDRESS — public reads, protected writes
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/address", response_model=list[AddressResponse])
async def get_addresses(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM address;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/address/{address_id}", response_model=AddressResponse)
async def get_address(
    address_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM address WHERE address_id = %s;", (address_id,))
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Address not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/address", response_model=AddressResponse, status_code=201)
async def create_address(
    address: AddressCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """Public — anyone can create an address (needed before registration)."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO address
                    (street, house_num, street_extra, neighborhood,
                     zip_code, city, state, country)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    address.street, address.house_num, address.street_extra,
                    address.neighborhood, address.zip_code, address.city,
                    address.state, address.country,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/address/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: int,
    address: AddressUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers")),
    current_user: dict = Depends(get_current_user)
):
    """Must be logged in to update an address."""
    try:
        fields = {k: v for k, v in address.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [address_id]
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE address SET {set_clause} WHERE address_id = %s RETURNING *;", values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Address not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/address/{address_id}")
async def delete_address(
    address_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("registers")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM address WHERE address_id = %s RETURNING address_id;", (address_id,)
            )
            if await cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="Address not found.")
            return {"message": f"Address {address_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# ENTREPRENEURS — public reads, protected writes
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/entrepreneurs", response_model=list[EntrepreneurResponse])
async def get_entrepreneurs(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM entrepreneurs;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entrepreneurs/{entrepreneur_id}", response_model=EntrepreneurResponse)
async def get_entrepreneur(
    entrepreneur_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM entrepreneurs WHERE entrepreneurs_id = %s;", (entrepreneur_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Entrepreneur not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/entrepreneurs/{entrepreneur_id}", response_model=EntrepreneurResponse)
async def update_entrepreneur(
    entrepreneur_id: int,
    entrepreneur: EntrepreneurUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers")),
    current_user: dict = Depends(get_current_user)
):
    """Only the entrepreneur themselves can update their record."""
    if current_user["entrepreneur_id"] != entrepreneur_id:
        raise HTTPException(status_code=403, detail="You can only update your own business.")
    try:
        fields = {k: v for k, v in entrepreneur.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [entrepreneur_id]
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE entrepreneurs SET {set_clause} WHERE entrepreneurs_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Entrepreneur not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# CLIENTS — protected reads and writes
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/clients/me", response_model=ClientResponse)
async def get_my_profile(
    conn: psycopg.AsyncConnection = Depends(get_db("registers")),
    current_user: dict = Depends(get_current_user)
):
    """Returns the logged-in client's own profile."""
    return current_user


@router.post("/clients", response_model=ClientResponse, status_code=201)
async def create_client(
    client: ClientCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers")),
    x_admin_key: str = Header(..., description="Admin secret key required.")
):
    """Admin-only endpoint. Use POST /auth/register for normal registration."""
    if x_admin_key != os.getenv("ADMIN_KEY"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin key.")
    try:
        from auth import hash_password
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT clients_id FROM clients WHERE email = %s;", (client.email,)
            )
            if await cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered.")

            hashed = hash_password(client.password)
            await cur.execute(
                """
                INSERT INTO clients
                    (first_name, last_name, doc_cpf, email, client_phone,
                     birthdate, password, status, address_id, entrepreneur_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    client.first_name, client.last_name, client.doc_cpf,
                    client.email, client.client_phone, client.birthdate,
                    hashed, client.status, client.address_id, client.entrepreneur_id,
                )
            )
            return await cur.fetchone()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/clients/me", response_model=ClientResponse)
async def update_my_profile(
    client: ClientUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers")),
    current_user: dict = Depends(get_current_user)
):
    """Clients can only update their own profile."""
    try:
        fields = {k: v for k, v in client.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [current_user["clients_id"]]
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE clients SET {set_clause} WHERE clients_id = %s RETURNING *;", values
            )
            return await cur.fetchone()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/clients/me")
async def delete_my_account(
    conn: psycopg.AsyncConnection = Depends(get_db("registers")),
    current_user: dict = Depends(get_current_user)
):
    """Clients can only delete their own account."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM clients WHERE clients_id = %s;",
                (current_user["clients_id"],)
            )
            return {"message": "Account deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))