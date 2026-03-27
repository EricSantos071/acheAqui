from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

 
# ══════════════════════════════════════════════════════════════════════════════
# CLIENTS
# ══════════════════════════════════════════════════════════════════════════════
 
class ClientBase(BaseModel):
    """
    Fields shared between creating and responding.
    These are the fields the user fills in when registering.
    """
    first_name: str
    last_name: str
    doc_cpf: str           # "012.345.678-90" or "01234567890" — no leading zero loss
    email: str
    client_phone: str      # "+55 48 99999-9999"
    birthdate: date
    status: bool = True    # defaults to active when creating
 
 
class ClientCreate(ClientBase):
    """
    Used for POST /registers/clients
    Extends ClientBase by adding the password field.
    We separate this so the password never leaks into GET responses.
    """
    password: str          # will be hashed before saving (auth step)
 
 
class ClientResponse(ClientBase):
    """
    Used for GET responses — includes DB-generated fields.
    Never includes password.
    """
    clients_id: int
    created_at: datetime
    updated_at: datetime
 
    class Config:
        from_attributes = True  # allows mapping from DB dict rows to this model
 
 
# ══════════════════════════════════════════════════════════════════════════════
# ADDRESS
# ══════════════════════════════════════════════════════════════════════════════
 
class AddressBase(BaseModel):
    street: str
    house_num: str
    street_extra: Optional[str] = None  # e.g. "Apt 4B" — optional in practice
    neighborhood: str
    zip_code: str          # 01234-567
    city: str
    state: str             # 2-char code, e.g. "SC"
    country: str
 
 
class AddressCreate(AddressBase):
    """Used for POST /registers/address"""
    pass               # no extra fields needed beyond AddressBase
 
 
class AddressResponse(AddressBase):
    """Used for GET responses."""
    address_id: int
 
    class Config:
        from_attributes = True
 
 
# ══════════════════════════════════════════════════════════════════════════════
# ENTREPRENEURS
# ══════════════════════════════════════════════════════════════════════════════
 
class EntrepreneurBase(BaseModel):
    doc_cnpj: str          # 01.234.567/0089-10 or 01234567008910
    phone: str
    status: bool = True
 
 
class EntrepreneurCreate(EntrepreneurBase):
    """Used for POST /registers/entrepreneurs"""
    pass
 
 
class EntrepreneurResponse(EntrepreneurBase):
    """Used for GET responses."""
    entrepreneurs_id: int
    created_at: datetime
    updated_at: datetime
 
    class Config:
        from_attributes = True
 