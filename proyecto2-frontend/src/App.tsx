import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import Restaurantes from "./pages/Restaurantes";
import Menu from "./pages/Menu";
import Ordenes from "./pages/Ordenes";
import Resenas from "./pages/Resenas";
import Reportes from "./pages/Reportes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/restaurantes" element={<Restaurantes />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/ordenes" element={<Ordenes />} />
        <Route path="/resenas" element={<Resenas />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </Router>
  );
}

export default App;
