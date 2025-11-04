from fastapi import FastAPI, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from bson import ObjectId
from .schemas import Usuario, UsuarioCreate, Producto, ProductoCreate 


MONGO_URI = "mongodb://localhost:27017" 
DB_NAME = "ecommerce_db"

app = FastAPI(title="API de eCommerce con MongoDB")
db_client: Optional[AsyncIOMotorClient] = None



@app.on_event("startup")
async def startup_db_client():
    global db_client
    db_client = AsyncIOMotorClient(MONGO_URI)
    print("Conectado a MongoDB!")

@app.on_event("shutdown")
async def shutdown_db_client():
    if db_client:
        db_client.close()
        print("Desconectado de MongoDB.")


def get_collection(collection_name: str):
    return db_client[DB_NAME][collection_name]




@app.post("/usuarios/", response_model=Usuario, status_code=status.HTTP_201_CREATED, tags=["Usuario"])
async def create_user(user: UsuarioCreate):
    usuarios_collection = get_collection("usuarios")
    
    
    user_data = user.model_dump(exclude_unset=True)
    
   
    result = await usuarios_collection.insert_one(user_data)
    
   
    created_user = await usuarios_collection.find_one({"_id": result.inserted_id})
    
    if created_user is None:
        raise HTTPException(status_code=500, detail="Error al crear el usuario en la DB.")
        

    return Usuario(**created_user)


@app.get("/usuarios/", response_model=List[Usuario], tags=["Usuario"])
async def read_users():
    usuarios_collection = get_collection("usuarios")
    

    users_cursor = usuarios_collection.find()
    users_list = await users_cursor.to_list(length=None)
    
    return [Usuario(**user) for user in users_list]


@app.post("/productos/", response_model=Producto, status_code=status.HTTP_201_CREATED, tags=["Producto"])
async def create_product(product: ProductoCreate):
    productos_collection = get_collection("productos")
    product_data = product.model_dump(exclude_unset=True)
    
    result = await productos_collection.insert_one(product_data)
    created_product = await productos_collection.find_one({"_id": result.inserted_id})
    
    if created_product is None:
        raise HTTPException(status_code=500, detail="Error al crear el producto.")
    
    return Producto(**created_product)