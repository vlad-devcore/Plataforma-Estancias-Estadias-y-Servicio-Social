import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react"; // Importamos íconos para el menú móvil
import { useState } from "react"; // Necesario para manejar el estado del menú móvil

const Dashboard = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para controlar el menú móvil

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Botón para abrir el menú en móviles */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg md:hidden"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 bg-gradient-to-r from-orange-500 to-orange-600 text-white min-h-screen p-5 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-40`}
      >
        {/* Logo con animación */}
        <motion.img src="/logo192.png" alt="Logo" className="h-20 w-auto" />

        <ul className="mt-8 space-y-4">
          <NavItem
            to="/admin/inicio"
            label="Inicio"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <NavItem
            to="/admin/usuarios"
            label="Usuarios"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <NavItem
            to="/admin/empresas"
            label="Empresas"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <NavItem
            to="/admin/periodos"
            label="Periodos"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <NavItem
            to="/admin/formatos"
            label="Formatos"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <NavItem
            to="/admin/registros"
            label="Registros"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <NavItem
            to="/admin/perfil"
            label="Perfil"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </ul>

        {/* Efecto de conexión visual */}
        <motion.div
          className="absolute top-0 right-0 w-1 bg-white"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </aside>

      {/* Contenido Principal con Transiciones */}
      <main className="flex-1 p-6 relative">
        {/* Resaltado que sobresale desde el menú */}
        <AnimatePresence>
          {location.pathname && (
            <motion.div
              key={location.pathname}
              className="absolute left-0 top-0 h-full w-1 bg-white"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Contenido de la vista */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet /> {/* Aquí se renderizan las vistas hijas */}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const NavItem = ({ to, label, currentPath, onClick }) => {
  const isActive = currentPath === to;

  return (
    <motion.li
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`py-3 px-4 rounded-md relative ${
        isActive ? "bg-white/10" : "hover:bg-white/10"
      }`}
    >
      <Link to={to} className="block" onClick={onClick}>
        {label}
      </Link>

      {/* Efecto de resaltado activo */}
      {isActive && (
        <motion.div
          className="absolute top-0 left-0 h-full w-1 bg-white"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.li>
  );
};

export default Dashboard;
