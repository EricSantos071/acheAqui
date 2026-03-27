from fastapi import APIRouter, Depends, HTTPException
from psycopg.rows import dict_row
import psycopg

from database import get_db
from models.inventory import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    ProductImageCreate, ProductImageUpdate, ProductImageResponse,
)

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# CATEGORY
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/category", response_model=list[CategoryResponse])
async def get_categories(conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all categories."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM category;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/category", response_model=CategoryResponse, status_code=201)
async def create_category(
    category: CategoryCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """
    Creates a new category.
    status_code=201 means 'Created' — more precise than the default 200 'OK'.
    RETURNING * gives us the new row back without a second query.
    """
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO category (category_name)
                VALUES (%s)
                RETURNING *;
                """,
                (category.category_name,)
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/category/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """
    Updates a category by ID.
    We only update fields that were actually sent (not None).
    This is what makes CategoryUpdate's Optional fields useful.
    """
    try:
        # Build the SET clause dynamically from only the fields that were sent
        # e.g. if only category_name was sent: SET category_name = %s
        fields = {k: v for k, v in category.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [category_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE category SET {set_clause} WHERE category_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Category not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/category/{category_id}", status_code=200)
async def delete_category(
    category_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """
    Deletes a category by ID.
    Returns a confirmation message instead of the deleted row.
    """
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM category WHERE category_id = %s RETURNING category_id;",
                (category_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Category not found.")
            return {"message": f"Category {category_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# PRODUCTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/products", response_model=list[ProductResponse])
async def get_products(conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all products."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM products;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """Returns a single product by ID."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM products WHERE product_id = %s;", (product_id,))
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
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """Creates a new product."""
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
                    product.product_name,
                    product.barcode,
                    product.description,
                    product.price,
                    product.in_stock,
                    product.status,
                    product.entrepreneur_id,
                    product.category_id,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product: ProductUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """Updates a product by ID. Only sends the fields you want to change."""
    try:
        fields = {k: v for k, v in product.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [product_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE products SET {set_clause} WHERE product_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Product not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/products/{product_id}", status_code=200)
async def delete_product(
    product_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """Deletes a product by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM products WHERE product_id = %s RETURNING product_id;",
                (product_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Product not found.")
            return {"message": f"Product {product_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# PRODUCT IMAGES
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/product_images", response_model=list[ProductImageResponse])
async def get_product_images(conn: psycopg.AsyncConnection = Depends(get_db("inventory"))):
    """Returns all product images."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM product_images;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/product_images/{product_id}", response_model=list[ProductImageResponse])
async def get_images_by_product(
    product_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """Returns all images for a specific product."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM product_images WHERE product_id = %s;",
                (product_id,)
            )
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/product_images", response_model=ProductImageResponse, status_code=201)
async def create_product_image(
    image: ProductImageCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """Adds a new image URL for a product."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO product_images (image_url, product_id)
                VALUES (%s, %s)
                RETURNING *;
                """,
                (image.image_url, image.product_id)
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/product_images/{product_img_id}", response_model=ProductImageResponse)
async def update_product_image(
    product_img_id: int,
    image: ProductImageUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """Updates a product image by its own ID."""
    try:
        fields = {k: v for k, v in image.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [product_img_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE product_images SET {set_clause} WHERE product_img_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Image not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/product_images/{product_img_id}", status_code=200)
async def delete_product_image(
    product_img_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("inventory"))
):
    """Deletes a product image by its own ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM product_images WHERE product_img_id = %s RETURNING product_img_id;",
                (product_img_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Image not found.")
            return {"message": f"Image {product_img_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))