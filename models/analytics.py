from pydantic import BaseModel, Field
from datetime import date
from typing import Optional


# ══════════════════════════════════════════════════════════════════════════════
# REVIEWS
# ══════════════════════════════════════════════════════════════════════════════

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)  # ge=1 means >=1, le=5 means <=5
    comment: str
    review_date: date
    product_id: int             # FK → inventory.products
    #client_id: int              # FK → registers.clients


class ReviewCreate(ReviewBase):
    """Used for POST /analytics/reviews"""
    rating: int = Field(..., ge=1, le=5)
    comment: str
    review_date: date
    product_id: int


class ReviewUpdate(BaseModel):
    """Used for PUT /analytics/reviews/{id} — all fields optional"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None
    review_date: Optional[date] = None
    product_id: Optional[int] = None
    client_id: Optional[int] = None


class ReviewResponse(ReviewBase):
    """Used for GET responses."""
    reviews_id: int

    class Config:
        from_attributes = True