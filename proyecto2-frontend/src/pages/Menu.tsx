import { useEffect, useState } from "react";
import api from "../api/api";
import type { MenuItem } from "../interfaces/types";

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [nombreBusqueda, setNombreBusqueda] = useState("");
  const [resultadoBusqueda, setResultadoBusqueda] = useState<MenuItem | null>(null);
  const [ingrediente, setIngrediente] = useState("");
  const [accion, setAccion] = useState("agregar");
  const [mensaje, setMensaje] = useState("");
  const [mostrarResult, setMostrarResult] = useState<boolean | null>(null)

  useEffect(() => {
    api.get<MenuItem[]>("/menu")
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Error al cargar menú:", err));
  }, []);

  const buscarItem = async () => {
    try {
      const res = await api.get(`/menu/${nombreBusqueda}`);
      setMostrarResult(true)
      if ("mensaje" in res.data) {
        setResultadoBusqueda(null);
        setMensaje(res.data.mensaje);
      } else {
        setResultadoBusqueda(res.data);
        setMensaje("");
      }
    } catch {
      setResultadoBusqueda(null);
      setMensaje("Error al buscar el item");
    }
  };

  const modificarIngrediente = async () => {
    try {
      await api.put(`/menu/ingredientes/${nombreBusqueda}`, {
        accion,
        nombre: ingrediente,
      });
      buscarItem();
      setIngrediente("");
      setMensaje(`Ingrediente ${accion} correctamente`);
    } catch (err) {
      console.error("Error al modificar ingrediente:", err);
      setMensaje("Error al modificar ingrediente");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "#635BFF" }}>Menú</h1>

      <h2>Buscar item por nombre</h2>
      <input
        type="text"
        placeholder="Nombre del item"
        value={nombreBusqueda}
        onChange={(e) => setNombreBusqueda(e.target.value)}
        style={styles.input}
      />
      <button style={styles.button} onClick={buscarItem}>Buscar</button>
      <button style={styles.button} onClick={() => setMostrarResult(false)}>Cancelar</button>

      {mensaje && <p style={{ color: "#ef4444" }}>{mensaje}</p>}

      {resultadoBusqueda && mostrarResult && (
        <>
          <hr />
          <div style={styles.card}>
            <h3>{resultadoBusqueda.nombre}</h3>
            <p>{resultadoBusqueda.descripcion}</p>
            <p>Ingredientes: {resultadoBusqueda.ingredientes.join(", ")}</p>
            <p>Precio: Q{resultadoBusqueda.precio}</p>
            <p>Categoría: {resultadoBusqueda.categoria}</p>
            <p>Disponible: {resultadoBusqueda.disponible}</p>

            <div style={{ marginTop: "1rem" }}>
              <h4>Modificar Ingredientes</h4>
              <select value={accion} onChange={(e) => setAccion(e.target.value)} style={styles.input}>
                <option value="agregar">Agregar</option>
                <option value="quitar">Quitar</option>
              </select>
              <input
                type="text"
                placeholder="Ingrediente"
                value={ingrediente}
                onChange={(e) => setIngrediente(e.target.value)}
                style={styles.input}
              />
              <button style={styles.button} onClick={modificarIngrediente}>Aplicar</button>
            </div>
          </div>
        </>
      )}

      <h2>Todos los items</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li key={item._id} style={styles.card}>
            <strong>{item.nombre}</strong><br />
            {item.descripcion}<br />
            Ingredientes: {item.ingredientes.join(", ")}<br />
            Precio: Q{item.precio}<br />
            Categoría: {item.categoria}<br />
            Disponible: {item.disponible}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  input: {
    padding: "0.5rem",
    marginRight: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#1DA1F2",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "#f0f4f8",
    padding: "1rem",
    marginBottom: "1rem",
    borderRadius: "8px",
    color: 'black'
  },
};
