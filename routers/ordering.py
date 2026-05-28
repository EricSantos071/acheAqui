from fastapi import APIRouter, Depends, HTTPException, Query
from psycopg.rows import dict_row
from typing import Optional
import psycopg

from database import get_db
from auth import get_current_user
from models.ordering import (
    CartCreate, CartUpdate, CartResponse,
    OrderCreate, OrderUpdate, OrderResponse,
    PaymentCreate, PaymentUpdate, PaymentResponse,
    PromoCreate, PromoUpdate, PromoResponse,
    TransactionCreate, TransactionUpdate, TransactionResponse,
    DeliveryCreate, DeliveryUpdate, DeliveryResponse,
)

router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# CART
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/cart", response_model=list[CartResponse])
async def get_cart(
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Returns the logged-in client's cart with pagination."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM cart WHERE client_id = %s ORDER BY cart_id LIMIT %s OFFSET %s;",
                (current_user["clients_id"], limit, (page - 1) * limit)
            )
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cart", response_model=CartResponse, status_code=201)
async def create_cart_item(
    cart: CartCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO cart (quantity, total_value, product_id, client_id)
                VALUES (%s, %s, %s, %s) RETURNING *;
                """,
                (cart.quantity, cart.total_value, cart.product_id, current_user["clients_id"])
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/cart/{cart_id}", response_model=CartResponse)
async def update_cart_item(
    cart_id: int,
    cart: CartUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT client_id FROM cart WHERE cart_id = %s;", (cart_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Cart entry not found.")
            if row["client_id"] != current_user["clients_id"]:
                raise HTTPException(status_code=403, detail="Not your cart entry.")

            fields = {k: v for k, v in cart.model_dump().items() if v is not None}
            if not fields:
                raise HTTPException(status_code=400, detail="No fields provided to update.")
            set_clause = ", ".join(f"{k} = %s" for k in fields)
            values = list(fields.values()) + [cart_id]
            await cur.execute(
                f"UPDATE cart SET {set_clause} WHERE cart_id = %s RETURNING *;", values
            )
            return await cur.fetchone()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cart/{cart_id}")
async def delete_cart_item(
    cart_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT client_id FROM cart WHERE cart_id = %s;", (cart_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Cart entry not found.")
            if row["client_id"] != current_user["clients_id"]:
                raise HTTPException(status_code=403, detail="Not your cart entry.")
            await cur.execute("DELETE FROM cart WHERE cart_id = %s;", (cart_id,))
            return {"message": f"Cart entry {cart_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# ORDERS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/orders")
async def get_orders(
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[bool] = Query(None, description="Filter by status: true=completed, false=pending"),
):
    """
    Returns logged-in client's orders.
    Filter by status: true = completed, false = pending.
    Example: /ordering/orders?status=false
    """
    try:
        filters = ["client_id = %s"]
        values = [current_user["clients_id"]]

        if status is not None:
            filters.append("status = %s")
            values.append(status)

        where = "WHERE " + " AND ".join(filters)
        count_values = values.copy()
        values += [limit, (page - 1) * limit]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"SELECT * FROM orders {where} ORDER BY orders_id DESC LIMIT %s OFFSET %s;",
                values
            )
            rows = await cur.fetchall()
            await cur.execute(f"SELECT COUNT(*) FROM orders {where};", count_values)
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


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM orders WHERE orders_id = %s AND client_id = %s;",
                (order_id, current_user["clients_id"])
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Order not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orders", response_model=OrderResponse, status_code=201)
async def create_order(
    order: OrderCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            # 1. Create the order as before
            await cur.execute(
                "INSERT INTO orders (order_total, status, client_id) VALUES (%s, %s, %s) RETURNING *;",
                (order.order_total, order.status, current_user["clients_id"])
            )
            new_order = await cur.fetchone()

            # 2. Fetch client's cart items
            await cur.execute(
                "SELECT product_id, quantity FROM ordering_system.cart WHERE client_id = %s;",
                (current_user["clients_id"],)
            )
            cart_items = await cur.fetchall()

            # 3. Decrement stock for each product
            for item in cart_items:
                await cur.execute(
                    """
                    UPDATE inventory.products
                    SET in_stock = GREATEST(in_stock - %s, 0),
                        status = CASE WHEN in_stock - %s <= 0 THEN false ELSE status END
                    WHERE product_id = %s;
                    """,
                    (item["quantity"], item["quantity"], item["product_id"])
                )

            return new_order

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order: OrderUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT client_id FROM orders WHERE orders_id = %s;", (order_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Order not found.")
            if row["client_id"] != current_user["clients_id"]:
                raise HTTPException(status_code=403, detail="Not your order.")
            fields = {k: v for k, v in order.model_dump().items() if v is not None}
            if not fields:
                raise HTTPException(status_code=400, detail="No fields provided to update.")
            set_clause = ", ".join(f"{k} = %s" for k in fields)
            values = list(fields.values()) + [order_id]
            await cur.execute(
                f"UPDATE orders SET {set_clause} WHERE orders_id = %s RETURNING *;", values
            )
            return await cur.fetchone()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/orders/{order_id}")
async def delete_order(
    order_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT client_id FROM orders WHERE orders_id = %s;", (order_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Order not found.")
            if row["client_id"] != current_user["clients_id"]:
                raise HTTPException(status_code=403, detail="Not your order.")
            await cur.execute("DELETE FROM orders WHERE orders_id = %s;", (order_id,))
            return {"message": f"Order {order_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# PAYMENTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/payments")
async def get_payments(
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[bool] = Query(None, description="true=confirmed, false=pending"),
    payment_method: Optional[str] = Query(None, description="Filter by method: pix, credit_card, boleto"),
):
    """
    Returns logged-in client's payments with optional filters.
    Example: /ordering/payments?status=false&payment_method=pix
    """
    try:
        filters = ["client_id = %s"]
        values = [current_user["clients_id"]]

        if status is not None:
            filters.append("status = %s")
            values.append(status)

        if payment_method:
            filters.append("payment_method ILIKE %s")
            values.append(f"%{payment_method}%")

        where = "WHERE " + " AND ".join(filters)
        count_values = values.copy()
        values += [limit, (page - 1) * limit]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"SELECT * FROM payments {where} ORDER BY payments_id DESC LIMIT %s OFFSET %s;",
                values
            )
            rows = await cur.fetchall()
            await cur.execute(f"SELECT COUNT(*) FROM payments {where};", count_values)
            total = (await cur.fetchone())["count"]

        return {"data": rows, "page": page, "limit": limit, "total": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/payments", response_model=PaymentResponse, status_code=201)
async def create_payment(
    payment: PaymentCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO payments
                    (payment_method, payment_date, status, client_id, order_id)
                VALUES (%s, %s, %s, %s, %s) RETURNING *;
                """,
                (
                    payment.payment_method, payment.payment_date,
                    payment.status, current_user["clients_id"], payment.order_id,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/payments/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    payment: PaymentUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT client_id FROM payments WHERE payments_id = %s;", (payment_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Payment not found.")
            if row["client_id"] != current_user["clients_id"]:
                raise HTTPException(status_code=403, detail="Not your payment.")
            fields = {k: v for k, v in payment.model_dump().items() if v is not None}
            if not fields:
                raise HTTPException(status_code=400, detail="No fields provided to update.")
            set_clause = ", ".join(f"{k} = %s" for k in fields)
            values = list(fields.values()) + [payment_id]
            await cur.execute(
                f"UPDATE payments SET {set_clause} WHERE payments_id = %s RETURNING *;", values
            )
            return await cur.fetchone()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# PROMOS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/promos")
async def get_promos(
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[bool] = Query(None, description="true=active, false=inactive"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    product_id: Optional[int] = Query(None, description="Filter by product"),
):
    """
    Public endpoint — returns promos with optional filters.
    Example: /ordering/promos?status=true&category_id=1
    """
    try:
        filters, values = [], []

        if status is not None:
            filters.append("status = %s")
            values.append(status)

        if category_id is not None:
            filters.append("category_id = %s")
            values.append(category_id)

        if product_id is not None:
            filters.append("product_id = %s")
            values.append(product_id)

        where = "WHERE " + " AND ".join(filters) if filters else ""
        count_values = values.copy()
        values += [limit, (page - 1) * limit]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"SELECT * FROM promos {where} ORDER BY promos_id DESC LIMIT %s OFFSET %s;",
                values
            )
            rows = await cur.fetchall()
            await cur.execute(f"SELECT COUNT(*) FROM promos {where};", count_values)
            total = (await cur.fetchone())["count"]

        return {"data": rows, "page": page, "limit": limit, "total": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/promos", response_model=PromoResponse, status_code=201)
async def create_promo(
    promo: PromoCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO promos
                    (promo_name, description, promo_value, start_date,
                     end_date, status, entrepreneur_id, product_id, category_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *;
                """,
                (
                    promo.promo_name, promo.description, promo.promo_value,
                    promo.start_date, promo.end_date, promo.status,
                    promo.entrepreneur_id, promo.product_id, promo.category_id,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/promos/{promo_id}", response_model=PromoResponse)
async def update_promo(
    promo_id: int,
    promo: PromoUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        fields = {k: v for k, v in promo.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")
        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [promo_id]
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE promos SET {set_clause} WHERE promos_id = %s RETURNING *;", values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Promo not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/promos/{promo_id}")
async def delete_promo(
    promo_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM promos WHERE promos_id = %s RETURNING promos_id;", (promo_id,)
            )
            if await cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="Promo not found.")
            return {"message": f"Promo {promo_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# DELIVERY
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/delivery", response_model=list[DeliveryResponse])
async def get_delivery(
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT * FROM delivery WHERE client_id = %s ORDER BY delivery_id DESC LIMIT %s OFFSET %s;",
                (current_user["clients_id"], limit, (page - 1) * limit)
            )
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/delivery", response_model=DeliveryResponse, status_code=201)
async def create_delivery(
    delivery: DeliveryCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "INSERT INTO delivery (client_id, order_id, cart_id) VALUES (%s, %s, %s) RETURNING *;",
                (current_user["clients_id"], delivery.order_id, delivery.cart_id)
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# TRANSACTIONS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/transactions", response_model=list[TransactionResponse])
async def get_transactions(
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    transaction_type: Optional[str] = Query(None, description="Filter by type: sale, refund, chargeback"),
):
    """
    Returns transactions with optional type filter.
    Example: /ordering/transactions?transaction_type=refund
    """
    try:
        filters, values = [], []

        if transaction_type:
            filters.append("transaction_type ILIKE %s")
            values.append(f"%{transaction_type}%")

        where = "WHERE " + " AND ".join(filters) if filters else ""
        values += [limit, (page - 1) * limit]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"SELECT * FROM transactions {where} ORDER BY transactions_id DESC LIMIT %s OFFSET %s;",
                values
            )
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transactions", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    transaction: TransactionCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system")),
    current_user: dict = Depends(get_current_user)
):
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "INSERT INTO transactions (transaction_type, payment_id) VALUES (%s, %s) RETURNING *;",
                (transaction.transaction_type, transaction.payment_id)
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))