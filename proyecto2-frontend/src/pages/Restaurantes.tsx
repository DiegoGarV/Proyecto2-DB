import { useEffect, useState } from "react";
import api from "../api/api";
import type { Restaurante } from "../interfaces/types";

export default function Restaurantes() {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [ciudad, setCiudad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formularios, setFormularios] = useState([crearFormularioVacio()]);
  const [porCiudad, setPorCiudad] = useState<{ _id: string; total_restaurantes: number }[]>([]);
  const [mostrarPorCiudad, setMostrarPorCiudad] = useState(false);

  const obtenerTodos = () => {
    const total = 50;
    const skip = Math.floor(Math.random() * (total - 10));
  
    api.get<Restaurante[]>("/restaurantes", { params: { skip, limit: 10 } })
      .then((res) => setRestaurantes(res.data))
      .catch(() => setError("No se pudo cargar la lista de restaurantes"));
  };
  
  useEffect(() => {
    obtenerTodos();
  }, []);

  const handleFiltrar = async () => {
    if (!ciudad && !categoria) {
      setError("Debes ingresar al menos una ciudad o categoría para filtrar.");
      return;
    }

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

  function crearFormularioVacio() {
    return {
      nombre: "",
      categoria: "",
      nombreSucursal: "",
      municipio: "",
      latitud: "",
      longitud: "",
    };
  }

  const agregarFormulario = () => {
    setFormularios([...formularios, crearFormularioVacio()]);
  };

  const actualizarFormulario = (index: number, campo: string, valor: string) => {
    const nuevos = [...formularios];
    (nuevos[index] as any)[campo] = valor;
    setFormularios(nuevos);
  };

  const handleCrearVarios = async () => {
    try {
      const body = formularios.map((f) => ({
        nombre: f.nombre,
        categoria: f.categoria,
        direccion: {
          nombre: f.nombreSucursal,
          municipio: f.municipio,
          ubicacion: {
            latitud: parseFloat(f.latitud),
            longitud: parseFloat(f.longitud),
          },
        },
      }));

      await api.post("/restaurantes/bulk", body);
      alert("Restaurantes creados exitosamente");
      obtenerTodos();
      setMostrarFormulario(false);
      setFormularios([crearFormularioVacio()]);
    } catch (err) {
      console.error(err);
      alert("Error al crear restaurantes");
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
        style={{ ...styles.primaryButton, marginTop: "1rem", marginBottom: "1rem" }}
        onClick={() => setMostrarFormulario((prev) => !prev)}
      >
        {mostrarFormulario ? "Cancelar" : "Crear Restaurantes"}
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
        <div>
          {formularios.map((formulario, index) => (
            <div key={index} style={styles.formulario}>
              <input placeholder="Nombre" value={formulario.nombre} onChange={(e) => actualizarFormulario(index, "nombre", e.target.value)} style={styles.input} />
              <input placeholder="Categoría" value={formulario.categoria} onChange={(e) => actualizarFormulario(index, "categoria", e.target.value)} style={styles.input} />
              <input placeholder="Sucursal" value={formulario.nombreSucursal} onChange={(e) => actualizarFormulario(index, "nombreSucursal", e.target.value)} style={styles.input} />
              <input placeholder="Municipio" value={formulario.municipio} onChange={(e) => actualizarFormulario(index, "municipio", e.target.value)} style={styles.input} />
              <input type="number" step="any" placeholder="Latitud" value={formulario.latitud} onChange={(e) => actualizarFormulario(index, "latitud", e.target.value)} style={styles.input} />
              <input type="number" step="any" placeholder="Longitud" value={formulario.longitud} onChange={(e) => actualizarFormulario(index, "longitud", e.target.value)} style={styles.input} />
            </div>
          ))}

          <button onClick={agregarFormulario} style={styles.secondaryButton}>Agregar otro restaurante</button>
          <button onClick={handleCrearVarios} style={styles.primaryButton}>Enviar Todos</button>
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
          {restaurantes.map((r) => {
            const nombre = r.nombre || "Desconocido";
            const categoria = r.categoria || "Desconocida";
            const ciudad = r.ciudad || "Desconocida";
            const departamento = r.departamento || "Desconocido";
            const horario = r.horario || "Desconocido";
            const promedio = typeof r.calificacion_promedio === "number"
              ? r.calificacion_promedio.toFixed(1)
              : "N/A";

            const lat = r.ubicacion?.latitud ?? "N/A";
            const long = r.ubicacion?.longitud ?? "N/A";

            return (
              <li key={r._id} style={styles.card}>
                <strong>{nombre}</strong> — {categoria}<br />
                📍 {ciudad}, {departamento} ({lat}, {long})<br />
                🕒 Horario: {horario}<br />
                ⭐ Promedio: {promedio} / 5
              </li>
            );
          })}
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
    width: "100%",
    position: "absolute",
    right: 0,
    left: 0,
    top: 0,
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
    color: "#635BFF",
  },
  input: {
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1rem",
    marginRight: "0.5rem"
  },
  primaryButton: {
    backgroundColor: "#1DA1F2",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    margin: "0.5rem",
  },
  secondaryButton: {
    backgroundColor: "white",
    color: "#1DA1F2",
    border: "1px solid #1DA1F2",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  formulario: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "0.7rem",
    marginBottom: "1rem",
    backgroundColor: "#f3f4f6",
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    maxWidth: "800px",
  },
  filterContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
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
  }
};