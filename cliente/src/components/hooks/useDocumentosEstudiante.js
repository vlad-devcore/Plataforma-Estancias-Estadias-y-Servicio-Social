// src/components/hooks/useDocumentosEstudiante.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useDocumentosEstudiante = (tipoProceso) => {
  const [plantillas, setPlantillas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [procesoId, setProcesoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const tiposDocumentos = [
    'Carta de presentación',
    'Carta de aceptación',
    'Cédula de registro',
    'Definición de proyecto',
    'Carta de liberación',
    'Guía de uso',
    'Reporte Mensual',
  ];

  // Mapeo de nombres de documentos a IdTipoDoc (basado en la tabla tipo_documento)
  const tipoDocumentoMap = {
    'Carta de presentación': 1,
    'Carta de aceptación': 2,
    'Cédula de registro': 3,
    'Definición de proyecto': 4,
    'Carta de liberación': 5,
    'Guía de uso': 6,
    'Reporte Mensual': 7,
  };

  // Obtener el proceso del usuario
  const fetchProceso = async () => {
    if (!user?.id) {
      setError('Usuario no autenticado');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching procesos for user ${user.id}, tipoProceso: ${tipoProceso}`);
      const { data } = await axios.get(
        `http://localhost:9999/api/procesos/por-usuario/${user.id}`
      );
      console.log('Procesos recibidos:', data);

      const proceso = data.find((p) =>
        p.tipo_proceso.toLowerCase().includes(tipoProceso.toLowerCase().replace(/\s*[iI]+\s*$/, ''))
      );

      if (proceso) {
        console.log('Proceso encontrado:', proceso);
        setProcesoId(proceso.id_proceso);
      } else {
        console.log('No se encontró proceso para tipo:', tipoProceso);
        setError(`No se encontró un proceso para el tipo "${tipoProceso}"`);
      }
    } catch (err) {
      console.error('Error al obtener proceso:', err);
      setError(err.response?.data?.error || 'Error al obtener proceso');
    } finally {
      setLoading(false);
    }
  };

  // Obtener plantillas subidas por el admin
  const fetchPlantillas = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching plantillas');
      const response = await axios.get('http://localhost:9999/api/documentosAdmin');
      const data = response.data;
      console.log('Plantillas recibidas:', data);

      const combined = tiposDocumentos.map((tipo) => {
        const match = data.find((d) => d.nombre_documento === tipo);
        return {
          id_plantilla: match?.id || null,
          id_tipo_doc: tipoDocumentoMap[tipo] || null, // Usar IdTipoDoc de tipo_documento
          nombre_documento: tipo,
          nombre_archivo: match?.nombre_archivo || null,
        };
      });

      setPlantillas(combined);
    } catch (err) {
      console.error('Error al obtener plantillas:', err);
      setError(err.response?.data?.error || 'Error al obtener plantillas');
    } finally {
      setLoading(false);
    }
  };

  // Obtener documentos subidos por el estudiante
  const fetchDocumentos = async () => {
    if (!procesoId) {
      console.log('No hay procesoId, omitiendo fetchDocumentos');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching documentos for proceso ${procesoId}`);
      const { data } = await axios.get(`http://localhost:9999/api/documentos`);
      const docsFiltrados = data.filter(
        (doc) => doc.id_usuario === user.id && doc.id_proceso === procesoId
      );
      console.log('Documentos filtrados:', docsFiltrados);
      setDocumentos(docsFiltrados);
    } catch (err) {
      console.error('Error al obtener documentos:', err);
      setError(err.response?.data?.error || 'Error al obtener documentos subidos');
    } finally {
      setLoading(false);
    }
  };

  // Subir un documento
  const uploadDocumento = async (idTipoDoc, file) => {
    if (!file || !procesoId) {
      setError('No se seleccionó archivo o no hay proceso activo');
      return;
    }

    const allowedTypes = ['.pdf', '.docx', '.xlsx'];
    const fileExtension = `.${file.name.toLowerCase().split('.').pop()}`;

    if (!allowedTypes.includes(fileExtension)) {
      setError('Solo se permiten archivos PDF, Word (.docx) o Excel (.xlsx)');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('IdTipoDoc', idTipoDoc);
    formData.append('id_usuario', user.id);
    formData.append('Comentarios', '');
    formData.append('Estatus', 'Pendiente');
    formData.append('id_proceso', procesoId);

    try {
      console.log('Subiendo documento:', { idTipoDoc, id_usuario: user.id, id_proceso: procesoId });
      await axios.post('http://localhost:9999/api/documentos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Documento subido correctamente');
      await fetchDocumentos();
    } catch (err) {
      console.error('Error al subir documento:', err);
      setError(err.response?.data?.error || 'Error al subir documento');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un documento
  const deleteDocumento = async (idDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log(`Eliminando documento ${idDocumento}`);
      await axios.delete(`http://localhost:9999/api/documentos/${idDocumento}`);
      setSuccess('Documento eliminado correctamente');
      await fetchDocumentos();
    } catch (err) {
      console.error('Error al eliminar documento:', err);
      setError(err.response?.data?.error || 'Error al eliminar documento');
    } finally {
      setLoading(false);
    }
  };

  // Obtener extensión del archivo
  const getFileExtension = (filename) => {
    if (!filename) return null;
    return filename.split('.').pop().toLowerCase();
  };

  // Efectos para cargar datos iniciales
  useEffect(() => {
    fetchProceso();
  }, [tipoProceso, user?.id]);

  useEffect(() => {
    if (procesoId) {
      fetchPlantillas();
      fetchDocumentos();
    }
  }, [procesoId]);

  return {
    plantillas,
    documentos,
    procesoId,
    loading,
    error,
    success,
    uploadDocumento,
    deleteDocumento,
    getFileExtension,
    resetMessages: () => {
      setError(null);
      setSuccess(null);
    },
  };
};

export default useDocumentosEstudiante;