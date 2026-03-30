import os
from fastapi import APIRouter, Depends, HTTPException, Header, status
from psycopg.rows import dict_row
import psycopg

from database import get_db
from models.registers import (
    AddressCreate, AddressUpdate, AddressResponse,
    EntrepreneurCreate, EntrepreneurUpdate, EntrepreneurResponse,
    ClientCreate, ClientUpdate, ClientResponse,
)

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# ADDRESS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/address", response_model=list[AddressResponse])
async def get_addresses(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns all addresses."""
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
    """Returns a single address by ID."""
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
    """Creates a new address."""
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
                    address.street,
                    address.house_num,
                    address.street_extra,
                    address.neighborhood,
                    address.zip_code,
                    address.city,
                    address.state,
                    address.country,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/address/{address_id}", response_model=AddressResponse)
async def update_address(
    address_id: int,
    address: AddressUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """Updates an address by ID."""
    try:
        fields = {k: v for k, v in address.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [address_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE address SET {set_clause} WHERE address_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Address not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/address/{address_id}", status_code=200)
async def delete_address(
    address_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """Deletes an address by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM address WHERE address_id = %s RETURNING address_id;",
                (address_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Address not found.")
            return {"message": f"Address {address_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# ENTREPRENEURS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/entrepreneurs", response_model=list[EntrepreneurResponse])
async def get_entrepreneurs(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns all entrepreneurs."""
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
    """Returns a single entrepreneur by ID."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM entrepreneurs WHERE entrepreneurs_id = %s;",
                (entrepreneur_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Entrepreneur not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/entrepreneurs", response_model=EntrepreneurResponse, status_code=201)
async def create_entrepreneur(
    entrepreneur: EntrepreneurCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """Creates a new entrepreneur."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO entrepreneurs (doc_cnpj, phone, status)
                VALUES (%s, %s, %s)
                RETURNING *;
                """,
                (
                    entrepreneur.doc_cnpj,
                    entrepreneur.phone,
                    entrepreneur.status,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/entrepreneurs/{entrepreneur_id}", response_model=EntrepreneurResponse)
async def update_entrepreneur(
    entrepreneur_id: int,
    entrepreneur: EntrepreneurUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """Updates an entrepreneur by ID."""
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


@router.delete("/entrepreneurs/{entrepreneur_id}", status_code=200)
async def delete_entrepreneur(
    entrepreneur_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """Deletes an entrepreneur by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM entrepreneurs WHERE entrepreneurs_id = %s RETURNING entrepreneurs_id;",
                (entrepreneur_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Entrepreneur not found.")
            return {"message": f"Entrepreneur {entrepreneur_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# CLIENTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/clients", response_model=list[ClientResponse])
async def get_clients(conn: psycopg.AsyncConnection = Depends(get_db("registers"))):
    """Returns all clients. Password is never included in response."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM clients;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """Returns a single client by ID."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM clients WHERE clients_id = %s;",
                (client_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Client not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clients", response_model=ClientResponse, status_code=201)
async def create_client(
    client: ClientCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers")),
    x_admin_key: str = Header(..., description="Admin secret key required to use this endpoint.")
):
    """
    Admin-only endpoint to create a client directly.
    Requires the X-Admin-Key header to match the ADMIN_KEY in .env.
    For regular user registration use POST /auth/register instead.
    Password is hashed automatically — plain text never touches the DB.
    """
    # Validate admin key before doing anything else
    if x_admin_key != os.getenv("ADMIN_KEY"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin key."
        )
    try:
        from auth import hash_password  # imported here to avoid circular imports
        async with conn.cursor(row_factory=dict_row) as cur:

            # Check for duplicate email
            await cur.execute(
                "SELECT clients_id FROM clients WHERE email = %s;",
                (client.email,)
            )
            if await cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A client with this email already exists."
                )

            # Hash password before saving
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
                    client.first_name,
                    client.last_name,
                    client.doc_cpf,
                    client.email,
                    client.client_phone,
                    client.birthdate,
                    hashed,
                    client.status,
                    client.address_id,
                    client.entrepreneur_id,
                )
            )
            return await cur.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/clients/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client: ClientUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """Updates a client by ID."""
    try:
        fields = {k: v for k, v in client.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [client_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE clients SET {set_clause} WHERE clients_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Client not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/clients/{client_id}", status_code=200)
async def delete_client(
    client_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """Deletes a client by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM clients WHERE clients_id = %s RETURNING clients_id;",
                (client_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Client not found.")
            return {"message": f"Client {client_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))