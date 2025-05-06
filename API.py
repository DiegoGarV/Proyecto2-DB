# Inicializar api con el comando de abajo:
# python -m uvicorn API:app --reload
# Visitar http://127.0.0.1:8000/docs para ver la documentación de la API

from fastapi import FastAPI, HTTPException, Query
from pymongo import MongoClient
from bson import ObjectId
from bson.json_util import dumps
from dotenv import load_dotenv
import os
import json
from pydantic import BaseModel
from datetime import datetime
from typing import List

# Cargar variables de entorno
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "proyecto2-db"

# Inicializar FastAPI
app = FastAPI()

# Conexión a MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Conversor de ObjectId a string para la respuesta JSON
def parse_objectid(obj):
    if isinstance(obj, dict):
        return {k: parse_objectid(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [parse_objectid(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

# Clases de modelos para la validación de datos
class Ubicacion(BaseModel):
    longitud: float
    latitud: float

class Direccion(BaseModel):
    nombre: str
    ubicacion: Ubicacion
    municipio: str

class UsuarioIn(BaseModel):
    nombre: str
    correo: str
    telefono: str
    direccion: Direccion
    fecha_registro: str  # Formato: YYYY-MM-DD

class RestauranteIn(BaseModel):
    nombre: str
    ubicacion: Ubicacion
    departamento: str
    ciudad: str
    categoria: str
    calificacion_promedio: float
    horario: str

# Obtener todos los usuarios
@app.get("/usuarios")
def obtener_usuarios():
    usuarios = list(db["usuarios"].find())
    return [parse_objectid(usuario) for usuario in usuarios]

# Obtener todos los items del menú
@app.get("/menu")
def obtener_menu():
    menu_items = list(db["menu_items"].find())
    return [parse_objectid(item) for item in menu_items]

# Obtener todas las ordenes
@app.get("/ordenes")
def obtener_ordenes():
    ordenes = list(db["ordenes"].find())
    return [parse_objectid(orden) for orden in ordenes]

# Obtener todas las reseñas
@app.get("/reseñas")
def obtener_reseñas():
    reseñas = list(db["resenas"].find())
    return [parse_objectid(reseña) for reseña in reseñas]

# Obtener un usuario por correo
@app.get("/usuario/{correo}")
def obtener_usuario(correo: str):
    usuario = db["usuarios"].find_one({"correo": {"$regex": f"^{correo}$", "$options": "i"}})
    if usuario:
        return parse_objectid(usuario)
    else:
        return {"mensaje": "Usuario no encontrado"}
    
# Obtener restaurante por nombre
@app.get("/restaurante/{nombre}")
def obtener_restaurante(nombre: str):
    restaurante = db["restaurantes"].find_one({"nombre": {"$regex": f"^{nombre}$", "$options": "i"}})
    if restaurante:
        return parse_objectid(restaurante)
    else:
        return {"mensaje": "Restaurante no encontrado"}
    
# Obtener restaurante por ID
@app.get("/restaurante/id/{restaurante_id}")
def obtener_restaurante_id(restaurante_id: str):
    restaurante = db["restaurantes"].find_one({"_id": ObjectId(restaurante_id)})
    if restaurante:
        return parse_objectid(restaurante)
    else:
        return {"mensaje": "Restaurante no encontrado"}

# Obtener un item del menú por nombre
@app.get("/menu/{nombre}")
def obtener_menu_item(nombre: str):
    menu_item = db["menu_items"].find_one({"nombre": {"$regex": f"^{nombre}$", "$options": "i"}})
    if menu_item:
        return parse_objectid(menu_item)
    else:
        return {"mensaje": "Item del menú no encontrado"}

# Obtener una orden por ID
@app.get("/orden/{orden_id}")
def obtener_orden(orden_id: str):
    orden = db["ordenes"].find_one({"_id": ObjectId(orden_id)})
    if orden:
        return parse_objectid(orden)
    else:
        return {"mensaje": "Orden no encontrada"}
    
# Obtener una reseña por ID
@app.get("/reseña/{reseña_id}")
def obtener_reseña(reseña_id: str):
    reseña = db["reseñas"].find_one({"_id": ObjectId(reseña_id)})
    if reseña:
        return parse_objectid(reseña)
    else:
        return {"mensaje": "Reseña no encontrada"}

# 1.1 Crear un solo usuario
@app.post("/nuevoUsuario")
def crear_usuario(usuario: UsuarioIn):
    fecha = datetime.strptime(usuario.fecha_registro, "%Y-%m-%d")
    doc = {
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "telefono": usuario.telefono,
        "direccion": usuario.direccion.dict(),
        "fecha_registro": fecha
    }
    resultado = db["usuarios"].insert_one(doc)
    return {"mensaje": "Usuario creado", "id": str(resultado.inserted_id)}

# 1.2 Crear múltiples restaurantes
@app.post("/restaurantes/bulk")
def crear_restaurantes(restaurantes: List[RestauranteIn]):
    docs = []
    for restaurante in restaurantes:
        doc = restaurante.dict()
        docs.append(doc)
    resultado = db["restaurantes"].insert_many(docs)
    return {"mensaje": f"{len(resultado.inserted_ids)} restaurantes creados"}

# 2.1 Filtrar restaurantes por ciudad y/o categoría
@app.get("/restaurantes/filtro")
def filtrar_restaurantes(ciudad: str = Query(None), categoria: str = Query(None)):
    filtro = {}

    if ciudad:
        filtro["ciudad"] = {"$regex": f"^{ciudad}$", "$options": "i"}
    if categoria:
        filtro["categoria"] = {"$regex": f"^{categoria}$", "$options": "i"}

    restaurantes = list(db["restaurantes"].find(filtro))
    if not restaurantes:
        raise HTTPException(status_code=404, detail="No se encontraron restaurantes con esos criterios")
    
    return [parse_objectid(restaurante) for restaurante in restaurantes]

# 2.2 Proyección de usuarios y sus correos
@app.get("/usuarios/proyeccion")
def proyectar_usuarios():
    usuarios = list(db["usuarios"].find({}, {"_id": 0, "nombre": 1, "correo": 1}))
    return usuarios

# 2.3 Reseñas ordenadas por calificación (de mayor a menor)
@app.get("/reseñas/ordenadas")
def obtener_reseñas_ordenadas():
    reseñas = list(db["resenas"].find().sort("calificacion", -1))
    return [parse_objectid(r) for r in reseñas]

# 2.4 Obtener a los restaurantes según un límite y un desplazamiento
@app.get("/restaurantes/")
def obtener_restaurantes(skip: int = 0, limit: int = 10):
    restaurantes = db["restaurantes"].find().skip(skip).limit(limit)
    return [parse_objectid(r) for r in restaurantes]

# 2.5 ordenes con un total mayor a cierta cantidad
@app.get("/ordenes/mayores")
def obtener_ordenes_mayores(goal: float = 100.00):
    ordenes = list(db["ordenes"].find({
        "total": {"$gt": goal},
        "estado": {"$not": {"$regex": "^cancelado$", "$options": "i"}}
    }))
    return [parse_objectid(o) for o in ordenes]




