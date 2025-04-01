import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';


// Companies Directory Component
const CompaniesDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const companies = [
    {
      rfc: '123',
      name: 'Universidad Politécnica de Quintana Roo'
    }
  ];

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log('Archivo seleccionado:', selectedFile);
    }
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-12">Directorio de empresas</h1>
      
      <div className="flex justify-end mb-6">
        <div className="flex items-center">
          <span className="mr-2">Search:</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-1 w-64"
          />
        </div>
      </div>

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
            {companies.map((company) => (
              <tr key={company.rfc} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{company.rfc}</td>
                <td className="px-4 py-3">{company.name}</td>
                <td className="px-4 py-3">
                  <button className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    Ver datos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span>Showing 1 to 1 of 1 entries</span>
        <div className="flex gap-2">
          <button 
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            Previous
          </button>
          <button className="px-3 py-1 border rounded bg-gray-100">1</button>
          <button 
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={true}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">Subir Empresas (Multiples)</h2>
        <div className="max-w-xl mx-auto">
          <div className="mb-4">
            <p className="mb-2">Archivo csv</p>
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
  );
};

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <CompaniesDirectory />
      </main>
    </div>
  );
};

export default App;