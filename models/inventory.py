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


class CategoryUpdate(BaseModel):
    """Used for PUT /inventory/category/{id}"""
    category_name: Optional[str] = None


class CategoryResponse(CategoryBase):
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
    price: Decimal              # Decimal is safer than float for currency
    in_stock: int
    status: bool = True         # True = available, False = unavailable
    entrepreneur_id: int        # FK → registers.entrepreneurs (required)
    category_id: Optional[int] = None  # FK → inventory.category (nullable in DB)


class ProductCreate(ProductBase):
    """Used for POST /inventory/products"""
    pass


class ProductUpdate(BaseModel):
    """
    Used for PUT /inventory/products/{id}
    All Optional — lets you update just one field without resending everything.
    """
    product_name: Optional[str] = None
    barcode: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    in_stock: Optional[int] = None
    status: Optional[bool] = None
    entrepreneur_id: Optional[int] = None
    category_id: Optional[int] = None


class ProductResponse(ProductBase):
    product_id: int

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# PRODUCT IMAGES
# ══════════════════════════════════════════════════════════════════════════════

class ProductImageBase(BaseModel):
    image_url: str
    product_id: int             # FK → inventory.products


class ProductImageCreate(ProductImageBase):
    """Used for POST /inventory/product_images"""
    pass


class ProductImageUpdate(BaseModel):
    """Used for PUT /inventory/product_images/{id}"""
    image_url: Optional[str] = None
    product_id: Optional[int] = None


class ProductImageResponse(ProductImageBase):
    product_img_id: int

    class Config:
        from_attributes = True