import { useState, useEffect } from 'react';
import axios from 'axios';

const useEmpresas = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:9999/api/empresas');
      setCompanies(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateEmpresa = async (id, updatedData) => {
    try {
      // Verificar que los campos obligatorios estén presentes
      const payload = {
        empresa_rfc: updatedData.empresa_rfc,
        empresa_nombre: updatedData.empresa_nombre,
        empresa_tamano: updatedData.empresa_tamano,
        empresa_sociedad: updatedData.empresa_sociedad,
        // Campos opcionales
        empresa_direccion: updatedData.empresa_direccion || '',
        empresa_email: updatedData.empresa_email || '',
        empresa_telefono: updatedData.empresa_telefono || '',
        empresa_pagina_web: updatedData.empresa_pagina_web || ''
      };
  
      const response = await axios.put(`http://localhost:9999/api/empresas/${id}`, payload);
      await fetchCompanies();
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  const deleteEmpresa = async (id) => {
    try {
      console.log("🗑️ ID a eliminar:", id); // Verificar ID
      const response = await axios.delete(`http://localhost:9999/api/empresas/${id}`);
      console.log("✅ Eliminación exitosa:", response.data);
      await fetchCompanies();
    } catch (error) {
      console.error("🔴 Error al eliminar:", {
        URL: error.config?.url,
        ID_Recibido: id,
        Error: error.response?.data
      });
      throw error;
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await axios.post('http://localhost:9999/api/empresas/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchCompanies();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  return { companies, loading, error, updateEmpresa, deleteEmpresa, handleUpload };
};

export default useEmpresas;