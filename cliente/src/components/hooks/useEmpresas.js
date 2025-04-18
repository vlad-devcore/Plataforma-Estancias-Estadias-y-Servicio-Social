import { useState, useEffect } from "react";
import axios from "axios";

const useEmpresas = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get("http://localhost:9999/api/empresas");
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEmpresa = async (data) => {
    try {
      const payload = {
        empresa_rfc: data.empresa_rfc,
        empresa_nombre: data.empresa_nombre,
        empresa_direccion: data.empresa_direccion || "",
        empresa_email: data.empresa_email || "",
        empresa_telefono: data.empresa_telefono || "",
        empresa_tamano: data.empresa_tamano,
        empresa_sociedad: data.empresa_sociedad,
        empresa_pagina_web: data.empresa_pagina_web || "",
      };
      const response = await axios.post("http://localhost:9999/api/empresas", payload);
      setCompanies([...companies, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear la empresa");
      throw err;
    }
  };

  const updateEmpresa = async (id, updatedData) => {
    try {
      const payload = {
        empresa_rfc: updatedData.empresa_rfc,
        empresa_nombre: updatedData.empresa_nombre,
        empresa_direccion: updatedData.empresa_direccion || "",
        empresa_email: updatedData.empresa_email || "",
        empresa_telefono: updatedData.empresa_telefono || "",
        empresa_tamano: updatedData.empresa_tamano,
        empresa_sociedad: updatedData.empresa_sociedad,
        empresa_pagina_web: updatedData.empresa_pagina_web || "",
      };
      await axios.put(`http://localhost:9999/api/empresas/${id}`, payload);
      await fetchCompanies();
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Error al actualizar la empresa");
      throw error;
    }
  };

  const deleteEmpresa = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:9999/api/empresas/${id}`);
      await fetchCompanies();
      setError(null);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Error al eliminar la empresa");
      throw error;
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
  };
};

export default useEmpresas;