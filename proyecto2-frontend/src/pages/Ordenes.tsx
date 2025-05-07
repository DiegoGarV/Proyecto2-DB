import { useEffect, useState } from "react";
import api from "../api/api";
import type { Orden } from "../interfaces/types";


export default function Ordenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [error, setError] = useState("");
  const [minimo, setMinimo] = useState("");
  const [buscarId, setBuscarId] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [ordenIdActualizar, setOrdenIdActualizar] = useState("");

  const obtenerTodas = () => {
    api.get<Orden[]>("/ordenes")
      .then((res) => {
        setOrdenes(res.data);
        setError("");
      })
      .catch(() => setError("Error al obtener órdenes"));
  };

  useEffect(() => {
    obtenerTodas();
  }, []);

  const filtrarPorTotal = async () => {
    try {
      const res = await api.get<Orden[]>("/ordenes/mayores", {
        params: { goal: minimo },
      });
      setOrdenes(res.data);
      setError("");
    } catch {
      setError("No se encontraron órdenes con ese criterio.");
    }
  };

  const buscarPorId = async () => {
    try {
      const res = await api.get<Orden>(`/orden/${buscarId}`);
      if ((res.data as any).mensaje) {
        setError((res.data as any).mensaje);
        return;
      }
      
      setOrdenes([res.data]);
      setError("");
    } catch {
      setError("Orden no encontrada.");
    }
  };

  const actualizarEstado = async () => {
    try {
      const payload = [{ id: ordenIdActualizar, estado: nuevoEstado }];
      await api.put("/actualizarEstadosOrdenes", payload);
      alert("Estado actualizado");
      obtenerTodas();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar estado");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Órdenes</h1>

      <div style={styles.section}>
        <h3>Filtrar por total mínimo</h3>
        <input
          placeholder="Monto mínimo"
          type="number"
          value={minimo}
          onChange={(e) => setMinimo(e.target.value)}
          style={styles.input}
        />
        <button onClick={filtrarPorTotal} style={styles.button}>
          Buscar
        </button>
      </div>

      <div style={styles.section}>
        <h3>Buscar por ID</h3>
        <input
          placeholder="ID de la orden"
          value={buscarId}
          onChange={(e) => setBuscarId(e.target.value)}
          style={styles.input}
        />
        <button onClick={buscarPorId} style={styles.button}>
          Buscar
        </button>
      </div>

      <div style={styles.section}>
        <h3>Actualizar estado</h3>
        <input
          placeholder="ID de la orden"
          value={ordenIdActualizar}
          onChange={(e) => setOrdenIdActualizar(e.target.value)}
          style={styles.input}
        />
        <select
          value={nuevoEstado}
          onChange={(e) => setNuevoEstado(e.target.value)}
          style={styles.input}
        >
          <option value="">Selecciona estado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Entregado">Entregado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Preparando">Preparando</option>
        </select>

        <button onClick={actualizarEstado} style={styles.button}>
          Actualizar
        </button>
      </div>

      <button onClick={obtenerTodas} style={styles.refreshButton}>
        Ver todas
      </button>

      {error && <p style={styles.error}>{error}</p>}

      <ul style={styles.list}>
        {ordenes.map((o) => (
          <li key={o._id} style={styles.card}>
            <strong>ID:</strong> {o._id}<br />
            🧑 Usuario: {o.usuario_id}<br />
            🍽️ Restaurante: {o.restaurante_id}<br />
            📅 Fecha: {new Date(o.fecha).toLocaleString()}<br />
            📦 Estado: {o.estado}<br />
            💰 Total: Q{o.total.toFixed(2)}
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
  section: {
    marginBottom: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    padding: "0.5rem",
    marginBottom: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "1rem",
    width: "300px",
  },
  button: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  refreshButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "1rem",
    marginBottom: "2rem",
  },
  list: {
    listStyle: "none",
    padding: 0,
    width: "100%",
    maxWidth: "600px",
    color: "black",
  },
  card: {
    backgroundColor: "#f9fafb",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
  },
  error: {
    color: "#f87171",
    fontWeight: "bold",
    marginTop: "1rem",
  },
};
