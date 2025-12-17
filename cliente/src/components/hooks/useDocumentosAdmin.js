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
  const API = process.env.REACT_APP_API_ENDPOINT;

  /* =========================
     CARGA DE CATÁLOGOS
     ========================= */

  const fetchPeriodos = async () => {
    try {
      const { data } = await axios.get(`${API}/api/documentos/periodos`);
      setPeriodos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al obtener periodos");
      setPeriodos([]);
    }
  };

  const fetchTiposDocumento = async () => {
    try {
      const { data } = await axios.get(
        `${API}/api/documentos/tipo_documento`
      );
      setTiposDocumento(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al obtener tipos de documento");
      setTiposDocumento([]);
    }
  };

  const fetchProgramasEducativos = async () => {
    try {
      const { data } = await axios.get(
        `${API}/api/documentos/programas_educativos`
      );
      setProgramasEducativos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al obtener programas educativos");
      setProgramasEducativos([]);
    }
  };

  /* =========================
     FILTRO + PAGINACIÓN
     ========================= */

  const applyFilterAndPagination = (
    data,
    search,
    page,
    activeFilters
  ) => {
    const safeData = Array.isArray(data) ? data : [];

    const searchLower = (search || "").toLowerCase();

    const filtered = safeData.filter((doc) => {
      if (!doc) return false;

      const matchesSearch =
        (doc.Matricula || "").toLowerCase().includes(searchLower) ||
        (doc.Nombre_TipoDoc || "").toLowerCase().includes(searchLower) ||
        (doc.ProgramaEducativo || "").toLowerCase().includes(searchLower);

      return matchesSearch;
    });

    const total = filtered.length;
    const pages = Math.ceil(total / documentsPerPage) || 1;

    const safePage = page > pages ? 1 : page;
    const startIndex = (safePage - 1) * documentsPerPage;

    const paginated = filtered.slice(
      startIndex,
      startIndex + documentsPerPage
    );

    setDocuments(paginated);
    setTotalDocuments(total);
    setTotalPages(pages);
    setCurrentPage(safePage);
  };

  /* =========================
     DOCUMENTOS
     ========================= */

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        estatus: filters.estatus || undefined,
        idPeriodo: filters.idPeriodo
          ? String(filters.idPeriodo)
          : undefined,
        idTipoDoc: filters.idTipoDoc
          ? String(filters.idTipoDoc)
          : undefined,
        programaEducativo: filters.programaEducativo || undefined,
      };

      const { data } = await axios.get(`${API}/api/documentos`, { params });

      const safeData = Array.isArray(data) ? data : [];

      setAllDocuments(safeData);
      applyFilterAndPagination(
        safeData,
        searchTerm,
        currentPage,
        filters
      );
    } catch (err) {
      setError("Error al obtener documentos");
      setDocuments([]);
      setAllDocuments([]);
      setTotalPages(1);
      setTotalDocuments(0);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ACCIONES ADMIN
     ========================= */

  const approveDocument = async (idDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(`${API}/api/documentos/approve/${idDocumento}`);
      setSuccess("Documento aprobado correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch {
      setError("Error al aprobar documento");
    } finally {
      setLoading(false);
    }
  };

  const rejectDocument = async (idDocumento, comentarios) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(
        `${API}/api/documentos/reject/${idDocumento}`,
        { comentarios }
      );
      setSuccess("Documento rechazado correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch {
      setError("Error al rechazar documento");
    } finally {
      setLoading(false);
    }
  };

  const revertDocument = async (idDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(`${API}/api/documentos/revert/${idDocumento}`);
      setSuccess("Documento revertido a Pendiente correctamente");
      setCurrentPage(1);
      await fetchDocuments();
    } catch {
      setError("Error al revertir documento");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTROS
     ========================= */

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  /* =========================
     EFECTOS
     ========================= */

  useEffect(() => {
    fetchPeriodos();
    fetchTiposDocumento();
    fetchProgramasEducativos();
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilterAndPagination(
      allDocuments,
      searchTerm,
      currentPage,
      filters
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDocuments, searchTerm, currentPage, filters]);

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
