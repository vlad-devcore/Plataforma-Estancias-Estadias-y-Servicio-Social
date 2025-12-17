import { useState, useEffect } from "react";
import axios from "axios";

const useProcesos = () => {
  const [procesos, setProcesos] = useState([]);
  const [filteredProcesos, setFilteredProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [availablePeriodos, setAvailablePeriodos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProcesos, setTotalProcesos] = useState(0);

  const processesPerPage = 50;
  const API = process.env.REACT_APP_API_ENDPOINT;

  // 🔐 Cargar usuario desde localStorage
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser?.id) {
        setUser(storedUser);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const fetchAvailablePeriodos = async () => {
    try {
      const { data } = await axios.get(`${API}/api/procesos/periodos`);
      setAvailablePeriodos(data || []);
      if (data?.length > 0) {
        setSelectedPeriodo(String(data[0].IdPeriodo));
      }
    } catch (err) {
      console.error("Error cargando periodos:", err);
    }
  };

  const applyFilterAndPagination = (data, search, page, periodoId) => {
    const safeData = Array.isArray(data) ? data : [];

    const filtered = safeData.filter((proceso) => {
      if (!proceso) return false;

      const searchLower = (search || "").toLowerCase();
      const matchesSearch = (proceso.matricula || "")
        .toLowerCase()
        .includes(searchLower);

      const matchesPeriodo =
        !periodoId ||
        String(proceso.id_periodo) === String(periodoId);

      return matchesSearch && matchesPeriodo;
    });

    const startIndex = (page - 1) * processesPerPage;
    const paginated = filtered.slice(
      startIndex,
      startIndex + processesPerPage
    );

    setFilteredProcesos(paginated);
    setTotalProcesos(filtered.length);
    setTotalPages(Math.ceil(filtered.length / processesPerPage) || 1);
  };

  const fetchProcesos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/procesos`);
      setProcesos(data || []);
      applyFilterAndPagination(data, searchTerm, currentPage, selectedPeriodo);
      setError(null);
    } catch (err) {
      const message =
        err.response?.data?.details ||
        err.response?.data?.message ||
        err.message;
      setError(`Error al cargar procesos: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilterAndPagination(
      procesos,
      searchTerm,
      currentPage,
      selectedPeriodo
    );
  }, [procesos, searchTerm, currentPage, selectedPeriodo]);

  const mapTipoProceso = (tipo) => {
    switch (tipo) {
      case "Estancia I":
      case "Estancia II":
        return "Estancia";
      case "Estadía":
        return "Estadía";
      case "Servicio Social":
        return "Servicio Social";
      case "Estadía Nacional":
        return "Estadía Nacional";
      default:
        return null;
    }
  };

  const createProceso = async (formData, tipoProceso) => {
    if (!user?.id) throw new Error("Usuario no encontrado");

    const payload = {
      id_user: user.id,
      id_empresa: formData.empresa,
      id_asesor_academico: formData.asesorAcademico,
      id_programa: formData.programa,
      id_periodo: formData.periodo,
      tipo_proceso: mapTipoProceso(tipoProceso),
    };

    const { data } = await axios.post(`${API}/api/procesos`, payload);
    setSuccess("Proceso creado con éxito");
    await fetchProcesos();
    return data;
  };

  const updateProceso = async (id_proceso, formData) => {
    if (!user?.id) throw new Error("Usuario no encontrado");

    const payload = {
      id_empresa: formData.id_empresa,
      id_asesor_academico: formData.id_asesor_academico,
      tipo_proceso: formData.tipo_proceso,
    };

    await axios.put(`${API}/api/procesos/${id_proceso}`, payload);
    setSuccess("Proceso actualizado con éxito");
    await fetchProcesos();
  };

  const deleteProceso = async (id_proceso) => {
    await axios.delete(`${API}/api/procesos/${id_proceso}`);
    setSuccess("Proceso eliminado con éxito");
    await fetchProcesos();
  };

  const validarRegistroEnPeriodo = async (idPeriodo) => {
    if (!user?.id) throw new Error("Usuario no encontrado");
    const { data } = await axios.get(
      `${API}/api/procesos/validar/${user.id}/${idPeriodo}`
    );
    return data;
  };

  const exportFilteredProcesos = async () => {
    const { data } = await axios.get(`${API}/api/procesos/export`, {
      params: { periodo: selectedPeriodo, search: searchTerm },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `procesos_${selectedPeriodo || "todos"}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    setSuccess("Procesos exportados correctamente");
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchAvailablePeriodos();
    fetchProcesos();
  }, []);

  return {
    procesos,
    filteredProcesos,
    loading,
    error,
    success,
    fetchProcesos,
    createProceso,
    updateProceso,
    deleteProceso,
    validarRegistroEnPeriodo,
    exportFilteredProcesos,
    resetMessages,
    user,
    currentPage,
    setCurrentPage,
    totalPages,
    totalProcesos,
    searchTerm,
    setSearchTerm,
    availablePeriodos,
    selectedPeriodo,
    setSelectedPeriodo,
  };
};

export default useProcesos;
