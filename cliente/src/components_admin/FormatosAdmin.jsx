import React from 'react';
import { motion } from 'framer-motion';

// FormatsTable Component
const FormatsTable = () => {
  const documents = [
    { id: 1, name: 'Carta de presentación', filename: 'cronograma.pdf' },
    { id: 2, name: 'carta de aceptación', filename: 'f2.pdf' },
    { id: 3, name: 'cédula de registro', filename: 'f3.pdf' },
    { id: 4, name: 'definición de proyecto', filename: 'f4.pdf' },
    { id: 5, name: 'carta de liberación', filename: 'f5.pdf' },
    { id: 6, name: 'Guía de uso', filename: 'guiadeuso.pdf' },
    { id: 7, name: 'Reporte Mensual', filename: 'rp.pdf' }
  ];

  const handleFileSelect = (id) => {
    console.log('File selected for document id:', id);
  };

  const handleUpdate = (id) => {
    console.log('Update clicked for document id:', id);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">Gestión de Formatos</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Documento</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Formato</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre formato</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{doc.name}</td>
                <td className="px-6 py-4">
                  <button
                    className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                    onClick={() => console.log(`Downloading ${doc.filename}`)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{doc.filename}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm"
                    onClick={() => handleFileSelect(doc.id)}
                  >
                    Seleccionar archivo
                  </button>
                  <button
                    className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-md text-sm"
                    onClick={() => handleUpdate(doc.id)}
                  >
                    Actualizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <FormatsTable />
    </div>
  );
};

export default App;