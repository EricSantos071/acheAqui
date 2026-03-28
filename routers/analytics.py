from fastapi import APIRouter, Depends, HTTPException
from psycopg.rows import dict_row
import psycopg

from database import get_db
from models.analytics import ReviewCreate, ReviewUpdate, ReviewResponse

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# REVIEWS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/reviews", response_model=list[ReviewResponse])
async def get_reviews(conn: psycopg.AsyncConnection = Depends(get_db("analytics"))):
    """Returns all reviews."""
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
    """Returns all reviews for a specific product."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM reviews WHERE product_id = %s;",
                (product_id,)
            )
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reviews/client/{client_id}", response_model=list[ReviewResponse])
async def get_reviews_by_client(
    client_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics"))
):
    """Returns all reviews written by a specific client."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM reviews WHERE client_id = %s;",
                (client_id,)
            )
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(
    review: ReviewCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics"))
):
    """Creates a new review for a product by a client."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO reviews
                    (rating, comment, review_date, product_id, client_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    review.rating,
                    review.comment,
                    review.review_date,
                    review.product_id,
                    review.client_id,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review: ReviewUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics"))
):
    """Updates a review by ID."""
    try:
        fields = {k: v for k, v in review.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [review_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE reviews SET {set_clause} WHERE reviews_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Review not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/reviews/{review_id}", status_code=200)
async def delete_review(
    review_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics"))
):
    """Deletes a review by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM reviews WHERE reviews_id = %s RETURNING reviews_id;",
                (review_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Review not found.")
            return {"message": f"Review {review_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))