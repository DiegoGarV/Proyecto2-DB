import { useEffect, useState } from "react";
import api from "../api/api";
import type { Restaurante } from "../interfaces/types";

export default function Restaurantes() {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [ciudad, setCiudad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [porCiudad, setPorCiudad] = useState<{ _id: string; total_restaurantes: number }[]>([]);
  const [mostrarPorCiudad, setMostrarPorCiudad] = useState(false);



  const obtenerTodos = () => {
    api.get<Restaurante[]>("/restaurantes")
      .then((res) => setRestaurantes(res.data))
      .catch(() => setError("No se pudo cargar la lista de restaurantes"));
  };

  useEffect(() => {
    obtenerTodos();
  }, []);

  const handleFiltrar = async () => {
    try {
      const params: any = {};
      if (ciudad) params.ciudad = ciudad;
      if (categoria) params.categoria = categoria;

      const response = await api.get<Restaurante[]>("/restaurantes/filtro", { params });
      setRestaurantes(response.data);
      setError("");
    } catch {
      setRestaurantes([]);
      setError("No se encontraron restaurantes con esos criterios.");
    }
  };

  const [nuevoRestaurante, setNuevoRestaurante] = useState({
    nombre: "",
    categoria: "",
    nombreSucursal: "",
    municipio: "",
    latitud: "",
    longitud: "",
  });
  
  const handleCrearRestaurante = async () => {
    try {
      const body = [
        {
          nombre: nuevoRestaurante.nombre,
          categoria: nuevoRestaurante.categoria,
          direccion: {
            nombre: nuevoRestaurante.nombreSucursal,
            municipio: nuevoRestaurante.municipio,
            ubicacion: {
              latitud: parseFloat(nuevoRestaurante.latitud),
              longitud: parseFloat(nuevoRestaurante.longitud),
            },
          },
        },
      ];
  
      await api.post("/restaurantes/bulk", body);
      alert("Restaurante creado");
      obtenerTodos();
      setMostrarFormulario(false);
      setNuevoRestaurante({
        nombre: "",
        categoria: "",
        nombreSucursal: "",
        municipio: "",
        latitud: "",
        longitud: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error al crear restaurante");
    }
  };

  const obtenerPorCiudad = async () => {
    try {
      const res = await api.get<{ restaurantes_por_ciudad: { _id: string, total_restaurantes: number }[] }>("/restaurantes/por-ciudad");
      setPorCiudad(res.data.restaurantes_por_ciudad);
      setMostrarPorCiudad(true);
    } catch (err) {
      console.error("Error al obtener restaurantes por ciudad:", err);
    }
  };
  
  

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Restaurantes</h1>

      <button
        style={{...styles.primaryButton, marginTop: "1rem", marginBottom: "1rem"}}
        onClick={() => setMostrarFormulario((prev) => !prev)}
      >
        {mostrarFormulario ? "Cancelar" : "Crear Restaurante"}
      </button>

      <button
        style={{ ...styles.primaryButton, marginBottom: "1rem" }}
        onClick={() => {
          if (mostrarPorCiudad) {
            setMostrarPorCiudad(false);
          } else {
            obtenerPorCiudad();
          }
        }}
      >
        {mostrarPorCiudad ? "Ocultar resumen por ciudad" : "Restaurantes por Ciudad"}
      </button>


        {mostrarFormulario && (
        <div style={styles.formulario}>
            <input placeholder="Nombre" value={nuevoRestaurante.nombre}
            onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, nombre: e.target.value })} style={styles.input} />
            <input placeholder="Categoría" value={nuevoRestaurante.categoria}
            onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, categoria: e.target.value })} style={styles.input} />
            <input placeholder="Nombre Sucursal" value={nuevoRestaurante.nombreSucursal}
            onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, nombreSucursal: e.target.value })} style={styles.input} />
            <input placeholder="Municipio" value={nuevoRestaurante.municipio}
            onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, municipio: e.target.value })} style={styles.input} />
            <input type="number" step="any" placeholder="Latitud" value={nuevoRestaurante.latitud}
            onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, latitud: e.target.value })} style={styles.input} />
            <input type="number" step="any" placeholder="Longitud" value={nuevoRestaurante.longitud}
            onChange={(e) => setNuevoRestaurante({ ...nuevoRestaurante, longitud: e.target.value })} style={styles.input} />

            <button onClick={handleCrearRestaurante} style={styles.primaryButton}>
            Enviar
            </button>
        </div>
        )}


      <div style={styles.filterContainer}>
        <input
          type="text"
          placeholder="Ciudad"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Categoría"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={styles.input}
        />
        <button style={styles.primaryButton} onClick={handleFiltrar}>
          Filtrar
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {mostrarPorCiudad ? (
        <ul style={styles.list}>
          {porCiudad.map((item) => (
            <li key={item._id} style={styles.card}>
              <strong>Ciudad:</strong> {item._id} <br />
              🍽️ Total de Restaurantes: {item.total_restaurantes}
            </li>
          ))}
        </ul>
      ): 
        <ul style={styles.list}>
          {restaurantes.map((r) => (
            <li key={r._id} style={styles.card}>
              <strong>{r.nombre}</strong> — {r.categoria}<br />
              📍 {r.ciudad}, {r.departamento} ({r.ubicacion.latitud}, {r.ubicacion.longitud})<br />
              🕒 Horario: {r.horario}<br />
              ⭐ Promedio: {r.calificacion_promedio.toFixed(1)} / 5
            </li>
          ))}
        </ul>
      }


    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      alignContent: 'center',
      width: "100%",
      position: 'absolute',
      right: 0,
      left: 0,
      top: 0,
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
    color: "#635BFF",
  },
  filterContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  input: {
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1rem",
  },
  primaryButton: {
    backgroundColor: "#1DA1F2",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  list: {
    listStyle: "none",
    padding: 0,
    width: "100%",
    maxWidth: "600px",
  },
  card: {
    backgroundColor: "#f0f4f8",
    border: "1px solid #d1d5db",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    color: 'black'
  },
  error: {
    color: "#f87171",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  formulario: {
    marginTop: "1rem",
    marginBottom: "1rem",
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
    border: '1px solid #ccc',
    padding: '1rem',
    backgroundColor: "rgb(156, 183, 190)"
  }
};
