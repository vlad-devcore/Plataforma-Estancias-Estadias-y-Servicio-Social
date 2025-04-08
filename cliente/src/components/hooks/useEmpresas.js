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
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
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
    } catch (error) {
      throw error.response?.data;
    }
  };

  const deleteEmpresa = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:9999/api/empresas/${id}`);
      await fetchCompanies();
      return response.data;
    } catch (error) {
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
    updateEmpresa,
    deleteEmpresa,
  };
};

export default useEmpresas;
