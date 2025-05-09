// src/components/HamburgerMenu.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Usuarios", path: "/usuarios" },
  { name: "Restaurantes", path: "/restaurantes" },
  { name: "Reseñas", path: "/resenas" },
  { name: "Órdenes", path: "/ordenes" },
  { name: "Menú", path: "/menu" },
  { name: "Reportes", path: "/reportes" },
];

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === "/") return null;

  return (
    <div style={styles.container}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.burger}>
        ☰
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            style={styles.menu}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                style={styles.link}
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  burger: {
    background: "#635BFF",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  menu: {
    marginTop: "10px",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
  },
  link: {
    color: "#333",
    textDecoration: "none",
    padding: "8px 0",
    fontWeight: "bold",
  },
};
