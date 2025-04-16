import React, { useRef } from 'react';
import { Upload, Trash2, Download, MessageSquare } from 'lucide-react';
import useDocumentosEstudiante from '../components/hooks/useDocumentosEstudiante';

const TablaDocumentos = ({ tipoProceso, procesoId }) => {
  const fileInputRefs = useRef({});
  const {
    plantillas,
    documentos,
    loading,
    error,
    success,
    uploadDocumento,
    deleteDocumento,
    resetMessages,
  } = useDocumentosEstudiante(tipoProceso, procesoId);

  const handleUpload = (idTipoDoc) => async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadDocumento(idTipoDoc, file);
      if (fileInputRefs.current[idTipoDoc]) {
        fileInputRefs.current[idTipoDoc].value = '';
      }
    }
  };

  const getDocumentoSubido = (idTipoDoc) =>
    documentos.find((doc) => doc.id_tipo_doc === idTipoDoc);

  if (!procesoId && !loading) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          No tienes un proceso activo para el tipo "{tipoProceso}". Por favor, contacta al administrador.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={resetMessages} className="ml-2 text-red-900 underline">
            Cerrar
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
          <button onClick={resetMessages} className="ml-2 text-green-900 underline">
            Cerrar
          </button>
        </div>
      )}
      {loading && <div className="text-center text-gray-500">Cargando...</div>}
      {!loading && plantillas.length === 0 && (
        <div className="text-center text-gray-500">
          No hay plantillas disponibles.
        </div>
      )}
      {!loading && plantillas.length > 0 && (
        <table className="min-w-full bg-white border border-gray-200 rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Nombre del Documento</th>
              <th className="px-4 py-2">Plantilla</th>
              <th className="px-4 py-2">Mi Documento</th>
              <th className="px-4 py-2">Estatus</th>
              <th className="px-4 py-2">Feedback</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plantillas.map((p) => {
              const doc = getDocumentoSubido(p.id_tipo_doc);
              return (
                <tr key={p.id_plantilla} className="border-t">
                  <td className="px-4 py-2">{p.nombre_documento}</td>
                  <td className="px-4 py-2">
                    {p.nombre_archivo ? (
                      <a
                        href={`http://localhost:9999/api/documentosAdmin/download/${encodeURIComponent(
                          p.nombre_documento
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <Download size={16} className="mr-1" />
                        Descargar
                      </a>
                    ) : (
                      <span className="text-gray-500 italic">No disponible</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {doc ? (
                      <a
                        href={`http://localhost:9999${doc.ruta_archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline flex items-center"
                      >
                        <span className="mr-1">📄</span>
                        Ver archivo
                      </a>
                    ) : (
                      <span className="text-gray-500 italic">No subido</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {doc ? (
                      <span
                        className={`px-2 py-1 rounded ${
                          doc.estatus === 'Aprobado'
                            ? 'bg-green-100 text-green-800'
                            : doc.estatus === 'Rechazado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {doc.estatus}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {doc && doc.feedback ? (
                      <span className="flex items-center">
                        <MessageSquare size={16} className="mr-1" />
                        {doc.feedback}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <label
                      className={`cursor-pointer text-blue-700 hover:underline flex items-center ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload size={16} className="mr-1" />
                      Subir
                      <input
                        type="file"
                        className="hidden"
                        ref={(el) => (fileInputRefs.current[p.id_tipo_doc] = el)}
                        onChange={handleUpload(p.id_tipo_doc)}
                        accept=".pdf,.docx,.xlsx"
                        disabled={loading}
                      />
                    </label>
                    {doc && (
                      <button
                        onClick={() => deleteDocumento(doc.id_documento)}
                        className={`text-red-600 hover:underline flex items-center ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loading}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TablaDocumentos;