import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProgramaEducativoForm from './components/estudiante/ProgramaEducativoForm';
import Login from './components_student/Login'; 
import Home from './components_student/Home';
import EmpresasS from './components_student/Empresas';
import PerfilStudent from './components_student/Perfil';
import Estancia1 from './components_student/formatos/Estancia1';
import Estancia2 from './components_student/formatos/Estancia2';
import Estadias from './components_student/formatos/Estadias';
import ServicioSocial from './components_student/formatos/ServicioSocial';
import EstadiasNacionales from './components_student/formatos/EstadiasNacionales';
import Inicio from './components_admin/InicioAdmin';
import Usuarios from './components_admin/UsuariosAdmin';
import Registros from './components_admin/RegistrosAdmin';
import Formatos from './components_admin/FormatosAdmin';
import Documentacion from './components_admin/DocumentacionAdmin';
import Empresas from './components_admin/EmpresasAdmin';
import PerfilAdmin from './components_admin/PerfilAdmin';
import Periodos from './components_admin/PeriodosAdmin';
import Unauthorized from './components/Unauthorized';
import Logout from './components_admin/Logout';
import PrivateRoute from './components/PrivateRoute';

// Componente para manejar la redirección en la raíz
const RootRedirect = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'estudiante' ? '/home' : '/inicioadmin'} replace />;
  }
  return <Login />;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rutas públicas */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/logout" element={<Logout />} />

        {/* Rutas protegidas para estudiantes */}
        <Route
          path="/estudiante/programa"
          element={<PrivateRoute element={<ProgramaEducativoForm />} allowedRoles={['estudiante']} />}
        />
        <Route
          path="/home"
          element={<PrivateRoute element={<Home />} allowedRoles={['estudiante']} />}
        />
        <Route
          path="/empresas"
          element={<PrivateRoute element={<EmpresasS />} allowedRoles={['estudiante']} />}
        />
        <Route
          path="/perfil"
          element={<PrivateRoute element={<PerfilStudent />} allowedRoles={['estudiante']} />}
        />
        <Route
          path="/formatos/Estancia1"
          element={<PrivateRoute element={<Estancia1 />} allowedRoles={['estudiante']} />}
        />
        <Route
          path="/formatos/Estancia2"
          element={<PrivateRoute element={<Estancia2 />} allowedRoles={['estudiante']} />}
        />
        <Route
          path="/formatos/Estadias"
          element={<PrivateRoute element={<Estadias />} allowedRoles={['estudiante']} />}
        />
        <Route
          path="/formatos/ServicioSocial"
          element={<PrivateRoute element={<ServicioSocial />} allowedRoles={['estudiante']} />}
        />
        <Route
          path="/formatos/EstadiasNacionales"
          element={<PrivateRoute element={<EstadiasNacionales />} allowedRoles={['estudiante']} />}
        />

        {/* Rutas protegidas para administrador */}
        <Route
          path="/inicioadmin"
          element={<PrivateRoute element={<Inicio />} allowedRoles={['administrador']} />}
        />
        <Route
          path="/usuariosadmin"
          element={<PrivateRoute element={<Usuarios />} allowedRoles={['administrador']} />}
        />
        <Route
          path="/registrosadmin"
          element={<PrivateRoute element={<Registros />} allowedRoles={['administrador']} />}
        />
        <Route
          path="/formatosadmin"
          element={<PrivateRoute element={<Formatos />} allowedRoles={['administrador']} />}
        />
        <Route
          path="/documentacionadmin"
          element={<PrivateRoute element={<Documentacion />} allowedRoles={['administrador']} />}
        />
        <Route
          path="/periodosadmin"
          element={<PrivateRoute element={<Periodos />} allowedRoles={['administrador']} />}
        />
        <Route
          path="/empresasadmin"
          element={<PrivateRoute element={<Empresas />} allowedRoles={['administrador']} />}
        />
        <Route
          path="/perfiladmin"
          element={<PrivateRoute element={<PerfilAdmin />} allowedRoles={['administrador']} />}
        />
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