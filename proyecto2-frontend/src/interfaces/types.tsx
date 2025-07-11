export interface Usuario {
    _id: string;
    nombre: string;
    correo: string;
    telefono: string;
    direccion: {
      nombre: string;
      municipio: string;
      ubicacion: {
        latitud: number;
        longitud: number;
      };
    };
    fecha_registro: string;
}

export interface UsuarioProyeccion {
  nombre: string;
  correo: string;
}

export interface Restaurante {
  _id: string;
  nombre: string;
  categoria: string;
  ciudad: string;
  departamento: string;
  horario: string;
  calificacion_promedio: number;
  ubicacion: {
    latitud: number;
    longitud: number;
  };
}

export interface Orden {
  _id: string;
  usuario_id: string;
  restaurante_id: string;
  fecha: string;
  estado: string;
  total: number;
  items: any[];
}

export interface Resena {
  _id: string;
  comentario: string;
  calificacion: number;
  type: string;
  usuario_id: string;
  reviewed_id: string;
  fecha: string;
}

export interface MenuItem {
  _id: string;
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  precio: number;
  disponible: number;
  categoria: string;
  restaurante_id: string;
}