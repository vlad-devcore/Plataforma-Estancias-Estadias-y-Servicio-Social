import { useState, useEffect } from "react";
import axios from "axios";

const useFormatos = () => {
  const [formatos, setFormatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Base URL completa para las peticiones
  const API_BASE = `${process.env.REACT_APP_API_ENDPOINT}/api/documentosAdmin`;

  // Tipos de documentos predefinidos
  const tiposDocumentos = [
    "Número NSS", 
    "Carta de presentación",
    "Carta de aceptación",
    "Cédula de registro",
    "Definición de proyecto",
    "Carta de liberación",
    "Guía de uso",
    "Reporte Mensual",
  ];

  // Obtener todos los formatos
  const fetchFormatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_BASE);
      const data = response.data;

      // Combinar con documentos predefinidos
      const combined = tiposDocumentos.map((tipo) => {
        const formatoExistente = data.find((f) => f.nombre_documento === tipo);
        return {
          nombre_documento: tipo,
          nombre_archivo: formatoExistente?.nombre_archivo || null,
          id: formatoExistente?.id || null,
          estado: formatoExistente?.estado || 'Activo',
          ultima_modificacion_manual: formatoExistente?.ultima_modificacion_manual || null,
        };
      });

      setFormatos(combined);
      return combined;
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar formatos");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subir o actualizar un formato
  const uploadFormato = async (nombreDocumento, archivo) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("nombre_documento", nombreDocumento);

      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Formato subido correctamente");
      await fetchFormatos(); // Refrescar la lista
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Error al subir formato");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar el estado de un formato
  const updateEstadoFormato = async (nombreDocumento, nuevoEstado) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.put(`${API_BASE}/estado`, {
        nombre_documento: nombreDocumento,
        estado: nuevoEstado,
      });

      setSuccess(`Estado actualizado a "${nuevoEstado}" correctamente`);
      await fetchFormatos(); // Refrescar la lista
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el estado");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Descargar un formato
  const downloadFormato = async (nombreDocumento) => {
    setLoading(true);
    setError(null);
    try {
      window.open(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentosAdmin/download/${encodeURIComponent(
          nombreDocumento
        )}`,
        "_blank"
      );

      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Error al descargar formato");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un formato
  const deleteFormato = async (nombreDocumento) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_BASE}/${encodeURIComponent(nombreDocumento)}`);
      setSuccess("Formato eliminado correctamente");
      await fetchFormatos(); // Refrescar la lista
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar formato");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener la extensión del archivo
  const getFileExtension = (filename) => {
    if (!filename) return null;
    return filename.split(".").pop().toLowerCase();
  };

  // Cargar formatos al inicializar
  useEffect(() => {
    fetchFormatos();
  }, []);

  return {
    formatos,
    loading,
    error,
    success,
    tiposDocumentos,
    fetchFormatos,
    uploadFormato,
    updateEstadoFormato,
    downloadFormato,
    deleteFormato,
    getFileExtension,
    resetMessages: () => {
      setError(null);
      setSuccess(null);
    },
  };
};

export default useFormatos;