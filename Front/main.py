from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from modelos import Libro, Pedido, PedidoBase
from database import get_all_libros, create_new_pedido
import uvicorn

app = FastAPI(
    title="API Lectura Viva",
    description="API para gestionar Libros y Pedidos de la tienda en línea.",
    version="1.0.0"
)
# ==========================================================
# 🚨 BLOQUE DE SOLUCIÓN CORS 🚨
# ==========================================================

origins = [
    # Tu frontend local (Live Server de VS Code)
    "http://127.0.0.1:5500", 
    "http://localhost:5500",
    
    # Tu propio backend (para pruebas internas, opcional)
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Permite los orígenes definidos arriba
    allow_credentials=True,      # Permite cookies y credenciales
    allow_methods=["*"],         # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],         # Permite todos los headers
)
## 📖 Endpoints de Libros

@app.get("/libros", response_model=List[Libro], summary="Obtener todos los libros del catálogo")
def get_libros():
    """
    Recupera una lista completa de todos los libros disponibles en la base de datos.
    """
    try:
        libros = get_all_libros()
        return libros
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener libros: {e}")

# (Se podrían agregar más endpoints para buscar por ID, género, etc.)

## 🛍️ Endpoints de Pedidos

@app.post("/pedidos", response_model=Pedido, status_code=201, summary="Crear un nuevo pedido")
def create_pedido(pedido: PedidoBase):
    """
    Registra un nuevo pedido en la base de datos con los datos de envío y los artículos.
    Genera automáticamente un ID de pedido y la fecha.
    """
    try:
        nuevo_pedido = create_new_pedido(pedido.model_dump(by_alias=True))
        return nuevo_pedido
    except Exception as e:
        # En un entorno real, manejar errores específicos de DB
        raise HTTPException(status_code=500, detail=f"Error al crear el pedido: {e}")

# (Se podrían agregar endpoints para obtener pedidos por usuario, actualizar estado, etc.)

if __name__ == "__main__":
    # Para ejecutar la API, usa este comando en tu terminal:
    # uvicorn main:app --reload
    print("Ejecuta 'uvicorn main:app --reload' en tu terminal para iniciar el servidor.")
    # uvicorn.run(app, host="0.0.0.0", port=8000) # Descomentar para ejecutar directamente