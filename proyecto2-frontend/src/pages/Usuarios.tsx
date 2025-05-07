import { useEffect, useState } from "react";
import api from "../api/api";
import type { Usuario, UsuarioProyeccion } from "../interfaces/types";


export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [proyeccion, setProyeccion] = useState<UsuarioProyeccion[]>([]);
  const [mostrarProyeccion, setMostrarProyeccion] = useState(false);
  const [updateForm, setUpdateForm] = useState(false);

  // Estados para actualizar usuario
  const [correoActualizar, setCorreoActualizar] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevoMunicipio, setNuevoMunicipio] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api.get<Usuario[]>("/usuarios")
      .then((res) => setUsuarios(res.data))
      .catch((err: unknown) => console.error(err));
  }, []);

  const toggleProyeccion = async () => {
    if (mostrarProyeccion) {
      setMostrarProyeccion(false);
    } else {
      try {
        const res = await api.get<UsuarioProyeccion[]>("/usuarios/proyeccion");
        setProyeccion(res.data);
        setMostrarProyeccion(true);
      } catch (error) {
        console.error("Error al obtener proyección:", error);
      }
    }
  };

  const handleActualizarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoActualizar) return;

    const datosActualizados: any = {};
    if (nuevoNombre) datosActualizados.nombre = nuevoNombre;
    if (nuevoTelefono) datosActualizados.telefono = nuevoTelefono;
    if (nuevoMunicipio) datosActualizados.direccion = { municipio: nuevoMunicipio };

    try {
      const res = await api.put(`/actualizarUsuario/${correoActualizar}`, datosActualizados);
      setMensaje(res.data.mensaje);
      setNuevoNombre("");
      setNuevoTelefono("");
      setNuevoMunicipio("");
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar el usuario");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Usuarios</h1>

      <div style={{gap: "1rem", display: "flex", flexDirection: "row", alignItems: "center"}}>
      <button style={styles.button} onClick={toggleProyeccion}>
        {mostrarProyeccion ? "Ver información completa" : "Ver solo nombre y correo"}
      </button>
      <button style={styles.button} onClick={setUpdateForm.bind(null, !updateForm)}>
        {updateForm ? "Cancelar" : "Modificar Usuario"}
      </button>

      </div>

      {updateForm && (
        <>
          {/* Formulario para actualizar */}
          <form onSubmit={handleActualizarUsuario} style={styles.updateForm}>
          <h3>Actualizar Usuario</h3>
          <input
            type="email"
            placeholder="Correo del usuario"
            value={correoActualizar}
            onChange={(e) => setCorreoActualizar(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Nuevo nombre"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nuevo teléfono"
            value={nuevoTelefono}
            onChange={(e) => setNuevoTelefono(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nuevo municipio"
            value={nuevoMunicipio}
            onChange={(e) => setNuevoMunicipio(e.target.value)}
          />
          <button type="submit" style={styles.primaryButton}>Actualizar</button>
          {mensaje && <p style={{ color: "#10B981", marginTop: "0.5rem" }}>{mensaje}</p>}
          </form>
        </>
      )}
      


      {mostrarProyeccion ? (
        <>
          <h2>Proyección de Usuarios</h2>
          <ul>
            {proyeccion.map((u, index) => (
              <li key={index}>
                <strong>{u.nombre}</strong> — {u.correo}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul>
          {usuarios.map((u) => (
            <li key={u._id}>
              <strong>{u.nombre}</strong> – {u.correo}<br />
              📍 {u.direccion.municipio}, {u.direccion.nombre} ({u.direccion.ubicacion.latitud}, {u.direccion.ubicacion.longitud})<br />
              📞 {u.telefono}<br />
              🗓️ Registrado el: {new Date(u.fecha_registro).toLocaleDateString()}
              <hr />
            </li>
          ))}
        </ul>
      )}
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
  button: {
    backgroundColor: "#635BFF",
    color: "white",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    marginTop: "1rem",
    fontWeight: "bold",
  },
  updateForm: {
    marginTop: "2rem",
    marginBottom: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    maxWidth: "400px",
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#10B981",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
