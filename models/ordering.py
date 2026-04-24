from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


# ══════════════════════════════════════════════════════════════════════════════
# CART
# ══════════════════════════════════════════════════════════════════════════════

class CartBase(BaseModel):
    quantity: int
    total_value: Decimal
    product_id: int
    # NO client_id — router adds it from JWT token


class CartCreate(CartBase):
    """Used for POST /ordering/cart"""
    pass


class CartUpdate(BaseModel):
    """Used for PUT /ordering/cart/{id}"""
    quantity: Optional[int] = None
    total_value: Optional[Decimal] = None
    product_id: Optional[int] = None
    client_id: Optional[int] = None


class CartResponse(CartBase):
    cart_id: int
    client_id: int              # included in response but not in create

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# ORDERS
# ══════════════════════════════════════════════════════════════════════════════

class OrderCreate(BaseModel):
    """
    Used for POST /ordering/orders.
    client_id comes from JWT token in the router — not from request body.
    """
    order_total: int
    status: bool = False


class OrderUpdate(BaseModel):
    """Used for PUT /ordering/orders/{id}"""
    order_total: Optional[int] = None
    status: Optional[bool] = None


class OrderResponse(BaseModel):
    """Used for GET responses — includes all fields."""
    orders_id: int
    order_total: int
    status: bool
    client_id: int

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# PAYMENTS
# ══════════════════════════════════════════════════════════════════════════════

class PaymentCreate(BaseModel):
    """
    Used for POST /ordering/payments.
    client_id comes from JWT token in the router — not from request body.
    """
    payment_method: str
    payment_date: datetime
    status: bool = False
    order_id: int
    # NO client_id — router adds it from JWT token


class PaymentUpdate(BaseModel):
    """Used for PUT /ordering/payments/{id}"""
    payment_method: Optional[str] = None
    payment_date: Optional[datetime] = None
    status: Optional[bool] = None
    order_id: Optional[int] = None


class PaymentResponse(BaseModel):
    """Used for GET responses — includes all fields."""
    payments_id: int
    payment_method: str
    payment_date: datetime
    status: bool
    client_id: int
    order_id: int

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# PROMOS
# ══════════════════════════════════════════════════════════════════════════════

class PromoBase(BaseModel):
    promo_name: str
    description: str
    promo_value: Decimal
    start_date: datetime
    end_date: datetime
    status: bool = True
    entrepreneur_id: int
    product_id: int
    category_id: int


class PromoCreate(PromoBase):
    """Used for POST /ordering/promos"""
    pass


class PromoUpdate(BaseModel):
    """Used for PUT /ordering/promos/{id}"""
    promo_name: Optional[str] = None
    description: Optional[str] = None
    promo_value: Optional[Decimal] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[bool] = None
    entrepreneur_id: Optional[int] = None
    product_id: Optional[int] = None
    category_id: Optional[int] = None


class PromoResponse(PromoBase):
    promos_id: int

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# TRANSACTIONS
# ══════════════════════════════════════════════════════════════════════════════

class TransactionBase(BaseModel):
    transaction_type: str
    payment_id: int


class TransactionCreate(TransactionBase):
    """Used for POST /ordering/transactions"""
    pass


class TransactionUpdate(BaseModel):
    """Used for PUT /ordering/transactions/{id}"""
    transaction_type: Optional[str] = None
    payment_id: Optional[int] = None


class TransactionResponse(TransactionBase):
    transactions_id: int

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# DELIVERY
# ══════════════════════════════════════════════════════════════════════════════

class DeliveryBase(BaseModel):
    order_id: int
    cart_id: int
    # NO client_id — router adds it from JWT token


class DeliveryCreate(DeliveryBase):
    """Used for POST /ordering/delivery"""
    pass


class DeliveryUpdate(BaseModel):
    """Used for PUT /ordering/delivery/{id}"""
    order_id: Optional[int] = None
    cart_id: Optional[int] = None


class DeliveryResponse(BaseModel):
    """Used for GET responses — includes all fields."""
    delivery_id: int
    client_id: int
    order_id: int
    cart_id: int

    class Config:
        from_attributes = True