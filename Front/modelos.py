from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

# --- Esquemas para Libros ---

class LibroBase(BaseModel):
    """Esquema base para un libro."""
    titulo: str = Field(..., example="Estudio en Escarlata")
    autor: str = Field(..., example="A. Conan Doyle")
    precio: int = Field(..., example=10990)
    genero: Optional[str] = Field(None, example="Novela Negra")
    novedad: bool = Field(False, example=True)
    exclusivo: bool = Field(False, example=False)
    imagen_url: Optional[str] = Field(None, example="Sherlock.webp")

class Libro(LibroBase):
    """Esquema de libro con ID para lectura (respuesta)."""
    id: str = Field(..., alias="_id", example="660000000000000000000001")

# --- Esquemas para Pedidos ---

class ItemPedido(BaseModel):
    """Detalle de un artículo dentro de un pedido."""
    id_libro: str = Field(..., example="660000000000000000000001")
    titulo: str = Field(..., example="Estudio en Escarlata")
    precio_unitario: int = Field(..., example=10990)
    cantidad: int = Field(..., example=1)

class DireccionEnvio(BaseModel):
    """Dirección de envío del pedido."""
    nombre_completo: str = Field(..., example="Juan Pérez")
    email: EmailStr = Field(..., example="juan.perez@correo.cl")
    direccion: str = Field(..., example="Av. Siempre Viva 742, Santiago")
    ciudad: str = Field(..., example="Santiago")
    region: str = Field(..., example="Metropolitana")

class PedidoBase(BaseModel):
    """Esquema base para crear un nuevo pedido."""
    id_usuario: EmailStr = Field(..., example="juan.perez@correo.cl")
    subtotal: int = Field(..., example=18980)
    costo_envio: int = Field(..., example=2000)
    total: int = Field(..., example=20980)
    direccion_envio: DireccionEnvio
    items: List[ItemPedido]

class Pedido(PedidoBase):
    """Esquema de pedido con ID para lectura (respuesta)."""
    id: str = Field(..., alias="_id", example="660000000000000000000005")
    id_pedido: str = Field(..., example="LV-2024002")
    fecha_pedido: str = Field(..., example="2025-09-25T10:30:00Z")
    estado: str = Field(..., example="Entregado")