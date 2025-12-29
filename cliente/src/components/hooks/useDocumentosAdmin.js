// ============================================================================
// 📦 hooks/useDocumentosAdmin.js - VERSIÓN PRODUCTION-SAFE ✅ CORREGIDA
// ============================================================================
import { useState, useEffect } from "react";
import api from "../../axiosConfig"; // ✅ CORREGIDO: Era "../axiosConfig" (INCORRECTO)

/**
 * ✅ PRODUCTION-SAFE HOOK
 * - Usa instancia api configurada (con interceptores)
 * - Rutas relativas que funcionan en dev y producción
 * - Manejo robusto de errores
 * - Compatible con baseURL en axiosConfig
 */
const useDocumentosAdmin = () => {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [programasEducativos, setProgramasEducativos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    estatus: "",
    idPeriodo: "",
    idTipoDoc: "",
    programaEducativo: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const documentsPerPage = 50;

  // ✅ Helper para manejar errores de forma consistente
  const handleError = (err, context) => {
    console.error(`❌ Error en ${context}:`, err);
    
    if (err.response?.status === 401) {
      return "Tu sesión ha expirado. Por favor inicia sesión nuevamente";
    }
    if (err.response?.status === 403) {
      return "No tienes permiso para realizar esta acción";
    }
    if (err.response?.status === 404) {
      return `Recurso no encontrado (${context})`;
    }
    
    return err.response?.data?.error || err.message || `Error al ${context}`;
  };

  // Obtener periodos
  const fetchPeriodos = async () => {
    try {
      const { data } = await api.get('/documentos/periodos');
      setPeriodos(data);
      if (data.length === 0) {
        setError("No se encontraron periodos");
      }
    } catch (err) {
      setError(handleError(err, "obtener periodos"));
    }
  };

  // Obtener tipos de documentos
  const fetchTiposDocumento = async () => {
    try {
      const { data } = await api.get('/documentos/tipo_documento');
      setTiposDocumento(data);
      if (data.length === 0) {
        setError("No se encontraron tipos de documento");
      }
    } catch (err) {
      setError(handleError(err, "obtener tipos de documento"));
    }
  };

  // Obtener programas educativos
  const fetchProgramasEducativos = async () => {
    try {
      const { data } = await api.get('/documentos/programas_educativos');
      setProgramasEducativos(data);
      if (data.length === 0) {
        setError("No se encontraron programas educativos");
      }
    } catch (err) {
      setError(handleError(err, "obtener programas educativos"));
    }
  };

  // Obtener documentos con filtros
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      
      // Solo agregar parámetros si tienen valor
      if (filters.estatus) params.estatus = filters.estatus;
      if (filters.idPeriodo) params.idPeriodo = Number(filters.idPeriodo);
      if (filters.idTipoDoc) params.idTipoDoc = Number(filters.idTipoDoc);
      if (filters.programaEducativo) params.programaEducativo = filters.programaEducativo;

      const { data } = await api.get('/documentos', { params });

      if (!Array.isArray(data)) {
        throw new Error("Formato de respuesta inválido");
      }

      console.log(`📄 Admin: ${data.length} documentos obtenidos`);

      // Filtrar por búsqueda local
      const filtered = data.filter((doc) => {
        if (!searchTerm) return true;
        
        const search = searchTerm.toLowerCase();
        return (
          (doc.Matricula && doc.Matricula.toLowerCase().includes(search)) ||
          (doc.Nombre_TipoDoc && doc.Nombre_TipoDoc.toLowerCase().includes(search)) ||
          (doc.ProgramaEducativo && doc.ProgramaEducativo.toLowerCase().includes(search))
        );
      });

      // Paginación
      const total = filtered.length;
      const pages = Math.ceil(total / documentsPerPage) || 1;
      const startIndex = (currentPage - 1) * documentsPerPage;
      const paginatedDocuments = filtered.slice(startIndex, startIndex + documentsPerPage);

      setAllDocuments(data);
      setDocuments(paginatedDocuments);
      setTotalPages(pages);
      setTotalDocuments(total);
    } catch (err) {
      setError(handleError(err, "obtener documentos"));
      setDocuments([]);
      setAllDocuments([]);
      setTotalPages(1);
      setTotalDocuments(0);
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
      await api.put(`/documentos/approve/${idDocumento}`);
      
      console.log(`✅ Documento ${idDocumento} aprobado`);
      setSuccess("Documento aprobado correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch (err) {
      setError(handleError(err, "aprobar documento"));
    } finally {
      setLoading(false);
    }
  };

  // Rechazar documento
  const rejectDocument = async (idDocumento, comentarios) => {
    if (!comentarios || !comentarios.trim()) {
      setError("Debes proporcionar un motivo para rechazar el documento");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/documentos/reject/${idDocumento}`, { comentarios });
      
      console.log(`❌ Documento ${idDocumento} rechazado`);
      setSuccess("Documento rechazado correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch (err) {
      setError(handleError(err, "rechazar documento"));
    } finally {
      setLoading(false);
    }
  };

  // Revertir documento
  const revertDocument = async (idDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/documentos/revert/${idDocumento}`);
      
      console.log(`🔄 Documento ${idDocumento} revertido`);
      setSuccess("Documento revertido a Pendiente correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch (err) {
      setError(handleError(err, "revertir documento"));
    } finally {
      setLoading(false);
    }
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchPeriodos();
    fetchTiposDocumento();
    fetchProgramasEducativos();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar cuando cambian filtros/búsqueda/página
  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchTerm, currentPage]);

  return {
    documents,
    allDocuments,
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
    revertDocument,
    resetMessages: () => {
      setError(null);
      setSuccess(null);
    },
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalDocuments,
    documentsPerPage,
  };
};

export default useDocumentosAdmin;