import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from psycopg.rows import dict_row
import psycopg

from database import get_db

# ── Environment ────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable not set.")

# ── Password hashing ───────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain_password: str) -> str:
    """Converts plain text to bcrypt hash."""
    if len(plain_password.encode("utf-8")) > 72:
        raise ValueError("Password must be 72 characters or fewer.")
    return pwd_context.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks plain text against stored hash."""
    if len(plain_password.encode("utf-8")) > 72:
        return False
    return pwd_context.verify(plain_password, hashed_password)

# ── JWT Token ──────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ── OAuth2 scheme ──────────────────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ── Dependency: get_current_user ───────────────────────────────────────────────
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """
    Base dependency — decodes JWT and returns the full client row.
    Use this on any endpoint that just needs a logged-in user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    async with conn.cursor(row_factory=dict_row) as cur:
        await cur.execute(
            "SELECT * FROM clients WHERE email = %s;",
            (email,)
        )
        user = await cur.fetchone()

    if user is None:
        raise credentials_exception

    return user


# ── Dependency: get_current_entrepreneur ───────────────────────────────────────
async def get_current_entrepreneur(
    current_user: dict = Depends(get_current_user)
):
    """
    Extends get_current_user — also checks the client has an entrepreneur_id.
    Use this on any endpoint that only entrepreneurs can access.

    Usage:
        @router.post("/products")
        async def create_product(
            product: ProductCreate,
            conn = Depends(get_db("inventory")),
            current_user = Depends(get_current_entrepreneur)  ← blocks non-entrepreneurs
        ):
    """
    if current_user["entrepreneur_id"] is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered entrepreneurs can perform this action."
        )
    return current_user