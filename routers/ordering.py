from fastapi import APIRouter, Depends, HTTPException
from psycopg.rows import dict_row
import psycopg

from database import get_db
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
async def get_cart(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all cart entries."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM cart;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cart/{cart_id}", response_model=CartResponse)
async def get_cart_item(
    cart_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Returns a single cart entry by ID."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM cart WHERE cart_id = %s;", (cart_id,))
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Cart entry not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cart", response_model=CartResponse, status_code=201)
async def create_cart_item(
    cart: CartCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Adds a product to the cart for a client."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO cart (quantity, total_value, product_id, client_id)
                VALUES (%s, %s, %s, %s)
                RETURNING *;
                """,
                (cart.quantity, cart.total_value, cart.product_id, cart.client_id)
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/cart/{cart_id}", response_model=CartResponse)
async def update_cart_item(
    cart_id: int,
    cart: CartUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Updates a cart entry by ID."""
    try:
        fields = {k: v for k, v in cart.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [cart_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE cart SET {set_clause} WHERE cart_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Cart entry not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cart/{cart_id}", status_code=200)
async def delete_cart_item(
    cart_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Removes an item from the cart."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM cart WHERE cart_id = %s RETURNING cart_id;",
                (cart_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Cart entry not found.")
            return {"message": f"Cart entry {cart_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# ORDERS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/orders", response_model=list[OrderResponse])
async def get_orders(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all orders."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM orders;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Returns a single order by ID."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM orders WHERE orders_id = %s;", (order_id,))
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
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Creates a new order for a client."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO orders (order_total, status, client_id)
                VALUES (%s, %s, %s)
                RETURNING *;
                """,
                (order.order_total, order.status, order.client_id)
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order: OrderUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Updates an order by ID."""
    try:
        fields = {k: v for k, v in order.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [order_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE orders SET {set_clause} WHERE orders_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Order not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/orders/{order_id}", status_code=200)
async def delete_order(
    order_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Deletes an order by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM orders WHERE orders_id = %s RETURNING orders_id;",
                (order_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Order not found.")
            return {"message": f"Order {order_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# PAYMENTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/payments", response_model=list[PaymentResponse])
async def get_payments(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all payments."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM payments;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/payments", response_model=PaymentResponse, status_code=201)
async def create_payment(
    payment: PaymentCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Creates a new payment record."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO payments
                    (payment_method, payment_date, status, client_id, order_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    payment.payment_method,
                    payment.payment_date,
                    payment.status,
                    payment.client_id,
                    payment.order_id,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/payments/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    payment: PaymentUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Updates a payment by ID."""
    try:
        fields = {k: v for k, v in payment.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [payment_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE payments SET {set_clause} WHERE payments_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Payment not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/payments/{payment_id}", status_code=200)
async def delete_payment(
    payment_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Deletes a payment by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM payments WHERE payments_id = %s RETURNING payments_id;",
                (payment_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Payment not found.")
            return {"message": f"Payment {payment_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# PROMOS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/promos", response_model=list[PromoResponse])
async def get_promos(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all promos."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM promos;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/promos", response_model=PromoResponse, status_code=201)
async def create_promo(
    promo: PromoCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Creates a new promo."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO promos
                    (promo_name, description, promo_value, start_date,
                     end_date, status, entrepreneur_id, product_id, category_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    promo.promo_name,
                    promo.description,
                    promo.promo_value,
                    promo.start_date,
                    promo.end_date,
                    promo.status,
                    promo.entrepreneur_id,
                    promo.product_id,
                    promo.category_id,
                )
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/promos/{promo_id}", response_model=PromoResponse)
async def update_promo(
    promo_id: int,
    promo: PromoUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Updates a promo by ID."""
    try:
        fields = {k: v for k, v in promo.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [promo_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE promos SET {set_clause} WHERE promos_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Promo not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/promos/{promo_id}", status_code=200)
async def delete_promo(
    promo_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Deletes a promo by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM promos WHERE promos_id = %s RETURNING promos_id;",
                (promo_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Promo not found.")
            return {"message": f"Promo {promo_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# TRANSACTIONS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/transactions", response_model=list[TransactionResponse])
async def get_transactions(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all transactions."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM transactions;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transactions", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    transaction: TransactionCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Creates a new transaction linked to a payment."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO transactions (transaction_type, payment_id)
                VALUES (%s, %s)
                RETURNING *;
                """,
                (transaction.transaction_type, transaction.payment_id)
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Updates a transaction by ID."""
    try:
        fields = {k: v for k, v in transaction.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [transaction_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE transactions SET {set_clause} WHERE transactions_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Transaction not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/transactions/{transaction_id}", status_code=200)
async def delete_transaction(
    transaction_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Deletes a transaction by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM transactions WHERE transactions_id = %s RETURNING transactions_id;",
                (transaction_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Transaction not found.")
            return {"message": f"Transaction {transaction_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# DELIVERY
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/delivery", response_model=list[DeliveryResponse])
async def get_delivery(conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))):
    """Returns all delivery records."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT * FROM delivery;")
            return await cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/delivery", response_model=DeliveryResponse, status_code=201)
async def create_delivery(
    delivery: DeliveryCreate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Creates a new delivery record."""
    try:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO delivery (client_id, order_id, cart_id)
                VALUES (%s, %s, %s)
                RETURNING *;
                """,
                (delivery.client_id, delivery.order_id, delivery.cart_id)
            )
            return await cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/delivery/{delivery_id}", response_model=DeliveryResponse)
async def update_delivery(
    delivery_id: int,
    delivery: DeliveryUpdate,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Updates a delivery record by ID."""
    try:
        fields = {k: v for k, v in delivery.model_dump().items() if v is not None}
        if not fields:
            raise HTTPException(status_code=400, detail="No fields provided to update.")

        set_clause = ", ".join(f"{k} = %s" for k in fields)
        values = list(fields.values()) + [delivery_id]

        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                f"UPDATE delivery SET {set_clause} WHERE delivery_id = %s RETURNING *;",
                values
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Delivery not found.")
            return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delivery/{delivery_id}", status_code=200)
async def delete_delivery(
    delivery_id: int,
    conn: psycopg.AsyncConnection = Depends(get_db("ordering_system"))
):
    """Deletes a delivery record by ID."""
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "DELETE FROM delivery WHERE delivery_id = %s RETURNING delivery_id;",
                (delivery_id,)
            )
            row = await cur.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Delivery not found.")
            return {"message": f"Delivery {delivery_id} deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))