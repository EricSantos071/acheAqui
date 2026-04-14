from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from psycopg.rows import dict_row
from pydantic import BaseModel
import psycopg

from database import get_db
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user
)
from models.registers import ClientCreate, ClientResponse

router = APIRouter()


# ── Register client ────────────────────────────────────────────────────────────
@router.post("/register", response_model=ClientResponse, status_code=201)
async def register(
    client: ClientCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """
    Registers a new client.

    Minimal required fields:
      - first_name, last_name
      - doc_cpf, email, client_phone
      - birthdate
      - password (min 8 chars, max 72)

    Optional fields (can be added later):
      - address_id    → client adds address when placing first order
      - entrepreneur_id → added via POST /auth/register/entrepreneur

    This matches real e-commerce flow — don't ask for address on signup.
    """
    try:
        async with conn.cursor(row_factory=dict_row) as cur:

            # Check for duplicate email
            await cur.execute(
                "SELECT clients_id FROM clients WHERE email = %s;",
                (client.email,)
            )
            if await cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Este e-mail já está cadastrado. / This email is already registered."
                )

            # Check for duplicate CPF
            await cur.execute(
                "SELECT clients_id FROM clients WHERE doc_cpf = %s;",
                (client.doc_cpf,)
            )
            if await cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Este CPF já está cadastrado. / This CPF is already registered."
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
                    client.address_id,       # None is fine — DB column is nullable
                    client.entrepreneur_id,  # None is fine — DB column is nullable
                )
            )
            return await cur.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Register entrepreneur ──────────────────────────────────────────────────────
class EntrepreneurRegister(BaseModel):
    doc_cnpj: str
    phone: str


@router.post("/register/entrepreneur", status_code=200)
async def register_entrepreneur(
    data: EntrepreneurRegister,
    conn: psycopg.AsyncConnection = Depends(get_db("registers")),
    current_user: dict = Depends(get_current_user)
):
    """
    Registers a business for an already logged-in client.

    Flow:
      1. Client registers via POST /auth/register (no business yet)
      2. Client logs in → gets token
      3. Client hits this endpoint with CNPJ + phone
      4. Entrepreneur record created and linked to client automatically

    A client can only register one business.
    """
    try:
        async with conn.cursor(row_factory=dict_row) as cur:

            # Check client doesn't already have a business
            if current_user["entrepreneur_id"] is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Você já possui um negócio cadastrado. / You already have a registered business."
                )

            # Check CNPJ isn't already registered
            await cur.execute(
                "SELECT entrepreneurs_id FROM entrepreneurs WHERE doc_cnpj = %s;",
                (data.doc_cnpj,)
            )
            if await cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Este CNPJ já está cadastrado. / This CNPJ is already registered."
                )

            # Create entrepreneur record
            await cur.execute(
                """
                INSERT INTO entrepreneurs (doc_cnpj, phone, status)
                VALUES (%s, %s, %s)
                RETURNING *;
                """,
                (data.doc_cnpj, data.phone, True)
            )
            entrepreneur = await cur.fetchone()

            # Link back to client
            await cur.execute(
                """
                UPDATE clients
                SET entrepreneur_id = %s
                WHERE clients_id = %s
                RETURNING *;
                """,
                (entrepreneur["entrepreneurs_id"], current_user["clients_id"])
            )
            updated_client = await cur.fetchone()

            return {
                "message": "Negócio cadastrado com sucesso! / Business registered successfully.",
                "entrepreneur_id": entrepreneur["entrepreneurs_id"],
                "client_id": updated_client["clients_id"],
                "doc_cnpj": entrepreneur["doc_cnpj"],
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Login ──────────────────────────────────────────────────────────────────────
@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """
    Logs in a client and returns a JWT token.
    Use email as the username field in Swagger.
    """
    try:
        if len(form_data.password.encode("utf-8")) > 72:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be 72 characters or fewer."
            )

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM clients WHERE email = %s;",
                (form_data.username,)
            )
            client = await cur.fetchone()

            # Same error for wrong email or wrong password
            # prevents email enumeration attacks
            if not client or not verify_password(form_data.password, client["password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="E-mail ou senha incorretos. / Incorrect email or password.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            access_token = create_access_token(data={"sub": client["email"]})
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "client_id": client["clients_id"],
                "first_name": client["first_name"],
                "is_entrepreneur": client["entrepreneur_id"] is not None,
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))