import { useState, useEffect } from "react";
import api from "../axiosConfig"; // ✅ CAMBIO CRÍTICO: Usar la instancia configurada

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

  /**
   * 📅 Obtener todos los periodos
   * ✅ AHORA usa api (con token automático)
   */
  const fetchPeriodos = async () => {
    try {
      const { data } = await api.get("/documentos/periodos");
      setPeriodos(data);
      if (data.length === 0) {
        setError("No se encontraron periodos");
      }
    } catch (err) {
      console.error("❌ Error al obtener periodos:", err);
      setError(
        err.response?.status === 404
          ? "Endpoint de periodos no encontrado (verifica documentos.js)"
          : "Error al obtener periodos"
      );
    }
  };

  /**
   * 📋 Obtener tipos de documentos
   * ✅ AHORA usa api (con token automático)
   */
  const fetchTiposDocumento = async () => {
    try {
      const { data } = await api.get("/documentos/tipo_documento");
      setTiposDocumento(data);
      if (data.length === 0) {
        setError("No se encontraron tipos de documento");
      }
    } catch (err) {
      console.error("❌ Error al obtener tipos de documento:", err);
      setError(
        err.response?.status === 404
          ? "Endpoint de tipos de documento no encontrado (verifica documentos.js)"
          : "Error al obtener tipos de documento"
      );
    }
  };

  /**
   * 🎓 Obtener programas educativos
   * ✅ AHORA usa api (con token automático)
   */
  const fetchProgramasEducativos = async () => {
    try {
      const { data } = await api.get("/documentos/programas_educativos");
      setProgramasEducativos(data);
      if (data.length === 0) {
        setError("No se encontraron programas educativos");
      }
    } catch (err) {
      console.error("❌ Error al obtener programas educativos:", err);
      setError(
        err.response?.status === 404
          ? "Endpoint de programas educativos no encontrado (verifica documentos.js)"
          : "Error al obtener programas educativos"
      );
    }
  };

  /**
   * 📄 Obtener todos los documentos con filtros
   * ✅ AHORA usa api (con token automático)
   * 🔒 Admin verá TODOS los documentos (backend ya filtra)
   */
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

      const { data } = await api.get("/documentos", { params });

      if (!Array.isArray(data)) {
        throw new Error(
          "Formato de respuesta inválido: se esperaba un arreglo de documentos"
        );
      }

      console.log(`📋 Documentos obtenidos: ${data.length}`);

      // Filtrar localmente por búsqueda
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
            )) ||
          (doc.NombreUsuario &&
            doc.NombreUsuario.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (doc.apellido_paterno &&
            doc.apellido_paterno.toLowerCase().includes(
              searchTerm.toLowerCase()
            )) ||
          (doc.apellido_materno &&
            doc.apellido_materno.toLowerCase().includes(
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
      console.error("❌ Error al obtener documentos:", err);
      setError(
        err.response?.status === 404
          ? "Endpoint de documentos no encontrado (verifica documentos.js)"
          : err.message || "Error al obtener documentos"
      );
      setDocuments([]);
      setAllDocuments([]);
      setTotalPages(1);
      setTotalDocuments(0);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Aprobar documento
   * ✅ AHORA usa api (con token automático)
   * 🔒 Solo admin puede ejecutar esto (backend valida)
   */
  const approveDocument = async (idDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/documentos/approve/${idDocumento}`);
      setSuccess("Documento aprobado correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch (err) {
      console.error("❌ Error al aprobar documento:", err);
      setError(
        err.response?.status === 404
          ? "Endpoint de aprobación no encontrado (verifica documentos.js)"
          : err.response?.status === 403
          ? "No tienes permisos para aprobar documentos"
          : "Error al aprobar documento"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ❌ Rechazar documento
   * ✅ AHORA usa api (con token automático)
   * 🔒 Solo admin puede ejecutar esto (backend valida)
   */
  const rejectDocument = async (idDocumento, comentarios) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/documentos/reject/${idDocumento}`, { comentarios });
      setSuccess("Documento rechazado correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch (err) {
      console.error("❌ Error al rechazar documento:", err);
      setError(
        err.response?.status === 404
          ? "Endpoint de rechazo no encontrado (verifica documentos.js)"
          : err.response?.status === 403
          ? "No tienes permisos para rechazar documentos"
          : "Error al rechazar documento"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔄 Revertir documento a Pendiente
   * ✅ AHORA usa api (con token automático)
   * 🔒 Solo admin puede ejecutar esto (backend valida)
   */
  const revertDocument = async (idDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/documentos/revert/${idDocumento}`);
      setSuccess("Documento revertido a Pendiente correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch (err) {
      console.error("❌ Error al revertir documento:", err);
      setError(
        err.response?.status === 404
          ? "Endpoint de revertir no encontrado (verifica documentos.js)"
          : err.response?.status === 403
          ? "No tienes permisos para revertir documentos"
          : "Error al revertir documento"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔧 Actualizar filtros
   */
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * 🚀 Cargar datos iniciales al montar el componente
   */
  useEffect(() => {
    fetchPeriodos();
    fetchTiposDocumento();
    fetchProgramasEducativos();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 🔄 Recargar documentos cuando cambian filtros, búsqueda o página
   */
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