import { useState, useEffect } from "react";
import axios from "axios";

const useProcesos = () => {
  const [procesos, setProcesos] = useState([]);
  const [filteredProcesos, setFilteredProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProcesos, setTotalProcesos] = useState(0);
  const processesPerPage = 50; // Número de procesos por página

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const fetchProcesos = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/procesos`);
      setProcesos(data);
      setTotalProcesos(data.length);
      setTotalPages(Math.ceil(data.length / processesPerPage));
      applyFilterAndPagination(data, searchTerm, currentPage);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.details || err.response?.data?.message || err.message;
      setError(`Error al cargar procesos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const applyFilterAndPagination = (data, search, page) => {
    let filtered = Array.isArray(data) ? data.filter(proceso => {
      if (!proceso) return false;
      const searchLower = search.toLowerCase();
      return (proceso.matricula || '').toLowerCase().includes(searchLower);
    }) : [];

    const startIndex = (page - 1) * processesPerPage;
    const paginated = filtered.slice(startIndex, startIndex + processesPerPage);

    setFilteredProcesos(paginated);
    setTotalProcesos(filtered.length);
    setTotalPages(Math.ceil(filtered.length / processesPerPage));
  };

  useEffect(() => {
    applyFilterAndPagination(procesos, searchTerm, currentPage);
  }, [searchTerm, currentPage, procesos]);

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
    if (!user?.id) {
      throw new Error("Usuario no encontrado");
    }

    const payload = {
      id_user: user.id,
      id_empresa: formData.empresa,
      id_asesor_academico: formData.asesorAcademico,
      id_programa: formData.programa,
      id_periodo: formData.periodo,
      tipo_proceso: mapTipoProceso(tipoProceso),
    };

    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/procesos`, payload);
      await fetchProcesos();
      setSuccess("Proceso creado con éxito");
      return data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const updateProceso = async (id_proceso, formData) => {
    if (!user?.id) {
      throw new Error("Usuario no encontrado");
    }

    const payload = {
      id_empresa: formData.id_empresa,
      id_asesor_academico: formData.id_asesor_academico,
      tipo_proceso: formData.tipo_proceso,
    };

    try {
      await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/api/procesos/${id_proceso}`, payload);
      setSuccess("Proceso actualizado con éxito");
      await fetchProcesos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar el proceso");
      throw err;
    }
  };

  const deleteProceso = async (id_proceso) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/api/procesos/${id_proceso}`);
      setSuccess("Proceso eliminado con éxito");
      await fetchProcesos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar el proceso");
      throw err;
    }
  };

  const validarRegistroEnPeriodo = async (idPeriodo) => {
    if (!user?.id) {
      throw new Error("Usuario no encontrado");
    }

    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/procesos/validar/${user.id}/${idPeriodo}`);
      return data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchProcesos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    resetMessages,
    user,
    currentPage,
    setCurrentPage,
    totalPages,
    totalProcesos,
    searchTerm,
    setSearchTerm
  };
};

export default useProcesos;