import React, { useRef } from 'react';
import useFormatos from '../hooks/useFormatos';
import { Upload, Download, Trash2 } from 'lucide-react';

const FormatosAdmin = () => {
  const fileInputRef = useRef(null);
  const {
    formatos,
    loading,
    error,
    success,
    tiposDocumentos,
    uploadFormato,
    downloadFormato,
    deleteFormato,
    getFileExtension,
    resetMessages
  } = useFormatos();

  const handleFileChange = async (e, nombreDocumento) => {
    if (e.target.files.length > 0) {
      try {
        await uploadFormato(nombreDocumento, e.target.files[0]);
      } catch (error) {
        console.error('Error al subir archivo:', error);
      }
      e.target.value = ''; // Resetear input
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Formatos</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Documento</th>
              <th className="py-2 px-4 border">Archivo</th>
              <th className="py-2 px-4 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {formatos.map((formato) => (
              <tr key={formato.nombre_documento} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{formato.nombre_documento}</td>
                <td className="py-2 px-4 border">
                  {formato.nombre_archivo ? (
                    <span className="flex items-center">
                      <span className="mr-2">
                        {getFileExtension(formato.nombre_archivo) === 'pdf' ? '📄' : '📝'}
                      </span>
                      {formato.nombre_archivo}
                    </span>
                  ) : (
                    <span className="text-gray-400">No subido</span>
                  )}
                </td>
                <td className="py-2 px-4 border">
                  <div className="flex space-x-2">
                    {formato.nombre_archivo && (
                      <>
                        <button
                          onClick={() => downloadFormato(formato.nombre_documento)}
                          className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          disabled={loading}
                        >
                          <Download size={16} className="mr-1" />
                          Descargar
                        </button>
                        <button
                          onClick={() => deleteFormato(formato.nombre_documento)}
                          className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          disabled={loading}
                        >
                          <Trash2 size={16} className="mr-1" />
                          Eliminar
                        </button>
                      </>
                    )}
                    <label className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 cursor-pointer">
                      <Upload size={16} className="mr-1" />
                      Subir
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, formato.nombre_documento)}
                        accept=".pdf,.doc,.docx"
                      />
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormatosAdmin;