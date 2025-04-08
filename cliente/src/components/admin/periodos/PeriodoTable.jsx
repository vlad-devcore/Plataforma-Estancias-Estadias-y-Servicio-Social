// src/components/PeriodosTable.tsx
import React from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";

const PeriodosTable = ({ periodos, loading, error, onEdit, onDelete }) => {
  if (loading) return <div className="text-center py-8">Cargando periodos...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!periodos.length) return <div className="text-center py-8">No hay periodos registrados</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Año</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Inicio</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Fin</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fase</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {periodos.map((periodo, index) => (
            <motion.tr
              key={periodo.IdPeriodo}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{periodo.Año}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{periodo.FechaInicio}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{periodo.FechaFin}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{periodo.EstadoActivo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{periodo.Fase}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(periodo)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none"
                  >
                    <Edit2 size={14} className="mr-1" />
                    Editar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(periodo.IdPeriodo)}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Eliminar
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PeriodosTable;
