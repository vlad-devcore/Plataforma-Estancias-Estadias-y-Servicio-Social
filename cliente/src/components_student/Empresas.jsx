import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';
import Header from './HeaderEstudiante';

// Modal Component (sin cambios)
const Modal = ({ company, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 break-words">{company.empresa_nombre}</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900">RFC:</h3>
          <p className="text-gray-600">{company.empresa_rfc}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900">Dirección:</h3>
          <p className="text-gray-600">{company.empresa_direccion || 'No especificado'}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900">Email:</h3>
          <p className="text-gray-600">{company.empresa_email || 'No especificado'}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900">Teléfono:</h3>
          <p className="text-gray-600">{company.empresa_telefono || 'No especificado'}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900">Tamaño:</h3>
          <p className="text-gray-600">{company.empresa_tamano}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900">Sociedad:</h3>
          <p className="text-gray-600">{company.empresa_sociedad}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900">Página Web:</h3>
          <p className="text-gray-600">
            {company.empresa_pagina_web ? (
              <a href={company.empresa_pagina_web} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                {company.empresa_pagina_web}
              </a>
            ) : 'No especificado'}
          </p>
        </div>
      </div>
      
      <button 
        onClick={onClose} 
        className="mt-6 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
      >
        Cerrar
      </button>
    </div>
  </div>
);

// Main Component
export default function Empresas() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('Todas');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 48;

  // Obtener las empresas desde el backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get('http://localhost:9999/api/empresas', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!Array.isArray(response.data)) {
          throw new Error('Formato de respuesta inválido: se esperaba un arreglo de empresas');
        }
        setCompanies(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener empresas:', error);
        setError('Error al cargar las empresas. Por favor, intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Obtener industrias únicas para el filtro
  const industries = ['Todas', ...new Set(companies.map(company => company.empresa_sociedad))];

  // Filtrar empresas
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      (company.empresa_nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (company.empresa_rfc?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'Todas' || company.empresa_sociedad === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  // Calcular paginación
  const totalCompanies = filteredCompanies.length;
  const totalPages = Math.ceil(totalCompanies / companiesPerPage);
  const startIndex = (currentPage - 1) * companiesPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + companiesPerPage);

  // Cambiar página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Volver arriba al cambiar página
    }
  };

  // Generar números de página
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const openModal = (company) => setSelectedCompany(company);
  const closeModal = () => setSelectedCompany(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex justify-center">
          <div className="text-gray-600">Cargando empresas...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex justify-center">
          <div className="text-red-600">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
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
        {paginatedCompanies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No se encontraron empresas que coincidan con los criterios de búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedCompanies.map(company => (
                <div
                  key={company.id_empresa}
                  onClick={() => openModal(company)}
                  className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
                >
                  <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-2 truncate">{company.empresa_nombre}</h3>
                  <p className="text-sm text-gray-600 mb-1 flex-1">
                    <span className="font-medium">Dirección:</span>{' '}
                    <span className="break-words">{company.empresa_direccion || 'No especificado'}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1 flex-1">
                    <span className="font-medium">Email:</span>{' '}
                    <span className="break-words">{company.empresa_email || 'No especificado'}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex-1">
                    <span className="font-medium">Teléfono:</span>{' '}
                    <span className="break-words">{company.empresa_telefono || 'No especificado'}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Anterior
                </button>
                <div className="flex space-x-2">
                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
            <div className="mt-4 text-sm text-gray-500 text-center">
              Mostrando {paginatedCompanies.length} de {totalCompanies} empresas
            </div>
          </>
        )}

        {/* Modal */}
        {selectedCompany && <Modal company={selectedCompany} onClose={closeModal} />}
      </main>
    </div>
  );
}