import { Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Botón móvil */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Barra lateral */}
      <aside
        className={`fixed w-64 bg-gradient-to-r from-orange-500 to-orange-600 text-white min-h-screen p-5 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-40`}
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
    <NavItem to="/inicio" label="Inicio" currentPath={location.pathname} onClick={handleNavigation} />
    <NavItem to="/usuarios" label="Usuarios" currentPath={location.pathname} onClick={handleNavigation} />
    <NavItem to="/empresas" label="Empresas" currentPath={location.pathname} onClick={handleNavigation} />
    <NavItem to="/periodos" label="Periodos" currentPath={location.pathname} onClick={handleNavigation} />
    <NavItem to="/formatos" label="Formatos" currentPath={location.pathname} onClick={handleNavigation} />
    <NavItem to="/registros" label="Registros" currentPath={location.pathname} onClick={handleNavigation} />
    <NavItem to="/perfil" label="Perfil" currentPath={location.pathname} onClick={handleNavigation} />
  </ul>
</nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 ml-0 md:ml-64">
        <Outlet />
      </main>
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

export default Sidebar;