from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from psycopg.rows import dict_row
from decimal import Decimal
from typing import Optional
import psycopg

from database import get_db
from auth import get_current_user, get_current_entrepreneur
from upload import upload_image, delete_image
from models.inventory import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    ProductImageCreate, ProductImageResponse,
)

router = APIRouter()

# ── Allowed image types ────────────────────────────────────────────────────────
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 5
MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024


# ══════════════════════════════════════════════════════════════════════════════
# CATEGORY
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/category", response_model=list[CategoryResponse])
async def get_categories(
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    search: Optional[str] = Query(None, description="Filter by category name"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    try:
        filters, values = [], []
        if search:
            filters.append("category_name ILIKE %s")
            values.append(f"%{search}%")
        where = "WHERE " + " AND ".join(filters) if filters else ""
        count_values = values.copy()
        values += [limit, (page - 1) * limit]
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"SELECT * FROM category {where} ORDER BY category_id LIMIT %s OFFSET %s;",
                values
            )
            rows = await cur.fetchall()
            await cur.execute(f"SELECT COUNT(*) FROM category {where};", count_values)
            total = (await cur.fetchone())["count"]
        return {"data": rows, "page": page, "limit": limit, "total": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/category", response_model=CategoryResponse, status_code=201)
async def create_category(
    category: CategoryCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    current_user: dict = Depends(get_current_entrepreneur)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "INSERT INTO category (category_name) VALUES (%s) RETURNING *;",
                (category.category_name,)
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/category/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    current_user: dict = Depends(get_current_entrepreneur)
):
    try:
        fields = {k: v for k, v in category.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [category_id]
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE category SET {set_clause} WHERE category_id = %s RETURNING *;", values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Category not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/category/{category_id}")
async def delete_category(
    category_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    current_user: dict = Depends(get_current_entrepreneur)
):
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM category WHERE category_id = %s RETURNING category_id;",
                (category_id,)
            )
            if await cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="Category not found.")
            return {"message": f"Category {category_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# PRODUCTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/products")
async def get_products(
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    status: Optional[bool] = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    entrepreneur_id: Optional[int] = Query(None),
):
    try:
        filters, values = [], []
        if search:
            filters.append("(product_name ILIKE %s OR description ILIKE %s)")
            values += [f"%{search}%", f"%{search}%"]
        if category_id is not None:
            filters.append("category_id = %s")
            values.append(category_id)
        if status is not None:
            filters.append("status = %s")
            values.append(status)
        if min_price is not None:
            filters.append("price >= %s")
            values.append(min_price)
        if max_price is not None:
            filters.append("price <= %s")
            values.append(max_price)
        if entrepreneur_id is not None:
            filters.append("entrepreneur_id = %s")
            values.append(entrepreneur_id)
        where = "WHERE " + " AND ".join(filters) if filters else ""
        count_values = values.copy()
        values += [limit, (page - 1) * limit]
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"SELECT * FROM products {where} ORDER BY product_id LIMIT %s OFFSET %s;",
                values
            )
            rows = await cur.fetchall()
            await cur.execute(f"SELECT COUNT(*) FROM products {where};", count_values)
            total = (await cur.fetchone())["count"]
        return {
            "data": rows,
            "page": page,
            "limit": limit,
            "total": total,
            "pages": -(-total // limit)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM products WHERE product_id = %s;", (product_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Product not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(
    product: ProductCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    current_user: dict = Depends(get_current_entrepreneur)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO products
                    (product_name, barcode, description, price,
                     in_stock, status, entrepreneur_id, category_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    product.product_name, product.barcode, product.description,
                    product.price, product.in_stock, product.status,
                    current_user["entrepreneur_id"], product.category_id,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product: ProductUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    current_user: dict = Depends(get_current_entrepreneur)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT entrepreneur_id FROM products WHERE product_id = %s;", (product_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Product not found.")
            if row["entrepreneur_id"] != current_user["entrepreneur_id"]:
                raise HTTPException(status_code=403, detail="You don't own this product.")
            fields = {k: v for k, v in product.model_dump().items() if v is not None}
            if not fields:
                raise HTTPException(status_code=400, detail="No fields provided to update.")
            set_clause = ", ".join(f"{k} = %s" for k in fields)
            values = list(fields.values()) + [product_id]
            await cur.execute(
                f"UPDATE products SET {set_clause} WHERE product_id = %s RETURNING *;", values
            )
            return await cur.fetchone()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    current_user: dict = Depends(get_current_entrepreneur)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT entrepreneur_id FROM products WHERE product_id = %s;", (product_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Product not found.")
            if row["entrepreneur_id"] != current_user["entrepreneur_id"]:
                raise HTTPException(status_code=403, detail="You don't own this product.")
            await cur.execute("DELETE FROM products WHERE product_id = %s;", (product_id,))
            return {"message": f"Product {product_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# PRODUCT IMAGES
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/product_images/{product_id}", response_model=list[ProductImageResponse])
async def get_images_by_product(
    product_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """Returns all images for a product."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM product_images WHERE product_id = %s;", (product_id,)
            )
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products/{product_id}/upload", response_model=ProductImageResponse, status_code=201)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(..., description="Image file — JPG, PNG or WebP, max 5MB"),
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    current_user: dict = Depends(get_current_entrepreneur)
):
    """
    Uploads an image for a product directly to Cloudinary.

    Flow:
      1. Validates file type and size
      2. Checks the entrepreneur owns this product
      3. Uploads to Cloudinary → gets back a URL
      4. Saves URL to product_images table
      5. Returns the new image record

    The frontend sends this as multipart/form-data with a 'file' field.
    In Swagger, click the endpoint → 'Try it out' → choose file.
    """
    # 1. Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: JPG, PNG, WebP."
        )

    # 2. Read and validate file size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_SIZE_MB}MB."
        )

    try:
        async with conn.cursor(row_factory=dict_row) as cur:

            # 3. Verify product exists and entrepreneur owns it
            await cur.execute(
                "SELECT entrepreneur_id FROM products WHERE product_id = %s;",
                (product_id,)
            )
            product = await cur.fetchone()
            if product is None:
                raise HTTPException(status_code=404, detail="Product not found.")
            if product["entrepreneur_id"] != current_user["entrepreneur_id"]:
                raise HTTPException(status_code=403, detail="You don't own this product.")

            # 4. Upload to Cloudinary
            image_url = await upload_image(file_bytes, product_id)

            # 5. Save URL to DB
            await cur.execute(
                "INSERT INTO product_images (image_url, product_id) VALUES (%s, %s) RETURNING *;",
                (image_url, product_id)
            )
            return await cur.fetchone()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/product_images/{product_img_id}")
async def delete_product_image(
    product_img_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory")),
    current_user: dict = Depends(get_current_entrepreneur)
):
    """
    Deletes an image from both the DB and Cloudinary.
    Only the entrepreneur who owns the product can delete its images.
    """
    try:
        async with conn.cursor(row_factory=dict_row) as cur:

            # Get the image and verify ownership via the product
            await cur.execute(
                """
                SELECT pi.*, p.entrepreneur_id
                FROM product_images pi
                JOIN products p ON pi.product_id = p.product_id
                WHERE pi.product_img_id = %s;
                """,
                (product_img_id,)
            )
            image = await cur.fetchone()
            if image is None:
                raise HTTPException(status_code=404, detail="Image not found.")
            if image["entrepreneur_id"] != current_user["entrepreneur_id"]:
                raise HTTPException(status_code=403, detail="You don't own this product.")

            # Delete from Cloudinary first
            await delete_image(image["image_url"])

            # Then delete from DB
            await cur.execute(
                "DELETE FROM product_images WHERE product_img_id = %s;",
                (product_img_id,)
            )
            return {"message": f"Image {product_img_id} deleted successfully."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))