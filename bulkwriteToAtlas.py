import csv
from pymongo import MongoClient, InsertOne
from dotenv import load_dotenv
import os
from datetime import datetime

# Configurar URI de conexión
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["proyecto2-db"]

id_map = {}

# Colección de usuarios
coleccion_usuarios = db["usuarios"]
operaciones = []
usuarios_csv = []
with open("usuarios.csv", newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for fila in reader:
        usuarios_csv.append(fila)
        fecha = datetime.strptime(fila["fecha_registro"], "%Y-%m-%d")
        doc = {
            "nombre": fila["nombre"],
            "correo": fila["correo"],
            "telefono": fila["telefono"],
            "direccion": {
                "nombre": fila["direccion_nombre"],
                "ubicacion": {
                    "longitud": float(fila["longitud"]),
                    "latitud": float(fila["latitud"])
                },
                "municipio": fila["municipio"]
            },
            "fecha_registro": fecha
        }
        operaciones.append(doc)
resultado = coleccion_usuarios.insert_many(operaciones)
for fila, inserted_id in zip(usuarios_csv, resultado.inserted_ids):
    id_map[fila["temp_id"]] = inserted_id
print("✅ Datos de usuarios insertados.")

# Colección de restaurantes
coleccion_restaurantes = db["restaurantes"]
operaciones = []
restaurante_csv = []
with open("restaurantes.csv", newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for fila in reader:
        restaurante_csv.append(fila)
        doc = {
            "nombre": fila["nombre"],
            "ubicacion": {
                "longitud": float(fila["longitud"]),
                "latitud": float(fila["latitud"])
            },
            "departamento": fila["departamento"],
            "ciudad": fila["ciudad"],
            "categoria": fila["categoria"],
            "calificacion_promedio": float(fila["calificacion_promedio"]),
            "horario": fila["horario"]
        }
        operaciones.append(doc)
resultado = coleccion_restaurantes.insert_many(operaciones)
for fila, inserted_id in zip(restaurante_csv, resultado.inserted_ids):
    id_map[fila["temp_id"]] = inserted_id
print("✅ Datos de restaurantes insertados.")

# Colección de los items del menú
coleccion_menu = db["menu_items"]
operaciones = []
menu_csv = []
with open("menu_items.csv", newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for fila in reader:
        menu_csv.append(fila)
        ingredientes = [i.strip() for i in fila["ingredientes"].split(",")]
        doc = {
            "nombre": fila["nombre"],
            "descripcion": fila["descripcion"],
            "ingredientes": ingredientes,
            "precio": float(fila["precio"]),
            "disponible": fila["disponible"].lower() == "true",
            "categoria": fila["categoria"],
            "restaurante_id": id_map[fila["restaurante_id"]]
        }
        operaciones.append(doc)
resultado = coleccion_menu.insert_many(operaciones)
for fila, inserted_id in zip(menu_csv, resultado.inserted_ids):
    id_map[fila["temp_id"]] = inserted_id
print("✅ Datos de menu_items insertados.")

# Colección de ordenes
coleccion_ordenes = db["ordenes"]
operaciones = []
ordenes_csv = []
with open("ordenes.csv", newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for fila in reader:
        ordenes_csv.append(fila)
        fecha = datetime.strptime(fila["fecha"], "%Y-%m-%d")
        items = []
        for item_str in fila["items"].split("|"):
            item_id, cantidad, precio, descuento = item_str.split(":")
            items.append({
                "item_id": id_map[item_id],
                "cantidad": int(cantidad),
                "precio_unitario": float(precio),
                "descuento": float(descuento)
            })

        doc = {
            "usuario_id": id_map[fila["usuario_id"]],
            "restaurante_id": id_map[fila["restaurante_id"]],
            "fecha": fecha,
            "estado": fila["estado"],
            "items": items,
            "total": float(fila["total"])
        }
        operaciones.append(doc)
resultado = coleccion_ordenes.insert_many(operaciones)
for fila, inserted_id in zip(ordenes_csv, resultado.inserted_ids):
    id_map[fila["temp_id"]] = inserted_id
print("✅ Datos de ordenes insertados correctamente.")

# Colección de reseñas
coleccion_resenas = db["resenas"]
operaciones = []
with open("resenas.csv", newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for fila in reader:
        fecha = datetime.strptime(fila["fecha"], "%Y-%m-%d")
        doc = {
            "usuario_id": id_map[fila["usuario_id"]],
            "orden_id": id_map[fila["orden_id"]],
            "restaurante_id": id_map[fila["restaurante_id"]],
            "comentario": fila["comentario"],
            "calificacion": int(fila["calificacion"]),
            "fecha": fecha
        }
        operaciones.append(doc)
if operaciones:
    coleccion_resenas.insert_many(operaciones)
print("✅ Datos de resenas insertados.")
