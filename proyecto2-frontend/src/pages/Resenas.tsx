import { useEffect, useState } from "react";
import api from "../api/api";

interface Resena {
  _id: string;
  comentario: string;
  calificacion: number;
  type: string;
  usuario_id: string;
  reviewed_id: string;
  fecha: string;
}

export default function Resenas() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [error, setError] = useState("");

  // Obtener todas las reseñas
  const obtenerTodas = () => {
    api.get<Resena[]>("/reseñas")
      .then((res) => {
        setResenas(res.data);
        setError("");
      })
      .catch(() => setError("Error al cargar reseñas"));
  };

  // Obtener reseñas ordenadas por calificación
  const obtenerOrdenadas = () => {
    api.get<Resena[]>("/reseñas/ordenadas")
      .then((res) => {
        setResenas(res.data);
        setError("");
      })
      .catch(() => setError("Error al ordenar reseñas"));
  };

  useEffect(() => {
    obtenerTodas();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Reseñas</h1>

      <div style={styles.buttons}>
        <button style={styles.primaryButton} onClick={obtenerOrdenadas}>
          Ordenar por Calificación
        </button>
        <button style={styles.secondaryButton} onClick={obtenerTodas}>
          Mostrar Todas
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <ul style={styles.list}>
        {resenas.length === 0 && <p>No hay reseñas disponibles.</p>}
        {resenas.map((r) => (
          <li key={r._id} style={styles.card}>
            <strong>Tipo:</strong> {r.type.toUpperCase()}<br />
            <strong>Comentario:</strong> {r.comentario}<br />
            <strong>Usuario:</strong> {r.usuario_id}<br />
            <strong>Destino:</strong> {r.reviewed_id}<br />
            <strong>Fecha:</strong> {new Date(r.fecha).toLocaleString()}<br />
            <strong>Calificación:</strong> {"⭐".repeat(r.calificacion)}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
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
  buttons: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  primaryButton: {
    backgroundColor: "#1DA1F2",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    color: "#333",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
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
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    color: "black",
  },
  error: {
    color: "#f87171",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
};
