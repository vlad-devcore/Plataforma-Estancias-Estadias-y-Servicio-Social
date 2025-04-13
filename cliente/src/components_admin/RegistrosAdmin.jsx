import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Sidebar from '../components_admin/Sidebar';

const App = () => {
  // Datos falsos para poblar la tabla
  const data = [
    { matricula: '20210001', proceso: 'Inscripción', periodo: '2021-2', documentacion: 'Completada' },
    { matricula: '20210002', proceso: 'Inscripción', periodo: '2021-2', documentacion: 'Pendiente' },
    { matricula: '20210003', proceso: 'Evaluación', periodo: '2022-1', documentacion: 'Completada' },
    { matricula: '20210004', proceso: 'Inscripción', periodo: '2021-2', documentacion: 'Completada' },
    { matricula: '20210005', proceso: 'Evaluación', periodo: '2022-1', documentacion: 'Pendiente' },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item) => 
    item.matricula.includes(searchTerm) ||
    item.proceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.periodo.includes(searchTerm) ||
    item.documentacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800">
              Trayectoria del alumno
            </h2>
          </motion.div>

          {/* Search and Actions */}
          <div className="mb-6 relative">
            <motion.input
              initial={{ width: '80%', opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ duration: 0.5 }}
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>

          {/* Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6"
          >
            <div className="grid grid-cols-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-t-lg">
              <div>Matrícula</div>
              <div>Proceso</div>
              <div>Periodo</div>
              <div>Documentación</div>
            </div>

            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="grid grid-cols-4 p-4 border-b"
                >
                  <div>{item.matricula}</div>
                  <div>{item.proceso}</div>
                  <div>{item.periodo}</div>
                  <div>{item.documentacion}</div>
                </motion.div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No hay datos disponibles en la tabla
              </div>
            )}

            <div className="flex justify-between p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                Mostrando {filteredData.length} de {data.length} entradas
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200" disabled>
                  Anterior
                </button>
                <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200" disabled>
                  Siguiente
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default App;