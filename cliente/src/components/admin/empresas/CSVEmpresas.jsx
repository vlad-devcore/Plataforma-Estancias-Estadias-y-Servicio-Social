import { useState } from 'react';
import { Upload } from 'lucide-react';

const CSVEmpresas = ({ onSubmit, onCancel }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Por favor, selecciona un archivo CSV válido.');
      setFile(null);
    } else {
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Debes seleccionar un archivo CSV.');
      return;
    }
    onSubmit({ file });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar archivo CSV
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <p className="mt-2 text-sm text-gray-500">
            El archivo CSV debe contener las columnas: <strong>empresa_rfc</strong>, <strong>empresa_nombre</strong>, empresa_direccion, empresa_email, empresa_telefono, <strong>empresa_tamano</strong>, <strong>empresa_sociedad</strong>, empresa_pagina_web.<br />
            - <strong>Campos obligatorios</strong>: empresa_rfc (12-13 caracteres alfanuméricos, ej. NUE123456XYZ), empresa_nombre, empresa_tamano (Grande, Mediana, Pequeña), empresa_sociedad (Privada, Pública).<br />
            - <strong>empresa_email</strong>: Debe ser válido (ej. nombre@dominio.com) o estar vacío.<br />
            - Cada empresa_rfc debe ser único y no estar registrado previamente.
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!file}
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Upload size={18} className="mr-1" />
            Importar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CSVEmpresas;