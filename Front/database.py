from pymongo import MongoClient
from bson.objectid import ObjectId

# Reemplaza con tu cadena de conexión y nombre de base de datos
MONGO_URI = "mongodb+srv://joseenriquezayas2012_db_user:dxibJK00NNgpVWVD@cluster-1.cqutmwh.mongodb.net/?appName=Cluster-1"
DB_NAME = "LecturaVivaDB"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Colecciones
libros_collection = db["libros"]
pedidos_collection = db["pedidos"]

def serialize_document(document):
    """Convierte un documento de MongoDB (con ObjectId) a un diccionario compatible con Pydantic (con string 'id')."""
    if document:
        document['_id'] = str(document['_id'])
    return document

# Funciones de ejemplo para la base de datos

def get_all_libros():
    """Recupera todos los libros."""
    libros = list(libros_collection.find())
    return [serialize_document(libro) for libro in libros]

def create_new_pedido(pedido_data: dict):
    """Inserta un nuevo pedido y devuelve el ID."""
    # Simular la generación de ID de pedido y fecha
    import datetime
    from random import randint
    pedido_data["fecha_pedido"] = datetime.datetime.now().isoformat() + "Z"
    pedido_data["id_pedido"] = f"LV-{datetime.datetime.now().strftime('%Y%m%d')}-{randint(100, 999)}"
    pedido_data["estado"] = "Pendiente"
    
    result = pedidos_collection.insert_one(pedido_data)
    # Devolver el pedido recién creado para confirmación
    new_pedido = pedidos_collection.find_one({"_id": result.inserted_id})
    return serialize_document(new_pedido)