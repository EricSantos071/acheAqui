from pydantic import BaseModel, Field
from datetime import date
from typing import Optional
 
 
# ══════════════════════════════════════════════════════════════════════════════
# REVIEWS
# ══════════════════════════════════════════════════════════════════════════════
 
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)  # ge=1 means >= 1, le=5 means <= 5
    comment: str                           # Pydantic enforces 1-5 automatically
    review_date: date
 
 
class ReviewCreate(ReviewBase):
    """Used for POST /analytics/reviews"""
    pass
 
 
class ReviewUpdate(BaseModel):
    """Used for PUT /analytics/reviews/{id} — partial update"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None
    review_date: Optional[date] = None
 
 
class ReviewResponse(ReviewBase):
    """Used for GET responses."""
    reviews_id: int
 
    class Config:
        from_attributes = True
 