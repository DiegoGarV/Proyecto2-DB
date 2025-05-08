import { useState } from "react";
import api from "../api/api";

export default function Reportes() {
    const [usuariosPorMunicipio, setUsuariosPorMunicipio] = useState<any[]>([]);
    const [platosMasVendidos, setPlatosMasVendidos] = useState<any[]>([]);
    const [calificacionesPromedio, setCalificacionesPromedio] = useState<any[]>([]);

    const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
    const [mostrarPlatos, setMostrarPlatos] = useState(false);
    const [mostrarCalificaciones, setMostrarCalificaciones] = useState(false);
  
    const toggleUsuariosPorMunicipio = async () => {
        if (mostrarUsuarios) {
        setMostrarUsuarios(false);
        } else {
        try {
            const res = await api.get("/reportes/usuarios_por_municipio");
            setUsuariosPorMunicipio(res.data.usuarios_por_municipio);
            setMostrarUsuarios(true);
        } catch (err) {
            console.error("Error al cargar usuarios por municipio", err);
        }
        }
    };

    const togglePlatosMasVendidos = async () => {
        if (mostrarPlatos) {
        setMostrarPlatos(false);
        } else {
        try {
            const res = await api.get("/reportes/platos_mas_vendidos");
            setPlatosMasVendidos(res.data.platos_mas_vendidos);
            setMostrarPlatos(true);
        } catch (err) {
            console.error("Error al cargar platos", err);
        }
        }
    };

    const toggleCalificacionesPromedio = async () => {
        if (mostrarCalificaciones) {
        setMostrarCalificaciones(false);
        } else {
        try {
            const res = await api.get("/reportes/calificaciones_promedio_restaurantes");
            setCalificacionesPromedio(res.data.calificaciones_promedio_restaurantes);
            setMostrarCalificaciones(true);
        } catch (err) {
            console.error("Error al cargar calificaciones", err);
        }
        }
    };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "#635BFF" }}>Reportes</h1>

      <button onClick={toggleUsuariosPorMunicipio} style={styles.button}>
        {mostrarUsuarios ? "Ocultar" : "Mostrar"} Usuarios por Municipio
      </button>
      {mostrarUsuarios && (
        <ul style={styles.list}>
          {usuariosPorMunicipio.map((m) => (
            <li key={m._id} style={styles.card}>
            🏘️ <strong>{m._id}</strong>: {m.total_usuarios} usuarios
            </li>
          ))}
        </ul>
      )}

      <button onClick={togglePlatosMasVendidos} style={styles.button}>
        {mostrarPlatos ? "Ocultar" : "Mostrar"} Platos más vendidos
      </button>
      {mostrarPlatos && (
        <ul style={styles.list}>
          {platosMasVendidos.map((r) => (
            <li key={r.restaurante_nombre} style={styles.card}>
              <strong>{r.restaurante_nombre}</strong>
              <ul>
                {r.platos_vendidos.map((p: any, index: number) => (
                  <li key={index}>🍽️ {p.plato} — {p.cantidad} vendidos — Q{p.precio}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <button onClick={toggleCalificacionesPromedio} style={styles.button}>
        {mostrarCalificaciones ? "Ocultar" : "Mostrar"} Calificaciones Promedio
      </button>
      {mostrarCalificaciones && (
        <ul style={styles.list}>
          {calificacionesPromedio.map((r) => (
            <li key={r.restaurante_nombre} style={styles.card}>
              ⭐ <strong>{r.restaurante_nombre}</strong>: {r.calificacion_promedio.toFixed(2)} / 5 
              ({r.total_reseñas} reseñas)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  button: {
    backgroundColor: "#1DA1F2",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    margin: "1rem 0",
    fontWeight: "bold",
  },
  list: {
    listStyle: "none",
    padding: 0,
    maxWidth: "700px",
    color: "black"
  },
  card: {
    backgroundColor: "#f0f4f8",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
  },
};
