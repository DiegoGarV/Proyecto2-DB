import pandas as pd
from pymongo import MongoClient, InsertOne
from dotenv import load_dotenv
import os

# Configurar URI de conexión
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["proyecto2-db"]


# Función para cargar e insertar un CSV
def insertar_csv_en_mongo(nombre_csv, nombre_coleccion):
    df = pd.read_csv(nombre_csv)
    operaciones = [InsertOne(row.dropna().to_dict()) for _, row in df.iterrows()]
    if operaciones:
        resultado = db[nombre_coleccion].bulk_write(operaciones)
        print(
            f"✅ Insertados {resultado.inserted_count} documentos en '{nombre_coleccion}'"
        )
    else:
        print(f"⚠️ No hay documentos para insertar en '{nombre_coleccion}'")


# Inserta cada CSV
insertar_csv_en_mongo("usuarios.csv", "usuarios")
insertar_csv_en_mongo("restaurantes.csv", "restaurantes")
insertar_csv_en_mongo("menu_items.csv", "menu_items")
insertar_csv_en_mongo("ordenes.csv", "ordenes")
insertar_csv_en_mongo("resenas.csv", "resenas")
