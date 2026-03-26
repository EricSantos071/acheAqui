import os
from pathlib import Path
import psycopg
import psycopg_pool
from dotenv import load_dotenv
 
# Load .env from the same folder as this file
load_dotenv(dotenv_path=Path(__file__).parent / ".env")
 
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set.")
 
# The connection pool is created here but opened later in main.py's lifespan
pool = psycopg_pool.AsyncConnectionPool(
    DATABASE_URL,
    open=False,
    min_size=1,
    max_size=10,
)
 
# ── DB Dependency ──────────────────────────────────────────────────────────────
# Every router imports and uses this function.
# You call get_db("schema_name") to scope the connection to a specific schema.
def get_db(schema: str = "public"):
    async def _get_conn() -> psycopg.AsyncConnection:
        async with pool.connection() as conn:
            await conn.execute(f"SET search_path TO {schema}, public;")
            yield conn
    return _get_conn
