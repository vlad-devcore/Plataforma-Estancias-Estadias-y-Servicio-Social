// ============================================
// 🔧 SOLUCIÓN: useDocumentosAdmin.js
// Agregar token en cada petición
// ============================================

import { useState, useEffect } from "react";
import axios from "axios";

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

  // ✅ NUEVO: Función helper para obtener headers con token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  // ✅ NUEVO: Manejar error 401 (sesión expirada)
  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      setError("Sesión expirada. Por favor inicia sesión nuevamente.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setTimeout(() => window.location.href = '/login', 2000);
      return true;
    }
    return false;
  };

  // Obtener todos los periodos
  const fetchPeriodos = async () => {
    try {
      // ✅ MODIFICADO: Agregar headers con token
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/periodos`,
        {
          headers: getAuthHeaders()
        }
      );
      setPeriodos(data);
      if (data.length === 0) {
        setError("No se encontraron periodos");
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(
          err.response?.status === 404
            ? "Endpoint de periodos no encontrado (verifica documentos.js)"
            : "Error al obtener periodos"
        );
      }
    }
  };

  // Obtener tipos de documentos
  const fetchTiposDocumento = async () => {
    try {
      // ✅ MODIFICADO: Agregar headers con token
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/tipo_documento`,
        {
          headers: getAuthHeaders()
        }
      );
      setTiposDocumento(data);
      if (data.length === 0) {
        setError("No se encontraron tipos de documento");
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(
          err.response?.status === 404
            ? "Endpoint de tipos de documento no encontrado (verifica documentos.js)"
            : "Error al obtener tipos de documento"
        );
      }
    }
  };

  // Obtener programas educativos
  const fetchProgramasEducativos = async () => {
    try {
      // ✅ MODIFICADO: Agregar headers con token
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/programas_educativos`,
        {
          headers: getAuthHeaders()
        }
      );
      setProgramasEducativos(data);
      if (data.length === 0) {
        setError("No se encontraron programas educativos");
      }
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(
          err.response?.status === 404
            ? "Endpoint de programas educativos no encontrado (verifica documentos.js)"
            : "Error al obtener programas educativos"
        );
      }
    }
  };

  // Obtener todos los documentos con filtros
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        estatus: filters.estatus || undefined,
        idPeriodo: filters.idPeriodo ? Number(filters.idPeriodo) : undefined,
        idTipoDoc: filters.idTipoDoc ? Number(filters.idTipoDoc) : undefined,
        programaEducativo: filters.programaEducativo || undefined,
      };
      // ✅ MODIFICADO: Agregar headers con token
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos`,
        { 
          params,
          headers: getAuthHeaders()
        }
      );
      if (!Array.isArray(data)) {
        throw new Error(
          "Formato de respuesta inválido: se esperaba un arreglo de documentos"
        );
      }
      // Filtrar localmente por búsqueda y filtros adicionales
      const filtered = data.filter((doc) => {
        const matchesSearch =
          (doc.Matricula &&
            doc.Matricula.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (doc.Nombre_TipoDoc &&
            doc.Nombre_TipoDoc.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (doc.ProgramaEducativo &&
            doc.ProgramaEducativo.toLowerCase().includes(
              searchTerm.toLowerCase()
            ));
        return matchesSearch;
      });
      // Calcular paginación local
      const total = filtered.length;
      const pages = Math.ceil(total / documentsPerPage) || 1;
      const startIndex = (currentPage - 1) * documentsPerPage;
      const paginatedDocuments = filtered.slice(
        startIndex,
        startIndex + documentsPerPage
      );
      setAllDocuments(data);
      setDocuments(paginatedDocuments);
      setTotalPages(pages);
      setTotalDocuments(total);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(
          err.response?.status === 404
            ? "Endpoint de documentos no encontrado (verifica documentos.js)"
            : err.message || "Error al obtener documentos"
        );
        setDocuments([]);
        setAllDocuments([]);
        setTotalPages(1);
        setTotalDocuments(0);
      }
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
      // ✅ MODIFICADO: Agregar headers con token
      await axios.put(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/approve/${idDocumento}`,
        {},
        {
          headers: getAuthHeaders()
        }
      );
      setSuccess("Documento aprobado correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(
          err.response?.status === 404
            ? "Endpoint de aprobación no encontrado (verifica documentos.js)"
            : "Error al aprobar documento"
        );
      }
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
      // ✅ MODIFICADO: Agregar headers con token
      await axios.put(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/reject/${idDocumento}`,
        { comentarios },
        {
          headers: getAuthHeaders()
        }
      );
      setSuccess("Documento rechazado correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(
          err.response?.status === 404
            ? "Endpoint de rechazo no encontrado (verifica documentos.js)"
            : "Error al rechazar documento"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Revertir documento a Pendiente
  const revertDocument = async (idDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // ✅ MODIFICADO: Agregar headers con token
      await axios.put(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/revert/${idDocumento}`,
        {},
        {
          headers: getAuthHeaders()
        }
      );
      setSuccess("Documento revertido a Pendiente correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(
          err.response?.status === 404
            ? "Endpoint de revertir no encontrado (verifica documentos.js)"
            : "Error al revertir documento"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Efecto para cargar periodos, tipos de documento, programas educativos y documentos al montar
  useEffect(() => {
    fetchPeriodos();
    fetchTiposDocumento();
    fetchProgramasEducativos();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto para recargar documentos cuando cambian los filtros, searchTerm o currentPage
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