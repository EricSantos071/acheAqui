from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional


# ══════════════════════════════════════════════════════════════════════════════
# ADDRESS
# ══════════════════════════════════════════════════════════════════════════════

class AddressBase(BaseModel):
    street: str
    house_num: str
    street_extra: Optional[str] = None
    neighborhood: str
    zip_code: str
    city: str
    state: str
    country: str


class AddressCreate(AddressBase):
    """Used for POST /registers/address"""
    pass


class AddressUpdate(BaseModel):
    """Used for PUT /registers/address/{id} — all fields optional"""
    street: Optional[str] = None
    house_num: Optional[str] = None
    street_extra: Optional[str] = None
    neighborhood: Optional[str] = None
    zip_code: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class AddressResponse(AddressBase):
    address_id: int

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# ENTREPRENEURS
# ══════════════════════════════════════════════════════════════════════════════

class EntrepreneurBase(BaseModel):
    doc_cnpj: str
    phone: str
    status: bool = True
    store_name: Optional[str] = None
    profile_picture: Optional[str] = None
    banner_image: Optional[str] = None
    banner_preset: Optional[int] = 1


class EntrepreneurCreate(EntrepreneurBase):
    """Used for POST /registers/entrepreneurs (admin only)"""
    pass


class EntrepreneurUpdate(BaseModel):
    """Used for PUT /registers/entrepreneurs/{id}"""
    doc_cnpj: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[bool] = None


class EntrepreneurResponse(EntrepreneurBase):
    entrepreneurs_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# CLIENTS
# ══════════════════════════════════════════════════════════════════════════════

class ClientBase(BaseModel):
    """
    Core client fields — used for registration and responses.

    address_id and entrepreneur_id are both optional here because:
    - New users register without an address (added when placing first order)
    - Most users are buyers, not entrepreneurs
    - This matches how real e-commerce apps work (Shopee, Mercado Livre, etc.)
    """
    first_name: str
    last_name: str
    doc_cpf: str
    email: str
    client_phone: str
    birthdate: date
    status: bool = True
    address_id: Optional[int] = None       # optional — added when placing first order
    entrepreneur_id: Optional[int] = None  # optional — added via /auth/register/entrepreneur


class ClientCreate(ClientBase):
    """
    Used for POST /auth/register and admin POST /registers/clients.
    Password is hashed before saving — never stored as plain text.
    """
    password: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v):
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 characters or fewer.")
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class ClientUpdate(BaseModel):
    """
    Used for PUT /registers/clients/me — all fields optional.
    Clients can update their own profile including adding an address later.
    """
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    doc_cpf: Optional[str] = None
    email: Optional[str] = None
    client_phone: Optional[str] = None
    birthdate: Optional[date] = None
    status: Optional[bool] = None
    address_id: Optional[int] = None       # client adds address when ready
    entrepreneur_id: Optional[int] = None


class ClientResponse(ClientBase):
    """
    Used for GET responses.
    Never includes password.
    """
    clients_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True