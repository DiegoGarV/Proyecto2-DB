import os
import csv
import subprocess
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime
from pymongo import MongoClient, TEXT, ASCENDING, DESCENDING, GEOSPHERE

# Cargar variables de entorno
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "proyecto2-db"

# Archivos de entrada y colecciones
colecciones = [
    ("usuarios.csv", "usuarios"),
    ("restaurantes.csv", "restaurantes"),
    ("menu_items.csv", "menu_items"),
    ("ordenes.csv", "ordenes"),
    ("resenas.csv", "resenas"),
]

# Mapas para temp_ids → ObjectIds
id_map = {}

def generar_csv_con_ids_verdaderos():
    # === 1. USUARIOS ===
    with open("Data/usuarios.csv", newline="", encoding="utf-8") as fin, \
         open("Data/tmp_usuarios.csv", "w", newline="", encoding="utf-8") as fout:
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=[
            "_id", "nombre", "correo", "telefono",
            "direccion_nombre", "longitud", "latitud", "municipio",
            "fecha_registro"
        ])
        writer.writeheader()
        for row in reader:
            obj_id = str(ObjectId())
            id_map[row["temp_id"]] = obj_id
            writer.writerow({
                "_id": obj_id,
                "nombre": row["nombre"],
                "correo": row["correo"],
                "telefono": row["telefono"],
                "direccion_nombre": row["direccion_nombre"],
                "longitud": row["longitud"],
                "latitud": row["latitud"],
                "municipio": row["municipio"],
                "fecha_registro": row["fecha_registro"],
            })

    # === 2. RESTAURANTES ===
    with open("Data/restaurantes.csv", newline="", encoding="utf-8") as fin, \
         open("Data/tmp_restaurantes.csv", "w", newline="", encoding="utf-8") as fout:
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=[
            "_id", "nombre", "longitud", "latitud", "departamento",
            "ciudad", "categoria", "calificacion_promedio", "horario"
        ])
        writer.writeheader()
        for row in reader:
            obj_id = str(ObjectId())
            id_map[row["temp_id"]] = obj_id
            writer.writerow({
                "_id": obj_id,
                "nombre": row["nombre"],
                "longitud": row["longitud"],
                "latitud": row["latitud"],
                "departamento": row["departamento"],
                "ciudad": row["ciudad"],
                "categoria": row["categoria"],
                "calificacion_promedio": row["calificacion_promedio"],
                "horario": row["horario"],
            })

    # === 3. MENÚ ===
    with open("Data/menu_items.csv", newline="", encoding="utf-8") as fin, \
         open("Data/tmp_menu_items.csv", "w", newline="", encoding="utf-8") as fout:
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=[
            "_id", "nombre", "descripcion", "ingredientes", "precio",
            "disponible", "categoria", "restaurante_id"
        ])
        writer.writeheader()
        for row in reader:
            obj_id = str(ObjectId())
            id_map[row["temp_id"]] = obj_id
            writer.writerow({
                "_id": obj_id,
                "nombre": row["nombre"],
                "descripcion": row["descripcion"],
                "ingredientes": row["ingredientes"],
                "precio": row["precio"],
                "disponible": row["disponible"],
                "categoria": row["categoria"],
                "restaurante_id": id_map[row["restaurante_id"]],
            })

    # === 4. ORDENES ===
    with open("Data/ordenes.csv", newline="", encoding="utf-8") as fin, \
         open("Data/tmp_ordenes.csv", "w", newline="", encoding="utf-8") as fout:
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=[
            "_id", "usuario_id", "restaurante_id", "fecha", "estado",
            "items", "total"
        ])
        writer.writeheader()
        for row in reader:
            obj_id = str(ObjectId())
            id_map[row["temp_id"]] = obj_id
            items_final = []
            for item in row["items"].split("|"):
                item_id, cantidad, precio, descuento = item.split(":")
                items_final.append({
                    "item_id": id_map[item_id],
                    "cantidad": int(cantidad),
                    "precio_unitario": float(precio),
                    "descuento": float(descuento)
                })
            writer.writerow({
                "_id": obj_id,
                "usuario_id": id_map[row["usuario_id"]],
                "restaurante_id": id_map[row["restaurante_id"]],
                "fecha": row["fecha"],
                "estado": row["estado"],
                "items": items_final,
                "total": row["total"],
            })

    # === 5. RESEÑAS ===
    with open("Data/resenas.csv", newline="", encoding="utf-8") as fin, \
        open("Data/tmp_resenas.csv", "w", newline="", encoding="utf-8") as fout:
        reader = csv.DictReader(fin)
        writer = csv.DictWriter(fout, fieldnames=[
            "_id", "reviewed_id", "type", "usuario_id", "comentario", "calificacion", "fecha"
        ])
        writer.writeheader()
        for row in reader:
            obj_id = str(ObjectId())
            id_map[row["temp_id"]] = obj_id
            writer.writerow({
                "_id": obj_id,
                "reviewed_id": id_map[row["reviewed_id"]],
                "type": row["type"],
                "usuario_id": id_map.get(row["usuario_id"]),
                "comentario": row["comentario"],
                "calificacion": row["calificacion"],
                "fecha": row["fecha"],
            })

def ejecutar_importaciones():
    colecciones_tmp = [
        ("Data/tmp_usuarios.csv", "usuarios"),
        ("Data/tmp_restaurantes.csv", "restaurantes"),
        ("Data/tmp_menu_items.csv", "menu_items"),
        ("Data/tmp_ordenes.csv", "ordenes"),
        ("Data/tmp_resenas.csv", "resenas")
    ]
    for archivo, coleccion in colecciones_tmp:
        comando = [
            "mongoimport",
            f"--uri={MONGO_URI}",
            "--collection", coleccion,
            "--type", "csv",
            "--file", archivo,
            "--headerline"
        ]
        print(f"📥 Importando {archivo} a {coleccion}...")
        subprocess.run(comando, check=True)
        print(f"✅ {coleccion} importada.")

def crear_indices():
    print("🔧 Creando índices...")

    client = MongoClient(MONGO_URI)
    db = client["test"]

    # 1. Usuarios
    db.usuarios.create_index("correo", name="idx_correo")  # Simple
    db.usuarios.create_index([("nombre", ASCENDING), ("fecha_registro", DESCENDING)], name="idx_nombre_fecha")  # Compuesto

    # 2. Restaurantes
    db.restaurantes.create_index([("longitud", 1), ("latitud", 1)], name="idx_geo_pos")  # Geoespacial 2dsphere
    db.restaurantes.create_index("categoria", name="idx_categoria")  # Simple
    db.restaurantes.create_index([("nombre", TEXT), ("ciudad", TEXT)], name="idx_texto_nombre_ciudad")  # Texto

    # 3. Menú
    db.menu_items.create_index("disponible", name="idx_disponible")  # Simple
    db.menu_items.create_index([("restaurante_id", ASCENDING), ("categoria", ASCENDING)], name="idx_rest_categoria")  # Compuesto
    db.menu_items.create_index([("descripcion", TEXT)], name="idx_texto_descripcion")  # Texto

    # 4. Ordenes
    db.ordenes.create_index([("usuario_id", ASCENDING), ("fecha", DESCENDING)], name="idx_usuario_fecha")  # Compuesto
    db.ordenes.create_index("estado", name="idx_estado")  # Simple
    db.ordenes.create_index("items.item_id", name="idx_items_multikey")  # Multikey

    # 5. Reseñas
    db.resenas.create_index("usuario_id", name="idx_usuario")  # Simple
    db.resenas.create_index("reviewed_id", name="idx_restaurante")  # Simple
    db.resenas.create_index([("calificacion", DESCENDING), ("fecha", DESCENDING)], name="idx_calif_fecha")  # Compuesto

    print("✅ Índices creados.")


if __name__ == "__main__":
    generar_csv_con_ids_verdaderos()
    ejecutar_importaciones()
    crear_indices()


    