from fastapi import APIRouter, Depends, HTTPException, Query
from psycopg.rows import dict_row
from typing import Optional
import psycopg

from database import get_db
from auth import get_current_user
from models.analytics import ReviewCreate, ReviewUpdate, ReviewResponse

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# REVIEWS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/reviews")
async def get_reviews(
    conn: psycopg.AsyncConnection = Depends(get_db("analytics")),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    product_id: Optional[int] = Query(None, description="Filter by product"),
    min_rating: Optional[int] = Query(None, ge=1, le=5, description="Minimum rating"),
    max_rating: Optional[int] = Query(None, ge=1, le=5, description="Maximum rating"),
):
    """
    Public — returns reviews with optional filters.
    Examples:
      /analytics/reviews?product_id=1
      /analytics/reviews?min_rating=4
      /analytics/reviews?product_id=1&min_rating=3&max_rating=5
    """
    try:
        filters, values = [], []

        if product_id is not None:
            filters.append("product_id = %s")
            values.append(product_id)

        if min_rating is not None:
            filters.append("rating >= %s")
            values.append(min_rating)

        if max_rating is not None:
            filters.append("rating <= %s")
            values.append(max_rating)

        where = "WHERE " + " AND ".join(filters) if filters else ""
        count_values = values.copy()
        values += [limit, (page - 1) * limit]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"""
                SELECT * FROM reviews
                {where}
                ORDER BY reviews_id DESC
                LIMIT %s OFFSET %s;
                """,
                values
            )
            rows = await cur.fetchall()

            await cur.execute(
                f"SELECT COUNT(*), AVG(rating) as avg_rating FROM reviews {where};",
                count_values
            )
            stats = await cur.fetchone()

        return {
            "data": rows,
            "page": page,
            "limit": limit,
            "total": stats["count"],
            "pages": -(-stats["count"] // limit),
            "avg_rating": round(float(stats["avg_rating"]), 1) if stats["avg_rating"] else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reviews/product/{product_id}", response_model=list[ReviewResponse])
async def get_reviews_by_product(
    product_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("analytics"))
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM reviews WHERE product_id = %s ORDER BY reviews_id DESC;",
                (product_id,)
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
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO reviews (rating, comment, review_date, product_id, client_id)
                VALUES (%s, %s, %s, %s, %s) RETURNING *;
                """,
                (
                    review.rating, review.comment, review.review_date,
                    review.product_id, current_user["clients_id"],
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
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
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