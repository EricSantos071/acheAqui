from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
 
 
# ══════════════════════════════════════════════════════════════════════════════
# CATEGORY
# ══════════════════════════════════════════════════════════════════════════════
 
class CategoryBase(BaseModel):
    category_name: str
 
 
class CategoryCreate(CategoryBase):
    """Used for POST /inventory/category"""
    pass
 
 
class CategoryResponse(CategoryBase):
    """Used for GET responses."""
    category_id: int
 
    class Config:
        from_attributes = True
 
 
# ══════════════════════════════════════════════════════════════════════════════
# PRODUCTS
# ══════════════════════════════════════════════════════════════════════════════
 
class ProductBase(BaseModel):
    product_name: str
    barcode: str
    description: str
    price: Decimal         # Decimal is safer than float for currency values
    in_stock: int
    status: bool = True    # True = available, False = unavailable
 
 
class ProductCreate(ProductBase):
    """Used for POST /inventory/products"""
    pass
 
 
class ProductUpdate(BaseModel):
    """
    Used for PUT /inventory/products/{id}
    All fields are Optional here — so you can update just the price
    without having to resend every other field.
    This pattern is called a 'partial update'.
    """
    product_name: Optional[str] = None
    barcode: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    in_stock: Optional[int] = None
    status: Optional[bool] = None
 
 
class ProductResponse(ProductBase):
    """Used for GET responses."""
    product_id: int
 
    class Config:
        from_attributes = True
 
 
# ══════════════════════════════════════════════════════════════════════════════
# PRODUCT IMAGES
# ══════════════════════════════════════════════════════════════════════════════
 
class ProductImageBase(BaseModel):
    image_url: str
 
 
class ProductImageCreate(ProductImageBase):
    """Used for POST /inventory/product_images"""
    pass
 
 
class ProductImageResponse(ProductImageBase):
    """Used for GET responses."""
    product_img_id: int
 
    class Config:
        from_attributes = True
 