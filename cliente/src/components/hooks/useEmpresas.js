import { useState, useEffect } from "react";
import axios from "axios";

const useEmpresas = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sociedadFilter, setSociedadFilter] = useState("Todas");
  const companiesPerPage = 50;

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          "No se encontró el token de autenticación. Por favor, inicia sesión."
        );
      }
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/empresas`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Verificar que data sea un arreglo

      if (!Array.isArray(data)) {
        throw new Error(
          "Formato de respuesta inválido: se esperaba un arreglo de empresas"
        );
      }
      const filtered = data.filter((empresa) => {
        const matchesSearch =
          (empresa.empresa_nombre?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (empresa.empresa_rfc?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          );
        const matchesSociedad =
          sociedadFilter === "Todas" ||
          empresa.empresa_sociedad === sociedadFilter;
        return matchesSearch && matchesSociedad;
      });
      const total = filtered.length;
      const pages = Math.ceil(total / companiesPerPage);
      const startIndex = (currentPage - 1) * companiesPerPage;
      const paginatedCompanies = filtered.slice(
        startIndex,
        startIndex + companiesPerPage
      );

      setCompanies(paginatedCompanies);
      setTotalPages(pages || 1);
      setTotalCompanies(total);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "No se pudieron cargar las empresas. Por favor, intenta de nuevo."
      );
      setCompanies([]);
      setTotalPages(1);
      setTotalCompanies(0);
    } finally {
      setLoading(false);
    }
  };

  const createEmpresa = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          "No se encontró el token de autenticación. Por favor, inicia sesión."
        );
      }
      const payload = {
        empresa_nombre: data.empresa_nombre,
        empresa_direccion: data.empresa_direccion || "",
        empresa_email: data.empresa_email || "",
        empresa_telefono: data.empresa_telefono || "",
        empresa_tamano: data.empresa_tamano,
        empresa_sociedad: data.empresa_sociedad,
        empresa_pagina_web: data.empresa_pagina_web || "",
      };
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/api/empresas`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentPage(1);
      setSuccess("Empresa creada con éxito.");
      await fetchCompanies();
      return response.data;
    } catch (err) {
      console.error("Error creating company:", err);
      setError(
        err.response?.data?.error ||
          "No se pudo crear la empresa. Por favor, verifica los datos e intenta de nuevo."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEmpresa = async (id, updatedData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          "No se encontró el token de autenticación. Por favor, inicia sesión."
        );
      }
      const payload = {
        empresa_nombre: updatedData.empresa_nombre,
        empresa_direccion: updatedData.empresa_direccion || "",
        empresa_email: updatedData.empresa_email || "",
        empresa_telefono: updatedData.empresa_telefono || "",
        empresa_tamano: updatedData.empresa_tamano,
        empresa_sociedad: updatedData.empresa_sociedad,
        empresa_pagina_web: updatedData.empresa_pagina_web || "",
      };
      await axios.put(
        `${process.env.REACT_APP_API_ENDPOINT}/api/empresas/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentPage(1);
      setSuccess("Empresa actualizada con éxito.");
      await fetchCompanies();
    } catch (err) {
      console.error("Error updating company:", err);
      setError(
        err.response?.data?.error ||
          "No se pudo actualizar la empresa. Por favor, intenta de nuevo."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmpresa = async (id) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          "No se encontró el token de autenticación. Por favor, inicia sesión."
        );
      }
      const response = await axios.delete(
        `${process.env.REACT_APP_API_ENDPOINT}/api/empresas/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentPage(1);
      setSuccess("Empresa eliminada con éxito.");
      await fetchCompanies();
      return response.data;
    } catch (err) {
      console.error("Error deleting company:", err);
      setError(
        err.response?.data?.error ||
          "No se pudo eliminar la empresa. Por favor, intenta de nuevo."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEmpresasFromCSV = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          "No se encontró el token de autenticación. Por favor, inicia sesión."
        );
      }
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/api/empresas/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCurrentPage(1);
      const totalOmitted =
        data.existingCount +
        data.invalidEmailCount +
        data.invalidTamanoCount +
        data.invalidSociedadCount +
        data.missingFieldsCount;
      let successMessage = `${data.insertedCount} empresa${
        data.insertedCount !== 1 ? "s" : ""
      } importada${data.insertedCount !== 1 ? "s" : ""} con éxito.`;
      if (totalOmitted > 0) {
        successMessage += `<br>${totalOmitted} registro${
          totalOmitted !== 1 ? "s" : ""
        } omitido${totalOmitted !== 1 ? "s" : ""}:`;
        const reasons = [];
        if (data.existingCount > 0) {
          reasons.push(
            `${data.existingCount} empresa${
              data.existingCount !== 1 ? "s" : ""
            } con nombre ya registrado${data.existingCount !== 1 ? "s" : ""}`
          );
        }
        if (data.invalidEmailCount > 0) {
          reasons.push(
            `${data.invalidEmailCount} correo${
              data.invalidEmailCount !== 1 ? "s" : ""
            } electrónico${data.invalidEmailCount !== 1 ? "s" : ""} no válido${
              data.invalidEmailCount !== 1 ? "s" : ""
            }`
          );
        }
        if (data.invalidTamanoCount > 0) {
          reasons.push(
            `${data.invalidTamanoCount} valor${
              data.invalidTamanoCount !== 1 ? "es" : ""
            } no válido${
              data.invalidTamanoCount !== 1 ? "s" : ""
            } para el tamaño (debe ser Grande, Mediana o Pequeña)`
          );
        }
        if (data.invalidSociedadCount > 0) {
          reasons.push(
            `${data.invalidSociedadCount} valor${
              data.invalidSociedadCount !== 1 ? "es" : ""
            } no válido${
              data.invalidSociedadCount !== 1 ? "s" : ""
            } para la sociedad (debe ser Privada o Pública)`
          );
        }
        if (data.missingFieldsCount > 0) {
          reasons.push(
            `${data.missingFieldsCount} registro${
              data.missingFieldsCount !== 1 ? "s" : ""
            } con campos obligatorios faltantes`
          );
        }
        if (reasons.length > 0) {
          successMessage += `<br>- ${reasons.join("<br>- ")}`;
        }
      }

      setSuccess(successMessage);
      await fetchCompanies();
      return data;
    } catch (err) {
      console.error("Error importing companies:", err);
      setError(
        err.response?.data?.error ||
          "No se pudieron importar las empresas. Por favor, revisa el archivo CSV e intenta de nuevo."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, sociedadFilter]);

  return {
    companies,
    loading,
    error,
    success,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    createEmpresasFromCSV,
    resetMessages,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCompanies,
    companiesPerPage,
    searchTerm,
    setSearchTerm,
    sociedadFilter,
    setSociedadFilter,
  };
};

export default useEmpresas;