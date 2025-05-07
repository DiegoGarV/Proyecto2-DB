import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.get(`/usuario/${correo}`);
      const user = response.data;
      if (user && user.telefono === telefono) {
        alert("Inicio de sesión exitoso");
        navigate("/restaurantes");
      } else {
        alert("Correo o teléfono incorrecto");
      }
    } catch (err) {
      alert("Usuario no encontrado");
      console.error(err);
    }
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoUsuario = {
      nombre,
      correo,
      telefono,
      fecha_registro: new Date().toISOString().split("T")[0],
      direccion: {
        nombre: sucursal,
        municipio,
        ubicacion: {
          latitud: parseFloat(latitud),
          longitud: parseFloat(longitud),
        },
      },
    };

    try {
      const response = await api.post("/nuevoUsuario", nuevoUsuario);
      alert("Usuario creado: " + response.data.id);
      navigate("/restaurantes");
    } catch (err: any) {
      console.error(err);
      alert("Error al crear usuario");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{isRegistering ? "Crear Cuenta" : "Login"}</h1>
      <form
        onSubmit={isRegistering ? handleRegistro : handleLogin}
        style={styles.form}
      >
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          style={styles.input}
        />

        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Nombre sucursal"
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="number"
              step="any"
              placeholder="Latitud"
              value={latitud}
              onChange={(e) => setLatitud(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitud"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              required
              style={styles.input}
            />
          </>
        )}

        <div style={styles.buttonContainer}>
          <button
            type="submit"
            style={isRegistering ? styles.secundaryButton : styles.primaryButton}
          >
            {isRegistering ? "Crear Usuario" : "Iniciar Sesión"}
          </button>
          <button
            type="button"
            style={isRegistering ? styles.primaryButton : styles.secundaryButton}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Ya tengo cuenta" : "Crear cuenta"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  title: {
    color: "#635BFF",
    textShadow: `-0.5px -0.5px 0 white,
                  0.5px -0.5px 0 white,
                  -0.5px 0.5px 0 white,
                  0.5px 0.5px 0 white`,
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
    width: "300px",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "1rem",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#635BFF",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  secundaryButton: {
    backgroundColor: "white",
    color: "#635BFF",
    border: "2px solid #635BFF",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
