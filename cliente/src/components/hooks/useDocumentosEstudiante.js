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

  const tipoDocumentoMap = {
    'Carta de presentación': 1,
    'Carta de aceptación': 2,
    'Cédula de registro': 3,
    'Definición de proyecto': 4,
    'Carta de liberación': 5,
    'Guía de uso': 6,
    'Reporte Mensual': 7,
  };

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
          IdTipoDoc: tipoDocumentoMap[tipo] || null,
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

  const fetchDocumentos = async () => {
    if (!procesoId || !user?.id) {
      console.log('No hay procesoId o id_usuario, omitiendo fetchDocumentos');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching documentos for proceso ${procesoId}, usuario ${user.id}`);
      const { data } = await axios.get(`http://localhost:9999/api/documentos`, {
        params: { id_proceso: procesoId, id_usuario: user.id }
      });
      console.log('Documentos recibidos:', data);
      setDocumentos(data);
    } catch (err) {
      console.error('Error al obtener documentos:', err);
      setError(err.response?.data?.error || 'Error al obtener documentos subidos');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocumento = async (idTipoDoc, file) => {
    if (!file || !procesoId || !user?.id) {
      setError('No se seleccionó archivo, no hay proceso activo o usuario no autenticado');
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
      console.log('Subiendo documento:', { IdTipoDoc: idTipoDoc, id_usuario: user.id, id_proceso: procesoId });
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

  const getFileExtension = (filename) => {
    if (!filename) return null;
    return filename.split('.').pop().toLowerCase();
  };

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