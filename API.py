# Inicializar api con el comando de abajo:
# python -m uvicorn API:app --reload
# Visitar http://127.0.0.1:8000/docs para ver la documentación de la API

from fastapi import FastAPI, HTTPException, Query, Body
from pymongo import MongoClient
from bson import ObjectId
from bson.json_util import dumps
from dotenv import load_dotenv
import os
import json
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from fastapi.encoders import jsonable_encoder
from pymongo.collection import ReturnDocument

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
    
# Convierte un diccionario anidado en uno plano con claves jerárquicas
def flatten_dict(d, parent_key='', sep='.'):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

# Clases de modelos para la validación de datos
class Ubicacion(BaseModel):
    longitud: float
    latitud: float

class Direccion(BaseModel):
    nombre: str = Field(..., example="Sucursal Centro")
    municipio: str = Field(..., example="Guadalajara")
    ubicacion: dict = Field(..., example={"latitud": 20.6597, "longitud": -103.3496})


class UsuarioIn(BaseModel):
    nombre: str
    correo: str
    telefono: str
    direccion: Direccion
    fecha_registro: str  # Formato: YYYY-MM-DD

class RestauranteIn(BaseModel):
    nombre: str = Field(..., example="Taco Loco")
    categoria: str = Field(..., example="Mexicana")
    direccion: Direccion

    class Config:
        schema_extra = {
            "example": {
                "nombre": "Taco Loco",
                "categoria": "Mexicana",
                "direccion": {
                    "nombre": "Sucursal Centro",
                    "municipio": "Guadalajara",
                    "ubicacion": {
                        "latitud": 20.6597,
                        "longitud": -103.3496
                    }
                }
            }
        }

class UbicacionUpdate(BaseModel):
    longitud: Optional[float] = None
    latitud: Optional[float] = None

class DireccionUpdate(BaseModel):
    nombre: Optional[str] = None
    ubicacion: Optional[UbicacionUpdate] = None
    municipio: Optional[str] = None

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[DireccionUpdate] = None

class OrdenEstadoUpdate(BaseModel):
    estado: str

class OrdenEstadoItem(BaseModel):
    id: str = Field(..., example="60c72b2f9b1e8a0f0c5d0808")
    estado: str = Field(..., example="Entregado")

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
@app.get("/resena/{resena_id}")
def obtener_reseña(resena_id: str):
    if not ObjectId.is_valid(resena_id):
        raise HTTPException(status_code=400, detail="ID inválido")

    resena = db["resenas"].find_one({"_id": ObjectId(resena_id)})
    if resena:
        return parse_objectid(resena)
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
def crear_restaurantes(
    restaurantes: List[RestauranteIn] = Body(
        ..., 
        example=[
            {
                "nombre": "Taco Loco",
                "categoria": "Mexicana",
                "direccion": {
                    "nombre": "Sucursal Centro",
                    "municipio": "Guadalajara",
                    "ubicacion": {
                        "latitud": 20.6597,
                        "longitud": -103.3496
                    }
                }
            },
            {
                "nombre": "Pizza Bella",
                "categoria": "Italiana",
                "direccion": {
                    "nombre": "Sucursal Norte",
                    "municipio": "Zapopan",
                    "ubicacion": {
                        "latitud": 20.7411,
                        "longitud": -103.3893
                    }
                }
            }
        ]
    )
):
    docs = [restaurante.dict() for restaurante in restaurantes]
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

# 3.1 actualizar los datos de un usuario
@app.put("/actualizarUsuario/{correo}")
def actualizar_usuario(correo: str, datos: UsuarioUpdate):
    filtro = {"correo": {"$regex": f"^{correo}$", "$options": "i"}}
    usuario_existente = db["usuarios"].find_one(filtro)

    if not usuario_existente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_fields = datos.dict(exclude_unset=True)

    flat_update = flatten_dict(jsonable_encoder(update_fields))

    usuario_actualizado = db["usuarios"].find_one_and_update(
        filtro,
        {"$set": flat_update},
        return_document=ReturnDocument.AFTER
    )

    return {"mensaje": "Usuario actualizado", "usuario": parse_objectid(usuario_actualizado)}

# 3.2 Actualizar los estados de una orden
@app.put("/actualizarEstadosOrdenes")
def actualizar_estados_ordenes(
    ordenes: List[OrdenEstadoItem] = Body(..., example=[
        {"id": "60c72b2f9b1e8a0f0c5d0808", "estado": "Entregado"},
        {"id": "60c72b2f9b1e8a0f0c5d0809", "estado": "Cancelado"}
    ])
):
    estados_validos = ["Cancelado", "Entregado", "Pendiente", "Preparando"]

    for orden in ordenes:
        if orden.estado not in estados_validos:
            raise HTTPException(status_code=400, detail=f"Estado inválido: {orden.estado}")

        filtro = {"_id": ObjectId(orden.id)}
        result = db["ordenes"].find_one_and_update(
            filtro,
            {"$set": {"estado": orden.estado}},
            return_document=ReturnDocument.AFTER
        )

        if not result:
            raise HTTPException(status_code=404, detail=f"Orden con ID {orden.id} no encontrada")

    return {"mensaje": "Estados de las órdenes actualizados correctamente"}

# 4.1 Eliminar una reseña
@app.delete("/resenas/{resena_id}")
def eliminar_resena(resena_id: str):
    if not ObjectId.is_valid(resena_id):
        raise HTTPException(status_code=400, detail="ID de reseña inválido")

    resultado = db["resenas"].delete_one({"_id": ObjectId(resena_id)})

    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")

    return {"mensaje": "Reseña eliminada correctamente"}

# 4.2 Eliminar a todos los usuarios de un municipio específico
@app.delete("/usuarios/municipio/{municipio}")
def eliminar_usuarios_por_municipio(municipio: str):
    resultado = db["usuarios"].delete_many({"direccion.municipio": municipio})

    if resultado.deleted_count == 0:
        return {"mensaje": f"No se encontraron usuarios en el municipio '{municipio}'"}
    
    return {"mensaje": f"{resultado.deleted_count} usuarios eliminados del municipio '{municipio}'"}
