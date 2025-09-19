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

  // Obtener todos los periodos
  const fetchPeriodos = async () => {
    try {
      console.log(
        "Fetching periodos from ${process.env.REACT_APP_API_ENDPOINT}/api/documentos/periodos"
      );
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/periodos`
      );
      console.log("Periodos recibidos:", data);
      setPeriodos(data);
      if (data.length === 0) {
        setError("No se encontraron periodos");
      }
    } catch (err) {
      console.error(
        "Error al obtener periodos:",
        err.message,
        err.response?.status
      );
      setError(
        err.response?.status === 404
          ? "Endpoint de periodos no encontrado (verifica documentos.js)"
          : "Error al obtener periodos"
      );
    }
  };

  // Obtener tipos de documentos
  const fetchTiposDocumento = async () => {
    try {
      console.log(
        "Fetching tipos de documento from ${process.env.REACT_APP_API_ENDPOINT}/api/documentos/tipo_documento"
      );
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/tipo_documento`
      );
      console.log("Tipos de documento recibidos:", data);
      setTiposDocumento(data);
      if (data.length === 0) {
        setError("No se encontraron tipos de documento");
      }
    } catch (err) {
      console.error(
        "Error al obtener tipos de documento:",
        err.message,
        err.response?.status
      );
      setError(
        err.response?.status === 404
          ? "Endpoint de tipos de documento no encontrado (verifica documentos.js)"
          : "Error al obtener tipos de documento"
      );
    }
  };

  // Obtener programas educativos
  const fetchProgramasEducativos = async () => {
    try {
      console.log(
        "Fetching programas educativos from ${process.env.REACT_APP_API_ENDPOINT}/api/documentos/programas_educativos"
      );
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/programas_educativos`
      );
      console.log("Programas educativos recibidos:", data);
      setProgramasEducativos(data);
      if (data.length === 0) {
        setError("No se encontraron programas educativos");
      }
    } catch (err) {
      console.error(
        "Error al obtener programas educativos:",
        err.message,
        err.response?.status
      );
      setError(
        err.response?.status === 404
          ? "Endpoint de programas educativos no encontrado (verifica documentos.js)"
          : "Error al obtener programas educativos"
      );
    }
  };

  // Obtener todos los documentos con filtros
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        "Fetching documents for admin with filters:",
        filters,
        "searchTerm:",
        searchTerm
      );
      const params = {
        estatus: filters.estatus || undefined,
        idPeriodo: filters.idPeriodo ? Number(filters.idPeriodo) : undefined,
        idTipoDoc: filters.idTipoDoc ? Number(filters.idTipoDoc) : undefined,
        programaEducativo: filters.programaEducativo || undefined,
      };
      console.log("Parámetros enviados al backend:", params);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos`,
        { params }
      );
      console.log("Documentos recibidos:", data);
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
      console.error(
        "Error al obtener documentos:",
        err.message,
        err.response?.status
      );
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

  // Aprobar documento
  const approveDocument = async (idDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log(`Aprobando documento ${idDocumento}`);
      await axios.put(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/approve/${idDocumento}`
      );
      setSuccess("Documento aprobado correctamente");
      setCurrentPage(1); // Volver a la primera página
      await fetchDocuments();
    } catch (err) {
      console.error(
        "Error al aprobar documento:",
        err.message,
        err.response?.status
      );
      setError(
        err.response?.status === 404
          ? "Endpoint de aprobación no encontrado (verifica documentos.js)"
          : "Error al aprobar documento"
      );
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
      console.log(
        `Rechazando documento ${idDocumento} con comentarios: ${comentarios}`
      );
      await axios.put(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/reject/${idDocumento}`,
        { comentarios }
      );
      setSuccess("Documento rechazado correctamente");
      setCurrentPage(1); // Volver a la primera página
      await fetchDocuments();
    } catch (err) {
      console.error(
        "Error al rechazar documento:",
        err.message,
        err.response?.status
      );
      setError(
        err.response?.status === 404
          ? "Endpoint de rechazo no encontrado (verifica documentos.js)"
          : "Error al rechazar documento"
      );
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
      console.log(`Revirtiendo documento ${idDocumento} a Pendiente`);
      await axios.put(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentos/revert/${idDocumento}`
      );
      setSuccess("Documento revertido a Pendiente correctamente");
      setCurrentPage(1); // Volver a la primera página
      await fetchDocuments();
    } catch (err) {
      console.error(
        "Error al revertir documento:",
        err.message,
        err.response?.status
      );
      setError(
        err.response?.status === 404
          ? "Endpoint de revertir no encontrado (verifica documentos.js)"
          : "Error al revertir documento"
      );
    } finally {
      setLoading(false);
    }
  };

  // Actualizar filtros
  const updateFilters = (newFilters) => {
    console.log("Actualizando filtros:", newFilters);
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Resetear a la primera página
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