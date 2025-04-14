import { useState, useEffect } from 'react';
import axios from 'axios';

const useDocumentosAdmin = () => {
  const [documents, setDocuments] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({ estatus: '', idPeriodo: '' });

  // Obtener todos los periodos
  const fetchPeriodos = async () => {
    try {
      console.log('Fetching periodos');
      const { data } = await axios.get('http://localhost:9999/api/periodos');
      console.log('Periodos recibidos:', data);
      setPeriodos(data);
    } catch (err) {
      console.error('Error al obtener periodos:', err);
      setError(err.response?.data?.error || 'Error al obtener periodos');
    }
  };

  // Obtener todos los documentos con filtros
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching documents for admin with filters:', filters);
      const { data } = await axios.get('http://localhost:9999/api/documentos', {
        params: {
          estatus: filters.estatus || undefined,
          idPeriodo: filters.idPeriodo || undefined,
        },
      });
      console.log('Documentos recibidos:', data);
      setDocuments(data);
    } catch (err) {
      console.error('Error al obtener documentos:', err);
      setError(err.response?.data?.error || 'Error al obtener documentos');
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
      console.error('Error al aprobar documento:', err);
      setError(err.response?.data?.error || 'Error al aprobar documento');
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
      console.error('Error al rechazar documento:', err);
      setError(err.response?.data?.error || 'Error al rechazar documento');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Efecto para cargar periodos y documentos al montar
  useEffect(() => {
    fetchPeriodos();
    fetchDocuments();
  }, []);

  // Efecto para recargar documentos cuando cambian los filtros
  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  return {
    documents,
    periodos,
    loading,
    error,
    success,
    approveDocument,
    rejectDocument,
    updateFilters,
    resetMessages: () => {
      setError(null);
      setSuccess(null);
    },
  };
};

export default useDocumentosAdmin;