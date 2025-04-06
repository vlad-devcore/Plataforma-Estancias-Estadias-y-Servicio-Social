import React from 'react';

const ViewEmpresaModal = ({ empresa, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h3 className="text-2xl font-bold mb-4 text-orange-600">Detalles de la Empresa</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="RFC" value={empresa?.empresa_rfc} />
          <DetailItem label="Nombre" value={empresa?.empresa_nombre} />
          <DetailItem label="Dirección" value={empresa?.empresa_direccion} />
          <DetailItem label="Email" value={empresa?.empresa_email} />
          <DetailItem label="Teléfono" value={empresa?.empresa_telefono} />
          <DetailItem label="Tamaño" value={empresa?.empresa_tamano} />
          <DetailItem label="Sociedad" value={empresa?.empresa_sociedad} />
          <DetailItem label="Página Web" value={empresa?.empresa_pagina_web} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    <p className="mt-1 text-gray-900">{value || 'N/A'}</p>
  </div>
);

export default ViewEmpresaModal;