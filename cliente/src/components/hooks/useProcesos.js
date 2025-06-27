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
    console.log('Usuario cargado desde localStorage:', storedUser);
    setUser(storedUser);
  }, []);

  const fetchProcesos = async () => {
    try {
      console.log('Haciendo solicitud para obtener todos los procesos');
      const { data } = await axios.get(`http://189.203.249.19:3011/procesos`);
      console.log('Respuesta del backend:', JSON.stringify(data, null, 2));
      setProcesos(data);
      setTotalProcesos(data.length);
      setTotalPages(Math.ceil(data.length / processesPerPage));
      applyFilterAndPagination(data, searchTerm, currentPage);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.details || err.response?.data?.message || err.message;
      setError(`Error al cargar procesos: ${errorMessage}`);
      console.error("Error en fetchProcesos:", err);
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
      console.error('No se encontró user.id en createProceso');
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
      console.log('Creando proceso con payload:', payload);
      const { data } = await axios.post("http://189.203.249.19:3011/procesos", payload);
      await fetchProcesos();
      setSuccess("Proceso creado con éxito");
      return data;
    } catch (err) {
      console.error('Error en createProceso:', err);
      throw err.response?.data || err.message;
    }
  };

  const updateProceso = async (id_proceso, formData) => {
    if (!user?.id) {
      console.error('No se encontró user.id en updateProceso');
      throw new Error("Usuario no encontrado");
    }

    const payload = {
      id_empresa: formData.id_empresa,
      id_asesor_academico: formData.id_asesor_academico,
      tipo_proceso: formData.tipo_proceso,
    };

    try {
      console.log(`Actualizando proceso ${id_proceso} con payload:`, payload);
      await axios.put(`http://189.203.249.19:3011/procesos/${id_proceso}`, payload);
      setSuccess("Proceso actualizado con éxito");
      await fetchProcesos();
    } catch (err) {
      console.error('Error en updateProceso:', err);
      setError(err.response?.data?.message || "Error al actualizar el proceso");
      throw err;
    }
  };

  const deleteProceso = async (id_proceso) => {
    try {
      console.log(`Eliminando proceso ${id_proceso}`);
      await axios.delete(`http://189.203.249.19:3011/procesos/${id_proceso}`);
      setSuccess("Proceso eliminado con éxito");
      await fetchProcesos();
    } catch (err) {
      console.error('Error en deleteProceso:', err);
      setError(err.response?.data?.message || "Error al eliminar el proceso");
      throw err;
    }
  };

  const validarRegistroEnPeriodo = async (idPeriodo) => {
    if (!user?.id) {
      console.error('No se encontró user.id en validarRegistroEnPeriodo');
      throw new Error("Usuario no encontrado");
    }

    try {
      console.log(`Validando registro para id_user: ${user.id}, id_periodo: ${idPeriodo}`);
      const { data } = await axios.get(`http://189.203.249.19:3011/procesos/validar/${user.id}/${idPeriodo}`);
      console.log('Respuesta de validarRegistroEnPeriodo:', data);
      return data;
    } catch (err) {
      console.error('Error en validarRegistroEnPeriodo:', err);
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
    filteredProcesos, // Devolvemos los procesos filtrados y paginados
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