import { useEffect, useState } from "react";
import api from "../api/api";
import type { Resena } from "../interfaces/types";

export default function Resenas() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [error, setError] = useState("");

  const obtenerTodas = () => {
    api.get<Resena[]>("/reseñas")
      .then((res) => {
        setResenas(res.data);
        setError("");
      })
      .catch(() => setError("Error al cargar reseñas"));
  };

  const obtenerOrdenadas = () => {
    api.get<Resena[]>("/reseñas/ordenadas")
      .then((res) => {
        setResenas(res.data);
        setError("");
      })
      .catch(() => setError("Error al ordenar reseñas"));
  };

  const eliminarResena = async (id: string) => {
    const confirmar = confirm("¿Seguro que quieres eliminar esta reseña?");
    if (!confirmar) return;

    try {
      await api.delete(`/resenas/${id}`);
      setResenas(resenas.filter((r) => r._id !== id));
    } catch {
      alert("Error al eliminar la reseña.");
    }
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
            <button onClick={() => eliminarResena(r._id)} style={styles.deleteButton}>❌</button>
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
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
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
    position: "relative",
  },
  deleteButton: {
    position: "absolute",
    top: "8px",
    right: "10px",
    background: "transparent",
    border: "none",
    color: "#ef4444",
    fontSize: "1.2rem",
    cursor: "pointer",
  },
  error: {
    color: "#f87171",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
};
