import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleNavigation = () => {
    if (onNavigate) onNavigate();
  };

  const handleLogout = () => {
    logout();
    handleNavigation();
    navigate('/login', { replace: true });
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    handleLogout();
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Botón de toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Barra lateral */}
      <aside
        className={`fixed w-64 bg-gradient-to-r from-orange-500 to-orange-600 text-white min-h-screen p-5 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } z-40`}
      >
        {/* Logo */}
        <motion.img 
          src="/logo192.png" 
          alt="Logo" 
          className="h-20 w-auto mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Menú */}
        <nav>
          <ul className="space-y-2">
            <NavItem to="/inicioadmin" label="Inicio" currentPath={location.pathname} onClick={handleNavigation} />
            <NavItem to="/usuariosadmin" label="Usuarios" currentPath={location.pathname} onClick={handleNavigation} />
            <NavItem to="/empresasadmin" label="Empresas" currentPath={location.pathname} onClick={handleNavigation} />
            <NavItem to="/periodosadmin" label="Periodos" currentPath={location.pathname} onClick={handleNavigation} />
            <NavItem to="/formatosadmin" label="Formatos" currentPath={location.pathname} onClick={handleNavigation} />
            <NavItem to="/Documentacionadmin" label="Documentacion" currentPath={location.pathname} onClick={handleNavigation} />
            <NavItem to="/perfiladmin" label="Perfil" currentPath={location.pathname} onClick={handleNavigation} />
            <li>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsLogoutModalOpen(true)}
                className="block w-full text-left py-3 px-4 rounded-md hover:bg-white/10"
              >
                Cerrar Sesión
              </motion.button>
            </li>
          </ul>
        </nav>  
      </aside>

      {/* Contenido principal */}
      <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
        <Outlet />
      </main>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </div>
  );
};

const NavItem = ({ to, label, currentPath, onClick }) => {
  const isActive = currentPath.startsWith(to);

  return (
    <motion.li whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
      <Link
        to={to}
        onClick={onClick}
        className={`block py-3 px-4 rounded-md relative ${isActive ? "bg-white/10" : "hover:bg-white/10"}`}
      >
        <span className="relative z-10">{label}</span>
        {isActive && (
          <motion.div
            className="absolute top-0 left-0 h-full w-1 bg-white rounded-r-md"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.li>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmar Cierre de Sesión</h2>
          <p className="text-gray-600 mb-6">¿Estás seguro de que deseas cerrar tu sesión?</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Sidebar;