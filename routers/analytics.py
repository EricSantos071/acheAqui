from fastapi import APIRouter, Depends, HTTPException
from psycopg.rows import dict_row
import psycopg

from database import get_db
from auth import get_current_user
from models.analytics import ReviewCreate, ReviewUpdate, ReviewResponse

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# REVIEWS — public reads, login required to write
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/reviews", response_model=list[ReviewResponse])
async def get_reviews(conn: psycopg.AsyncConnection = Depends(get_db("analytics"))):
    """Public — anyone can read reviews."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM reviews;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reviews/product/{product_id}", response_model=list[ReviewResponse])
async def get_reviews_by_product(
    product_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics"))
):
    """Public — returns all reviews for a specific product."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM reviews WHERE product_id = %s;", (product_id,)
            )
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reviews/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics"))
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM reviews WHERE reviews_id = %s;", (review_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Review not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(
    review: ReviewCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics")),
    current_user: dict = Depends(get_current_user)
):
    """Must be logged in to leave a review. client_id is taken from token."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO reviews (rating, comment, review_date, product_id, client_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    review.rating,
                    review.comment,
                    review.review_date,
                    review.product_id,
                    current_user["clients_id"],  # always from token
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review: ReviewUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics")),
    current_user: dict = Depends(get_current_user)
):
    """Only the client who wrote the review can update it."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:

            # Ownership check
            await cur.execute(
                "SELECT client_id FROM reviews WHERE reviews_id = %s;", (review_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Review not found.")
            if row["client_id"] != current_user["clients_id"]:
                raise HTTPException(status_code=403, detail="You can only edit your own reviews.")

            fields = {k: v for k, v in review.model_dump().items() if v is not None}
            if not fields:
                raise HTTPException(status_code=400, detail="No fields provided to update.")
            set_clause = ", ".join(f"{k} = %s" for k in fields)
            values = list(fields.values()) + [review_id]

            await cur.execute(
                f"UPDATE reviews SET {set_clause} WHERE reviews_id = %s RETURNING *;", values
            )
            return await cur.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics")),
    current_user: dict = Depends(get_current_user)
):
    """Only the client who wrote the review can delete it."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:

            await cur.execute(
                "SELECT client_id FROM reviews WHERE reviews_id = %s;", (review_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Review not found.")
            if row["client_id"] != current_user["clients_id"]:
                raise HTTPException(status_code=403, detail="You can only delete your own reviews.")

            await cur.execute("DELETE FROM reviews WHERE reviews_id = %s;", (review_id,))
            return {"message": f"Review {review_id} deleted successfully."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))