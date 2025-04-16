import React, { useState } from 'react';

const ModalRegistro = ({ onClose }) => {
  const [formData, setFormData] = useState({
    empresa: '',
    periodo: '',
    tipoProceso: '',
    
    // otros campos necesarios para el registro
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes hacer la llamada a la API o guardar en el localStorage
    onClose(); // Cierra el modal y marca al estudiante como registrado
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-11/12 sm:w-96">
        <h3 className="text-lg font-semibold mb-4">Registrar Proceso</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Empresa</label>
            <input
              type="text"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Periodo</label>
            <input
              type="text"
              value={formData.periodo}
              onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Proceso</label>
            <input
              type="text"
              value={formData.tipoProceso}
              onChange={(e) => setFormData({ ...formData, tipoProceso: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalRegistro;
        