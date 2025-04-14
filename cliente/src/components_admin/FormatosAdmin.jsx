import React, { useRef } from 'react';
import useFormatos from '../components/hooks/useFormatos';
import { Upload, Download, Trash2 } from 'lucide-react';
import Sidebar from '../components_admin/Sidebar'; // Asegúrate de tener este componente

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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenido principal */}
      <div className="flex-1 p-8">
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

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formatos.map((formato) => (
                <tr key={formato.nombre_documento} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formato.nombre_documento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formato.nombre_archivo ? (
                      <div className="flex items-center">
                        <span className="mr-2">
                          {getFileExtension(formato.nombre_archivo) === 'pdf' ? '📄' : '📝'}
                        </span>
                        <span>{formato.nombre_archivo}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No subido</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {formato.nombre_archivo && (
                        <>
                          <button
                            onClick={() => downloadFormato(formato.nombre_documento)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                          >
                            <Download size={14} className="mr-1" />
                            Descargar
                          </button>
                          <button
                            onClick={() => window.open(`http://localhost:9999/api/documentosAdmin/view/${encodeURIComponent(formato.nombre_documento)}`, '_blank')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                            disabled={loading}
                          >
                            👁️ Ver
                          </button>
                          <button
                            onClick={() => deleteFormato(formato.nombre_documento)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700"
                            disabled={loading}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Eliminar
                          </button>
                        </>
                      )}
                      <label className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <Upload size={14} className="mr-1" />
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
    </div>
  );
};

export default FormatosAdmin;