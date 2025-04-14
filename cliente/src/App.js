import {
  Routes,
  Route,
  useLocation,
  Navigate,
  BrowserRouter as Router,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Vistas de administrador
import Sidebar from './components_admin/Sidebar';
import Inicio from './components_admin/InicioAdmin';
import Usuarios from './components_admin/UsuariosAdmin';
import Registros from './components_admin/RegistrosAdmin';
import Formatos from './components_admin/FormatosAdmin';
import Documentacion from './components_admin/DocumentacionAdmin';
import Empresas from './components_admin/EmpresasAdmin';
import PerfilAdmin from './components_admin/PerfilAdmin';
import Periodos from './components_admin/PeriodosAdmin';
import Logout from './components_admin/Logout'; 

 


// Vistas de estudiantes
import Login from "./components_student/Login"; 
import Home from "./components_student/Home";
import EmpresasS from "./components_student/Empresas";
import PerfilStudent from "./components_student/Perfil";
import Estancia1 from "./components_student/formatos/Estancia1";
import Estancia2 from "./components_student/formatos/Estancia2";
import Estadias from "./components_student/formatos/Estadias";
import ServicioSocial from "./components_student/formatos/ServicioSocial";
import EstadiasNacionales from "./components_student/formatos/EstadiasNacionales";  
import DocumentosView from "./components_student/DocumentosView";

// Página de acceso denegado
import Unauthorized from "./components/Unauthorized";

// Componente PrivateRoute con validación de roles
const PrivateRoute = ({ element, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />; // Redirige al login si no está autenticado
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; // Redirige si el rol no tiene acceso
  }

  return element;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rutas protegidas para estudiantes */}
        <Route
          path="/home"
          element={
            <PrivateRoute element={<Home />} allowedRoles={["estudiante"]} />
          }
        />
        <Route
          path="/empresas"
          element={
            <PrivateRoute
              element={<EmpresasS />}
              allowedRoles={["estudiante"]}
            />
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute
              element={<PerfilStudent />}
              allowedRoles={["estudiante"]}
            />
          }
        />

        {/* Formatos antiguos (si decides mantenerlos) */}
        <Route
          path="/formatos/Estancia1"
          element={
            <PrivateRoute
              element={<Estancia1 />}
              allowedRoles={["estudiante"]}
            />
          }
        />
        <Route
          path="/formatos/Estancia2"
          element={
            <PrivateRoute
              element={<Estancia2 />}
              allowedRoles={["estudiante"]}
            />
          }
        />
        <Route
          path="/formatos/Estadias"
          element={
            <PrivateRoute
              element={<Estadias />}
              allowedRoles={["estudiante"]}
            />
          }
        />
        <Route
          path="/formatos/ServicioSocial"
          element={
            <PrivateRoute
              element={<ServicioSocial />}
              allowedRoles={["estudiante"]}
            />
          }
        />
        <Route
          path="/formatos/EstadiasNacionales"
          element={
            <PrivateRoute
              element={<EstadiasNacionales />}
              allowedRoles={["estudiante"]}
            />
          }
        />

        {/* NUEVAS rutas reutilizadas con DocumentosView */}
        <Route
          path="/documentos/estancia1"
          element={
            <PrivateRoute
              element={<DocumentosView tipoProceso="Estancia I" />}
              allowedRoles={["estudiante"]}
            />
          }
        />
        <Route
          path="/documentos/estancia2"
          element={
            <PrivateRoute
              element={<DocumentosView tipoProceso="Estancia II" />}
              allowedRoles={["estudiante"]}
            />
          }
        />
        <Route
          path="/documentos/estadia"
          element={
            <PrivateRoute
              element={<DocumentosView tipoProceso="Estadía" />}
              allowedRoles={["estudiante"]}
            />
          }
        />
        <Route
          path="/documentos/servicio"
          element={
            <PrivateRoute
              element={<DocumentosView tipoProceso="Servicio Social" />}
              allowedRoles={["estudiante"]}
            />
          }
        />

        {/* Rutas protegidas para administrador */}

        <Route path="/inicioadmin" element={<PrivateRoute element={<Inicio />} allowedRoles={["administrador"]} />} />
        <Route path="/usuariosadmin" element={<PrivateRoute element={<Usuarios />} allowedRoles={["administrador"]} />} />
        <Route path="/registrosadmin" element={<PrivateRoute element={<Registros />} allowedRoles={["administrador"]} />} />
        <Route path="/formatosadmin" element={<PrivateRoute element={<Formatos />} allowedRoles={["administrador"]} />} />
        <Route path="/documentacionadmin" element={<PrivateRoute element={<Documentacion />} allowedRoles={["administrador"]} />} />
        <Route path="/periodosadmin" element={<PrivateRoute element={<Periodos />} allowedRoles={["administrador"]} />} />
        <Route path="/empresasadmin" element={<PrivateRoute element={<Empresas />} allowedRoles={["administrador"]} />} />
        <Route path="/perfiladmin" element={<PrivateRoute element={<PerfilAdmin />} allowedRoles={["administrador"]} />} />
        <Route path="/loginadmin" element={<PrivateRoute element={<Login />} allowedRoles={["administrador"]} />} />

        {/* Redirección por defecto */}

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <AnimatedRoutes />
    </AuthProvider>
  );
}

export default App;
