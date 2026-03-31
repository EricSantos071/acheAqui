from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from psycopg.rows import dict_row
import psycopg

from database import get_db
from auth import hash_password, verify_password, create_access_token
from models.registers import ClientCreate, ClientResponse

router = APIRouter()


# ── Register ───────────────────────────────────────────────────────────────────
@router.post("/register", response_model=ClientResponse, status_code=201)
async def register(
    client: ClientCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """
    Registers a new client.
    - Checks if email already exists (no duplicates)
    - Hashes the password before saving — plain text never touches the DB
    - Returns the new client (without password)
    """
    try:
        async with conn.cursor(row_factory=dict_row) as cur:

            # 1. Check if email is already registered
            await cur.execute(
                "SELECT clients_id FROM clients WHERE email = %s;",
                (client.email,)
            )
            existing = await cur.fetchone()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A client with this email already exists."
                )

            # 2. Hash the password — NEVER store plain text
            hashed = hash_password(client.password)

            # 3. Insert the new client
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
                    hashed,           # ← hashed password goes here
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


# ── Login ──────────────────────────────────────────────────────────────────────
@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    #utf-8 because v stores only single bytes Pydantic models
    if len(form_data.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be 72 characters or fewer."
        )
    """
    Logs in a client and returns a JWT access token.

    OAuth2PasswordRequestForm expects two fields:
      - username (we treat this as email)
      - password

    The /docs UI will show a proper login form automatically
    thanks to the OAuth2 scheme defined in auth.py.

    Returns:
      { "access_token": "...", "token_type": "bearer" }

    The frontend stores this token and sends it as:
      Authorization: Bearer <token>
    on every protected request.
    """
    try:
        async with conn.cursor(row_factory=dict_row) as cur:

            # 1. Find the client by email
            # OAuth2PasswordRequestForm uses "username" field — we treat it as email
            await cur.execute(
                "SELECT * FROM clients WHERE email = %s;",
                (form_data.username,)
            )
            client = await cur.fetchone()

            # 2. Verify the password — same error for both cases intentionally
            # Never tell the user whether the email or password was wrong
            # (prevents email enumeration attacks)
            if not client or not verify_password(form_data.password, client["password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # 3. Create and return the JWT token
            # "sub" (subject) is JWT standard — we store the email inside the token
            access_token = create_access_token(data={"sub": client["email"]})
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "client_id": client["clients_id"],      # useful for the frontend
                "first_name": client["first_name"],     # useful for greeting the user
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))