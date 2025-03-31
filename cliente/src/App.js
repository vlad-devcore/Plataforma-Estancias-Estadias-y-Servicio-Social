import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Importar vistas de administración
import Dashboard from './components_admin/Dashboard';
import Inicio from './components_admin/Inicio';
import Usuarios from './components_admin/Usuarios';
import Registros from './components_admin/Registros';
import Formatos from './components_admin/Formatos';
import Empresas from './components_admin/Empresas';
import PerfilAdmin from './components_admin/Perfil';
import Periodos from './components_admin/Periodos';

// Importar vistas de estudiantes
import Login from './components_student/Login';
import Home from './components_student/Home';
import PerfilStudent from './components_student/Perfil';
import Estancia1 from './components_student/formatos/Estancia1';
import Estancia2 from './components_student/formatos/Estancia2';
import Estadias from './components_student/formatos/Estadias';
import ServicioSocial from './components_student/formatos/ServicioSocial';
import EstadiasNacionales from './components_student/formatos/EstadiasNacionales';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rutas para estudiantes */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<PerfilStudent />} />
        {/* Rutas para los formatos de estudiantes */}
        <Route path="/formatos/Estancia1" element={<Estancia1 />} />
        <Route path="/formatos/Estancia2" element={<Estancia2 />} />
        <Route path="/formatos/Estadias" element={<Estadias />} />
        <Route path="/formatos/ServicioSocial" element={<ServicioSocial />} />
        <Route path="/formatos/EstadiasNacionales" element={<EstadiasNacionales />} />

        {/* Rutas para administradores (Dashboard como layout principal) */}
        <Route path="/admin" element={<Dashboard />}>
          <Route path="inicio" element={<Inicio />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="registros" element={<Registros />} />
          <Route path="formatos" element={<Formatos />} />
          <Route path="periodos" element={<Periodos />} />
          <Route path="empresas" element={<Empresas />} />
          <Route path="perfil" element={<PerfilAdmin />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
