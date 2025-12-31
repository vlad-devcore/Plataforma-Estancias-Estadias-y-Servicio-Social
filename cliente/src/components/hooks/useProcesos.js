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
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [availablePeriodos, setAvailablePeriodos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProcesos, setTotalProcesos] = useState(0);
  const processesPerPage = 50;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const fetchAvailablePeriodos = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/procesos/periodos`);
      setAvailablePeriodos(data);
      if (data.length > 0) {
        setSelectedPeriodo(data[0].IdPeriodo.toString());
      }
    } catch (error) {
      console.error('Error cargando periodos:', error);
    }
  };

  const fetchProcesos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/procesos`);
      setProcesos(data);
      applyFilterAndPagination(data, searchTerm, currentPage, selectedPeriodo);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.details || err.response?.data?.message || err.message;
      setError(`Error al cargar procesos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const applyFilterAndPagination = (data, search, page, periodoId) => {
    let filtered = Array.isArray(data) ? data.filter(proceso => {
      if (!proceso) return false;
      
      const searchLower = search.toLowerCase();
      const matchesSearch = (proceso.matricula || '').toLowerCase().includes(searchLower);
      const matchesPeriodo = !periodoId || proceso.id_periodo == periodoId;
      
      return matchesSearch && matchesPeriodo;
    }) : [];

    const startIndex = (page - 1) * processesPerPage;
    const paginated = filtered.slice(startIndex, startIndex + processesPerPage);

    setFilteredProcesos(paginated);
    setTotalProcesos(filtered.length);
    setTotalPages(Math.ceil(filtered.length / processesPerPage));
  };

  useEffect(() => {
    applyFilterAndPagination(procesos, searchTerm, currentPage, selectedPeriodo);
  }, [searchTerm, currentPage, procesos, selectedPeriodo]);

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

  const exportFilteredProcesos = async () => {
    try {
      console.log(`📥 Exportando procesos del periodo ${selectedPeriodo}...`);
      
      // 🔑 OBTENER TOKEN DEL STORAGE
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No hay token de autenticación. Por favor, inicia sesión nuevamente.");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/procesos/export`,
        { 
          params: {
            periodo: selectedPeriodo,
            search: searchTerm
          },
          responseType: 'blob',
          // ✅ AGREGAR HEADERS CON TOKEN
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      
      const periodoName = selectedPeriodo;
      link.download = `procesos_${periodoName}_${searchTerm || 'todos'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`✅ ${filteredProcesos.length} procesos exportados correctamente`);
      
    } catch (error) {
      console.error('❌ Error exportando:', error);
      
      // Manejar error 401 específicamente
      if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message ||
                            'Error al exportar procesos filtrados';
        setError(errorMessage);
      }
      throw error;
    }
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
    setSelectedPeriodo
  };
};

export default useProcesos;