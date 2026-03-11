from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    model_config = ConfigDict(from_attributes=True)
 
    id: Optional[int] = None

# Additional properties to return via API
class User(UserInDBBase):
    pass

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
