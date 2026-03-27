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
    product_id: int             # FK → inventory.products
    client_id: int              # FK → registers.clients


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

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# ORDERS
# ══════════════════════════════════════════════════════════════════════════════

class OrderBase(BaseModel):
    order_total: int
    status: bool = False        # False = pending, True = completed
    client_id: int              # FK → registers.clients


class OrderCreate(OrderBase):
    """Used for POST /ordering/orders"""
    pass


class OrderUpdate(BaseModel):
    """Used for PUT /ordering/orders/{id}"""
    order_total: Optional[int] = None
    status: Optional[bool] = None
    client_id: Optional[int] = None


class OrderResponse(OrderBase):
    orders_id: int

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# PAYMENTS
# ══════════════════════════════════════════════════════════════════════════════

class PaymentBase(BaseModel):
    payment_method: str         # e.g. "pix", "credit_card", "boleto"
    payment_date: datetime
    status: bool = False        # False = pending, True = confirmed
    client_id: int              # FK → registers.clients
    order_id: int               # FK → ordering_system.orders


class PaymentCreate(PaymentBase):
    """Used for POST /ordering/payments"""
    pass


class PaymentUpdate(BaseModel):
    """Used for PUT /ordering/payments/{id}"""
    payment_method: Optional[str] = None
    payment_date: Optional[datetime] = None
    status: Optional[bool] = None
    client_id: Optional[int] = None
    order_id: Optional[int] = None


class PaymentResponse(PaymentBase):
    payments_id: int

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# PROMOS
# ══════════════════════════════════════════════════════════════════════════════

class PromoBase(BaseModel):
    promo_name: str
    description: str
    promo_value: Decimal        # e.g. 15.00 for R$15 off
    start_date: datetime
    end_date: datetime
    status: bool = True         # True = active
    entrepreneur_id: int        # FK → registers.entrepreneurs
    product_id: int             # FK → inventory.products
    category_id: int            # FK → inventory.category


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
    transaction_type: str       # e.g. "sale", "refund", "chargeback"
    payment_id: int             # FK → ordering_system.payments


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
    client_id: int              # FK → registers.clients
    order_id: int               # FK → ordering_system.orders
    cart_id: int                # FK → ordering_system.cart


class DeliveryCreate(DeliveryBase):
    """Used for POST /ordering/delivery"""
    pass


class DeliveryUpdate(BaseModel):
    """Used for PUT /ordering/delivery/{id}"""
    client_id: Optional[int] = None
    order_id: Optional[int] = None
    cart_id: Optional[int] = None


class DeliveryResponse(DeliveryBase):
    delivery_id: int

    class Config:
        from_attributes = True