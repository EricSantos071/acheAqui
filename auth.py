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

# ── Load environment variables ─────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable not set.")

# ── Password hashing ───────────────────────────────────────────────────────────
# CryptContext handles all the bcrypt complexity for us.
# "deprecated=auto" means older hashes get upgraded automatically.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain_password: str) -> str:
    """Converts a plain text password into a bcrypt hash."""
    return pwd_context.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if a plain text password matches a stored hash.
    Returns True if match, False if not.
    Never compares passwords directly — always use this function.
    """
    return pwd_context.verify(plain_password, hashed_password)

# ── JWT Token ──────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT token containing the user's data.
    The token expires after ACCESS_TOKEN_EXPIRE_MINUTES (default 480 = 8 hours).
    After expiry the user must log in again.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ── OAuth2 scheme ──────────────────────────────────────────────────────────────
# This tells FastAPI where to expect the token in requests.
# Clients send: Authorization: Bearer <token>
# The /docs UI will show a lock icon and an Authorize button automatically.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ── Get current user dependency ────────────────────────────────────────────────
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    conn: psycopg.AsyncConnection = Depends(get_db("registers"))
):
    """
    Dependency you attach to any protected endpoint.
    Decodes the JWT token, finds the user in the DB, and returns them.
    If the token is invalid or expired, raises 401 Unauthorized.

    Usage in any router:
        from auth import get_current_user
        @router.get("/protected")
        async def protected(current_user = Depends(get_current_user)):
            return {"hello": current_user["first_name"]}
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode and verify the token signature
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")  # "sub" is JWT standard for subject/user
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Fetch the user from the DB using the email stored in the token
    async with conn.cursor(row_factory=dict_row) as cur:
        await cur.execute(
            "SELECT * FROM clients WHERE email = %s;",
            (email,)
        )
        user = await cur.fetchone()

    if user is None:
        raise credentials_exception

    return user  # the full client row — available in any protected endpoint