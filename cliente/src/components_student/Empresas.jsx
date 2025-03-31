  import React, { useState } from 'react';
  import { useNavigate, useLocation } from 'react-router-dom';
  import { motion, AnimatePresence } from 'framer-motion';
  import { Search, Building2, MapPin, Users, ExternalLink, Menu, X, Eye } from 'lucide-react';

  //esos datos de emepresas son solo para que se vea algo en pantalla aqui debe ir la logica para que se vea lo que esta en la base de datos
  const companiesData = [
    {
      id: 0,
      rfc: "AAA123456ABC",
      name: "Universidad Politecnica de Quintana Roo",
      industry: "Educación",
      location: "Cancún",
      employees: "100-250",
      email: "Universidad Politecnica de Quintana Roo",
      address: "Av. Kabah 123, Cancún",
      website: "www.upqroo.edu.mx",
      phone: "(998) 1234-5678",
      companyType: "Pública",
      size: "Mediana"
    },
    {
      id: 1,
      rfc: "ABC123456XYZ",
      name: "Innovatech Solutions",
      industry: "Tecnología",
      location: "Ciudad de México",
      employees: "250-500",
     email: "contacto@innovatech.com",
      address: "Av. Reforma 123, CDMX",
      website: "www.innovatech.com",
      phone: "(55) 1234-5678",
      companyType: "Privada",
      size: "Mediana"
    },
    {
      id: 2,
      rfc: "DEF789012UVW",
      name: "Construmex",
      industry: "Construcción",
      location: "Monterrey",
      employees: "1000+",
      email: "info@construmex.com",
      address: "Blvd. Industrial 456, Monterrey",
      website: "www.construmex.com",
      phone: "(81) 8765-4321",
      companyType: "Privada",
      size: "Grande"
    },
    {
      id: 3,
      rfc: "GHI345678RST",
      name: "EcoVerde",
      industry: "Agricultura",
      location: "Guadalajara",
      employees: "100-250",
      email: "contacto@ecoverde.com",
      address: "Camino Real 789, Guadalajara",
      website: "www.ecoverde.com",
      phone: "(33) 3456-7890",
      companyType: "Privada",
      size: "Mediana"
    }
  ];

  // NavLink Component
  const NavLink = ({ text, path, currentPath, onClick, isMobile = false }) => {
    const isActive = currentPath === path;
    
    return (
      <motion.a
        onClick={onClick}
        whileHover={{ scale: isMobile ? 1 : 1.05 }}
        className={`relative cursor-pointer transition-all duration-300 ${isMobile ? 'block w-full px-4 py-3 text-white hover:bg-white/20' : 'px-4 py-2 group'}`}
      >
        <span className={`relative z-10 ${isMobile ? isActive ? 'text-white font-medium' : 'text-white/90' : 'text-white/90 group-hover:text-white transition-colors'}`}>
          {text}
        </span>
        {!isMobile && (
          <motion.div className={`absolute inset-0 ${isActive ? 'bg-white/20' : 'bg-white/10'} rounded-lg`} initial={false} animate={{ scale: isActive ? 1 : 1 }} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} />
        )}
        {isMobile && isActive && (
          <motion.div className="absolute inset-0 bg-white/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} />
        )}
      </motion.a>
    );
  };

  // MobileMenu Component
  const MobileMenu = ({ isOpen, onClose, navigation, currentPath }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-y-0 right-0 w-64 bg-orange-600 shadow-xl z-50"
        >
          <div className="flex justify-end p-4">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-white">
              <X className="h-6 w-6" />
            </motion.button>
          </div>
          <div className="flex flex-col">
            {navigation.map((item) => (
              <NavLink key={item.text} text={item.text} path={item.path} currentPath={currentPath} onClick={() => { item.onClick(); onClose(); }} isMobile />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Modal Component
  const Modal = ({ company, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }} className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 break-words">{company.name}</h2>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">RFC</span>
            <span className="font-medium text-sm md:text-base">{company.rfc}</span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">Correo Electrónico</span>
            <span className="font-medium text-sm md:text-base break-words">{company.email}</span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">Dirección</span>
            <span className="font-medium text-sm md:text-base break-words">{company.address}</span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">Sitio Web</span>
            <span className="font-medium text-sm md:text-base break-words">
              <a href={company.website} className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {company.website}
              </a>
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">Número de Teléfono</span>
            <span className="font-medium text-sm md:text-base">{company.phone}</span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">Industria</span>
            <span className="font-medium text-sm md:text-base">{company.industry}</span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">Ubicación</span>
            <span className="font-medium text-sm md:text-base">{company.location}</span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">Empleados</span>
            <span className="font-medium text-sm md:text-base">{company.employees}</span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">Tipo de Empresa</span>
            <span className="font-medium text-sm md:text-base">{company.companyType}</span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-gray-600 text-sm md:text-base">Tamaño de Empresa</span>
            <span className="font-medium text-sm md:text-base">{company.size}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-600 text-sm md:text-base">Descripción</span>
            <p className="text-sm md:text-base">{company.description}</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="mt-6 w-full md:w-auto bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 text-sm md:text-base">
          Cerrar
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // Main Component
  export default function Empresas() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('Todas');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigation = [
      { text: "Inicio", path: '/home', onClick: () => handleNavigation('/home') },
      { text: "Empresas", path: '/empresas', onClick: () => handleNavigation('/empresas') },
      { text: "Perfil", path: '/perfil', onClick: () => handleNavigation('/perfil') },
      { text: "Cerrar Sesión", path: '/', onClick: () => handleNavigation('/') }
    ];

    const handleNavigation = (path) => {
      document.body.style.opacity = '0';
      setTimeout(() => {
        navigate(path);
        document.body.style.opacity = '1';
      }, 200);
    };

    const industries = ['Todas', ...new Set(companiesData.map(company => company.industry))];

    const filteredCompanies = companiesData.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) || company.rfc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'Todas' || company.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });

    const openModal = (company) => setSelectedCompany(company);
    const closeModal = () => setSelectedCompany(null);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Navigation */}
        <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-4">
                <img src="/logo192.png" alt="Logo" className="h-16 sm:h-20 w-auto" />
              </motion.div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-2">
                {navigation.map((item) => (
                  <NavLink key={item.text} text={item.text} path={item.path} currentPath={location.pathname} onClick={item.onClick} />
                ))}
              </div>

              {/* Mobile Menu Button */}
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsMenuOpen(true)} className="md:hidden text-white">
                <Menu className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} navigation={navigation} currentPath={location.pathname} />

        {/* Main Content */}
        <motion.main initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Directorio de Empresas</h1>
          </div>

          <div className="mb-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o RFC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
              />
            </div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Company List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map(company => (
              <div
                key={company.id}
                onClick={() => openModal(company)}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="font-semibold text-lg text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-600">{company.industry}</p>
                <p className="text-sm text-gray-600">{company.location}</p>
              </div>
            ))}
          </div>

          {/* Modal */}
          {selectedCompany && <Modal company={selectedCompany} onClose={closeModal} />}
        </motion.main>
      </div>
    );
  }
