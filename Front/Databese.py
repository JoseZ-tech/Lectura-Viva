from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from typing import List, Optional, Literal, Annotated
from datetime import date
from bson import ObjectId 



PyObjectId = Annotated[str, BeforeValidator(str)]



class Producto(BaseModel):
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    nombre_produc: str
    descripcion: str
    price: float
    stock: int
    img: str
    excluido: bool
    novedad: bool

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        
        from_attributes = True 


class ProductoCreate(BaseModel):
    nombre_produc: str
    descripcion: str
    price: float
    stock: int
    img: str
    excluido: bool
    novedad: bool


class Usuario(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    password: str 

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        from_attributes = True

class UsuarioCreate(BaseModel):
    name: str
    email: EmailStr
    password: str