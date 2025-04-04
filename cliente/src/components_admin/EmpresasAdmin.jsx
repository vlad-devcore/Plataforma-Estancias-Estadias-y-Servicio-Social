import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompaniesDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [companies, setCompanies] = useState([]); // Ahora almacena empresas desde el backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
        try {
            const response = await axios.get('http://localhost:9999/api/empresas');
            console.log("Empresas recibidas:", response.data); // 👀 Verifica qué datos llegan
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


  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log('Archivo seleccionado:', selectedFile);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <main className="flex-1">
        <div className="px-4 py-8 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-12">Directorio de empresas</h1>

          <div className="flex justify-end mb-6">
            <div className="flex items-center">
              <span className="mr-2">Buscar:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-3 py-1 w-64"
                placeholder="Buscar por nombre o RFC..."
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-600">Cargando empresas...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-orange-500 text-white">
                    <th className="px-4 py-2 text-left w-32">RFC</th>
                    <th className="px-4 py-2 text-left">Nombre de la empresa o institución</th>
                    <th className="px-4 py-2 text-right w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-gray-600">
                        No hay empresas registradas.
                      </td>
                    </tr>
                  ) : (
                    companies
                      .filter(
                        (company) =>
                          (company.name && company.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (company.rfc && company.rfc.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((company) => (
                        <tr key={company.rfc} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{company.empresa_rfc}</td>
                          <td className="px-4 py-3">{company.empresa_nombre}</td>
                          <td className="px-4 py-3">
                            <button className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                              Ver datos
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8">Subir Empresas (Multiples)</h2>
            <div className="max-w-xl mx-auto">
              <div className="mb-4">
                <p className="mb-2">Archivo CSV</p>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => document.getElementById('fileInput').click()}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Seleccionar archivo
                  </button>
                  <input
                    id="fileInput"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <span>{selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}</span>
                  <button
                    onClick={handleUpload}
                    className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors ml-auto"
                    disabled={!selectedFile}
                  >
                    Agregar masivamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompaniesDirectory;
