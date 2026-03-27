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
 
 
class CartCreate(CartBase):
    """Used for POST /ordering/cart"""
    pass
 
 
class CartUpdate(BaseModel):
    """Used for PUT /ordering/cart/{id} — partial update"""
    quantity: Optional[int] = None
    total_value: Optional[Decimal] = None
 
 
class CartResponse(CartBase):
    cart_id: int
 
    class Config:
        from_attributes = True
 
 
# ══════════════════════════════════════════════════════════════════════════════
# ORDERS
# ══════════════════════════════════════════════════════════════════════════════
 
class OrderBase(BaseModel):
    order_total: int
    status: bool = False   # False = pending, True = completed
 
 
class OrderCreate(OrderBase):
    """Used for POST /ordering/orders"""
    pass
 
 
class OrderUpdate(BaseModel):
    """Used for PUT /ordering/orders/{id} — partial update"""
    order_total: Optional[int] = None
    status: Optional[bool] = None
 
 
class OrderResponse(OrderBase):
    orders_id: int
 
    class Config:
        from_attributes = True
 
 
# ══════════════════════════════════════════════════════════════════════════════
# PAYMENTS
# ══════════════════════════════════════════════════════════════════════════════
 
class PaymentBase(BaseModel):
    payment_method: str    # e.g. "credit_card", "pix", "boleto"
    payment_date: datetime
    status: bool = False   # False = pending, True = confirmed
 
 
class PaymentCreate(PaymentBase):
    """Used for POST /ordering/payments"""
    pass
 
 
class PaymentUpdate(BaseModel):
    """Used for PUT /ordering/payments/{id} — partial update"""
    payment_method: Optional[str] = None
    payment_date: Optional[datetime] = None
    status: Optional[bool] = None
 
 
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
    promo_value: Decimal   # discount value, e.g. 15.00 for R$15 off
    start_date: datetime
    end_date: datetime
    status: bool = True    # True = active
 
 
class PromoCreate(PromoBase):
    """Used for POST /ordering/promos"""
    pass
 
 
class PromoUpdate(BaseModel):
    """Used for PUT /ordering/promos/{id} — partial update"""
    promo_name: Optional[str] = None
    description: Optional[str] = None
    promo_value: Optional[Decimal] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[bool] = None
 
 
class PromoResponse(PromoBase):
    promos_id: int
 
    class Config:
        from_attributes = True
 
 
# ══════════════════════════════════════════════════════════════════════════════
# TRANSACTIONS
# ══════════════════════════════════════════════════════════════════════════════
 
class TransactionBase(BaseModel):
    transaction_type: str  # e.g. "sale", "refund", "chargeback"
 
 
class TransactionCreate(TransactionBase):
    """Used for POST /ordering/transactions"""
    pass
 
 
class TransactionResponse(TransactionBase):
    transactions_id: int
 
    class Config:
        from_attributes = True
 
 
# ══════════════════════════════════════════════════════════════════════════════
# DELIVERY
# ══════════════════════════════════════════════════════════════════════════════
# delivery only has delivery_id right now — likely still being designed.
# We keep a minimal model and expand it when you add more columns.
 
class DeliveryBase(BaseModel):
    pass   # no user-facing fields yet beyond the auto-generated ID
 
 
class DeliveryCreate(DeliveryBase):
    """Used for POST /ordering/delivery"""
    pass
 
 
class DeliveryResponse(DeliveryBase):
    delivery_id: int
 
    class Config:
        from_attributes = True
 