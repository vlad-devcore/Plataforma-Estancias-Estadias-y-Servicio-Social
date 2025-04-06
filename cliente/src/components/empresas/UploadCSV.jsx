import React, { useState } from 'react';
import { Upload } from 'react-feather';

const UploadCSV = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">Subir Empresas (CSV)</h2>
      <div className="flex gap-4 items-center">
        <button
          onClick={() => document.getElementById('csvInput').click()}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
        >
          <Upload size={18} />
          Seleccionar archivo
        </button>
        <input
          id="csvInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
        />
        <span className="flex-1 truncate">
          {selectedFile?.name || 'Ningún archivo seleccionado'}
        </span>
        <button
          onClick={handleUpload}
          className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          disabled={!selectedFile}
        >
          Cargar CSV
        </button>
      </div>
    </div>
  );
};

export default UploadCSV;