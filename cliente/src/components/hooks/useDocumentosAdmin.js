import { useState, useEffect } from 'react';
import axios from 'axios';

const useDocumentosAdmin = () => {
  const [documents, setDocuments] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [programasEducativos, setProgramasEducativos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    estatus: '',
    idPeriodo: '',
    idTipoDoc: '',
    programaEducativo: ''
  });

  // Obtener todos los periodos
  const fetchPeriodos = async () => {
    try {
      console.log('Fetching periodos from http://localhost:9999/api/documentos/periodos');
      const { data } = await axios.get('http://localhost:9999/api/documentos/periodos');
      console.log('Periodos recibidos:', data);
      setPeriodos(data);
      if (data.length === 0) {
        setError('No se encontraron periodos');
      }
    } catch (err) {
      console.error('Error al obtener periodos:', err.message, err.response?.status);
      setError(err.response?.status === 404 ? 'Endpoint de periodos no encontrado (verifica documentos.js)' : 'Error al obtener periodos');
    }
  };

  // Obtener tipos de documentos
  const fetchTiposDocumento = async () => {
    try {
      console.log('Fetching tipos de documento from http://localhost:9999/api/documentos/tipo_documento');
      const { data } = await axios.get('http://localhost:9999/api/documentos/tipo_documento');
      console.log('Tipos de documento recibidos:', data);
      setTiposDocumento(data);
      if (data.length === 0) {
        setError('No se encontraron tipos de documento');
      }
    } catch (err) {
      console.error('Error al obtener tipos de documento:', err.message, err.response?.status);
      setError(err.response?.status === 404 ? 'Endpoint de tipos de documento no encontrado (verifica documentos.js)' : 'Error al obtener tipos de documento');
    }
  };

  // Obtener programas educativos
  const fetchProgramasEducativos = async () => {
    try {
      console.log('Fetching programas educativos from http://localhost:9999/api/documentos/programas_educativos');
      const { data } = await axios.get('http://localhost:9999/api/documentos/programas_educativos');
      console.log('Programas educativos recibidos:', data);
      setProgramasEducativos(data);
      if (data.length === 0) {
        setError('No se encontraron programas educativos');
      }
    } catch (err) {
      console.error('Error al obtener programas educativos:', err.message, err.response?.status);
      setError(err.response?.status === 404 ? 'Endpoint de programas educativos no encontrado (verifica documentos.js)' : 'Error al obtener programas educativos');
    }
  };

  // Obtener todos los documentos con filtros
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching documents for admin with filters:', filters);
      const params = {
        estatus: filters.estatus || undefined,
        idPeriodo: filters.idPeriodo ? Number(filters.idPeriodo) : undefined,
        idTipoDoc: filters.idTipoDoc ? Number(filters.idTipoDoc) : undefined,
        programaEducativo: filters.programaEducativo || undefined
      };
      console.log('Parámetros enviados al backend:', params);
      const { data } = await axios.get('http://localhost:9999/api/documentos', { params });
      console.log('Documentos recibidos:', data);
      setDocuments(data);
    } catch (err) {
      console.error('Error al obtener documentos:', err.message, err.response?.status);
      setError(err.response?.status === 404 ? 'Endpoint de documentos no encontrado (verifica documentos.js)' : 'Error al obtener documentos');
    } finally {
      setLoading(false);
    }
  };

  // Aprobar documento
  const approveDocument = async (idDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log(`Aprobando documento ${idDocumento}`);
      await axios.put(`http://localhost:9999/api/documentos/approve/${idDocumento}`);
      setSuccess('Documento aprobado correctamente');
      await fetchDocuments();
    } catch (err) {
      console.error('Error al aprobar documento:', err.message, err.response?.status);
      setError(err.response?.status === 404 ? 'Endpoint de aprobación no encontrado (verifica documentos.js)' : 'Error al aprobar documento');
    } finally {
      setLoading(false);
    }
  };

  // Rechazar documento
  const rejectDocument = async (idDocumento, comentarios) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log(`Rechazando documento ${idDocumento} con comentarios: ${comentarios}`);
      await axios.put(`http://localhost:9999/api/documentos/reject/${idDocumento}`, { comentarios });
      setSuccess('Documento rechazado correctamente');
      await fetchDocuments();
    } catch (err) {
      console.error('Error al rechazar documento:', err.message, err.response?.status);
      setError(err.response?.status === 404 ? 'Endpoint de rechazo no encontrado (verifica documentos.js)' : 'Error al rechazar documento');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    console.log('Actualizando filtros:', newFilters);
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Efecto para cargar periodos, tipos de documento, programas educativos y documentos al montar
  useEffect(() => {
    fetchPeriodos();
    fetchTiposDocumento();
    fetchProgramasEducativos();
    fetchDocuments();
  }, []);

  // Efecto para recargar documentos cuando cambian los filtros
  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  return {
    documents,
    periodos,
    tiposDocumento,
    programasEducativos,
    loading,
    error,
    success,
    filters,
    updateFilters,
    approveDocument,
    rejectDocument,
    resetMessages: () => {
      setError(null);
      setSuccess(null);
    }
  };
};

export default useDocumentosAdmin;