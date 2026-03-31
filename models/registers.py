from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional


# ══════════════════════════════════════════════════════════════════════════════
# ADDRESS
# Must come before ClientBase since clients reference address_id
# ══════════════════════════════════════════════════════════════════════════════

class AddressBase(BaseModel):
    street: str
    house_num: str          # changed from int to str — preserves formatting
    street_extra: Optional[str] = None
    neighborhood: str
    zip_code: str           # changed from int to str — preserves leading zeros
    city: str
    state: str              # 2-char code e.g. "SC"
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
# Must come before ClientBase since clients optionally reference entrepreneur_id
# ══════════════════════════════════════════════════════════════════════════════

class EntrepreneurBase(BaseModel):
    doc_cnpj: str           # changed from int to str — preserves leading zeros
    phone: str              # changed from int to str — preserves formatting
    status: bool = True


class EntrepreneurCreate(EntrepreneurBase):
    """Used for POST /registers/entrepreneurs"""
    pass


class EntrepreneurUpdate(BaseModel):
    """Used for PUT /registers/entrepreneurs/{id} — all fields optional"""
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
    first_name: str
    last_name: str
    doc_cpf: str            # changed from int to str — preserves leading zeros
    email: str
    client_phone: str       # changed from int to str — preserves formatting
    birthdate: date
    status: bool = True
    address_id: int         # FK → registers.address
    entrepreneur_id: Optional[int] = None  # FK → registers.entrepreneurs (nullable)


class ClientCreate(ClientBase):
    """
    Used for POST /registers/clients.
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
    """Used for PUT /registers/clients/{id} — all fields optional"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    doc_cpf: Optional[str] = None
    email: Optional[str] = None
    client_phone: Optional[str] = None
    birthdate: Optional[date] = None
    status: Optional[bool] = None
    address_id: Optional[int] = None
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