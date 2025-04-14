import csv
import random
from faker import Faker
from uuid import uuid4
from datetime import datetime, timedelta

fake = Faker('es_MX')

# ========== Generadores de IDs ==========
usuarios_ids = [str(uuid4()) for _ in range(1000)]
restaurantes_ids = [str(uuid4()) for _ in range(50)]
menu_items_ids = []

# ========== Usuarios ==========
with open('usuarios.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['temp_id', 'nombre', 'correo', 'telefono', 'direccion_nombre', 'longitud', 'latitud', 'municipio', 'fecha_registro'])
    for temp_id in usuarios_ids:
        ubicacion = [round(random.uniform(-117.1, -86.7), 6), round(random.uniform(14.5, 32.7), 6)]
        writer.writerow([
            temp_id,
            fake.name(),
            fake.unique.email(),
            fake.phone_number(),
            fake.street_name(),
            ubicacion[0], ubicacion[1],
            fake.city(),
            fake.date_between(start_date='-2y', end_date='today')
        ])

# ========== Restaurantes ==========
with open('restaurantes.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['temp_id', 'nombre', 'longitud', 'latitud', 'departamento', 'ciudad', 'categoria', 'calificacion_promedio', 'horario'])
    for temp_id in restaurantes_ids:
        ubicacion = [round(random.uniform(-117.1, -86.7), 6), round(random.uniform(14.5, 32.7), 6)]
        writer.writerow([
            temp_id,
            fake.company(),
            ubicacion[0], ubicacion[1],
            fake.state(),
            fake.city(),
            random.choice(['Mexicana', 'Italiana', 'Japonesa', 'China', 'Vegetariana', 'Mariscos']),
            round(random.uniform(1, 5), 1),
            f"{random.randint(7,10)}:00-{random.randint(19,23)}:00"
        ])

# ========== Menú ==========
with open('menu_items.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['temp_id', 'nombre', 'descripcion', 'ingredientes', 'precio', 'disponible', 'categoria', 'restaurante_id'])
    for _ in range(500):
        temp_id = str(uuid4())
        menu_items_ids.append(temp_id)
        writer.writerow([
            temp_id,
            fake.word().capitalize(),
            fake.sentence(),
            ', '.join(fake.words(nb=random.randint(2, 5))),
            round(random.uniform(50, 300), 2),
            random.choice([True, False]),
            random.choice(['Entrada', 'Plato fuerte', 'Postre', 'Bebida']),
            random.choice(restaurantes_ids)
        ])

# ========== Órdenes ==========
with open('ordenes.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['temp_id', 'usuario_id', 'restaurante_id', 'fecha', 'estado', 'items', 'total'])
    for _ in range(800):
        temp_id = str(uuid4())
        usuario_id = random.choice(usuarios_ids)
        restaurante_id = random.choice(restaurantes_ids)
        fecha = fake.date_between(start_date='-1y', end_date='today')
        estado = random.choice(['Pendiente', 'Preparando', 'Entregado', 'Cancelado'])

        # Generar entre 1 y 5 items por orden
        items = []
        total = 0
        for _ in range(random.randint(1, 5)):
            item_id = random.choice(menu_items_ids)
            cantidad = random.randint(1, 3)
            precio_unitario = round(random.uniform(50, 300), 2)
            descuento = round(random.uniform(0, 0.3), 2)
            subtotal = cantidad * precio_unitario * (1 - descuento)
            total += subtotal
            items.append(f"{item_id}:{cantidad}:{precio_unitario}:{descuento}")

        writer.writerow([
            temp_id,
            usuario_id,
            restaurante_id,
            fecha,
            estado,
            '|'.join(items),
            round(total, 2)
        ])

# ========== Reseñas ==========
with open('resenas.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['temp_id', 'usuario_id', 'orden_id', 'restaurante_id', 'comentario', 'calificacion', 'fecha'])
    for _ in range(500):
        temp_id = str(uuid4())
        usuario_id = random.choice(usuarios_ids)
        orden_id = str(uuid4())
        restaurante_id = random.choice(restaurantes_ids)
        comentario = fake.sentence()
        calificacion = random.randint(1, 5)
        fecha = fake.date_between(start_date='-1y', end_date='today')
        writer.writerow([
            temp_id,
            usuario_id,
            orden_id,
            restaurante_id,
            comentario,
            calificacion,
            fecha
        ])

print("✅ Archivos CSV generados con éxito:")
print("- usuarios.csv")
print("- restaurantes.csv")
print("- menu_items.csv")
print("- ordenes.csv")
print("- resenas.csv")
