// ============================================================================
// 📦 hooks/useDocumentosEstudiante.js - VERSIÓN PRODUCTION-SAFE
// ============================================================================
import { useState, useEffect, useMemo } from "react";
import api from "../axiosConfig";

/**
 * ✅ PRODUCTION-SAFE HOOK
 * - Usa instancia api configurada
 * - Validaciones robustas
 * - Manejo de errores mejorado
 * - Compatible con producción
 */
const useDocumentosEstudiante = (tipoProceso, procesoIdProp) => {
  const [plantillas, setPlantillas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [procesoId, setProcesoId] = useState(procesoIdProp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ✅ Memoizar usuario para evitar re-renders innecesarios
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (err) {
      console.error("Error al leer usuario de localStorage:", err);
      return null;
    }
  }, []);

  // Definir tipos de documentos según el proceso
  const tiposDocumentos = useMemo(() => {
    return tipoProceso === "Servicio Social"
      ? [
          "Reporte Mensual 1",
          "Reporte Mensual 2",
          "Reporte Mensual 3",
          "Reporte Mensual 4",
          "Reporte Mensual 5",
          "Reporte Mensual 6",
          "Reporte Mensual 7",
          "Reporte Mensual 8",
          "Reporte Mensual 9",
          "Reporte Mensual 10",
          "Reporte Mensual 11",
          "Reporte Mensual 12",
        ]
      : [
          "Número NSS",
          "Carta de presentación",
          "Carta de aceptación",
          "Cédula de registro",
          "Definición de proyecto",
          "Carta de liberación",
        ];
  }, [tipoProceso]);

  const tipoDocumentoMap = useMemo(() => {
    return tipoProceso === "Servicio Social"
      ? {
          "Reporte Mensual 1": 7,
          "Reporte Mensual 2": 8,
          "Reporte Mensual 3": 9,
          "Reporte Mensual 4": 10,
          "Reporte Mensual 5": 11,
          "Reporte Mensual 6": 12,
          "Reporte Mensual 7": 13,
          "Reporte Mensual 8": 14,
          "Reporte Mensual 9": 15,
          "Reporte Mensual 10": 16,
          "Reporte Mensual 11": 17,
          "Reporte Mensual 12": 18,
        }
      : {
          "Número NSS": 19,
          "Carta de presentación": 1,
          "Carta de aceptación": 2,
          "Cédula de registro": 3,
          "Definición de proyecto": 4,
          "Carta de liberación": 5,
        };
  }, [tipoProceso]);

  // ✅ Helper para manejar errores
  const handleError = (err, context) => {
    console.error(`❌ Error en ${context}:`, err);
    
    if (err.response?.status === 401) {
      return "Tu sesión ha expirado. Por favor inicia sesión nuevamente";
    }
    if (err.response?.status === 403) {
      return "No tienes permiso para realizar esta acción";
    }
    if (err.response?.status === 404) {
      return `Recurso no encontrado`;
    }
    
    return err.response?.data?.error || err.message || `Error al ${context}`;
  };

  // Obtener plantillas
  const fetchPlantillas = async () => {
    if (!user?.id) {
      setError("Usuario no autenticado. Por favor inicia sesión");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/documentosAdmin');

      console.log(`📋 Plantillas obtenidas: ${data.length}`);

      const combined = tiposDocumentos.map((tipo) => {
        const match = data.find((d) => d.nombre_documento === tipo);
        return {
          id_plantilla: match?.id || null,
          IdTipoDoc: tipoDocumentoMap[tipo] || null,
          nombre_documento: tipo,
          nombre_archivo: match?.nombre_archivo || null,
          estado: match?.estado || 'Activo',
        };
      });

      setPlantillas(combined);
    } catch (err) {
      setError(handleError(err, "obtener plantillas"));
    } finally {
      setLoading(false);
    }
  };

  // Obtener documentos del estudiante
  const fetchDocumentos = async () => {
    if (!procesoId) {
      console.log("⚠️ No hay proceso activo, omitiendo carga de documentos");
      return;
    }

    if (!user?.id) {
      setError("Usuario no autenticado. Por favor inicia sesión");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // ✅ El backend filtra automáticamente por usuario usando el token
      const { data } = await api.get('/documentos', {
        params: { id_proceso: procesoId },
      });

      console.log(`📄 Documentos del estudiante: ${data.length}`);
      setDocumentos(data);
    } catch (err) {
      setError(handleError(err, "obtener documentos"));
    } finally {
      setLoading(false);
    }
  };

  // Subir documento
  const uploadDocumento = async (idTipoDoc, file) => {
    // Validaciones previas
    if (!file) {
      setError("No se seleccionó ningún archivo");
      return;
    }

    if (!procesoId) {
      setError("No hay proceso activo. Por favor registra un proceso primero");
      return;
    }

    if (!user?.id) {
      setError("Usuario no autenticado. Por favor inicia sesión");
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [".pdf", ".docx", ".xlsx"];
    const fileExtension = `.${file.name.toLowerCase().split(".").pop()}`;

    if (!allowedTypes.includes(fileExtension)) {
      setError("Solo se permiten archivos PDF, Word (.docx) o Excel (.xlsx)");
      return;
    }

    // Validar plantilla activa
    const plantilla = plantillas.find((p) => p.IdTipoDoc === idTipoDoc);
    if (!plantilla) {
      setError('Tipo de documento no encontrado');
      return;
    }

    if (plantilla.estado !== 'Activo') {
      setError('Este formato está bloqueado temporalmente');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("IdTipoDoc", idTipoDoc);
    formData.append("id_usuario", user.id);
    formData.append("Comentarios", "");
    formData.append("Estatus", "Pendiente");
    formData.append("id_proceso", procesoId);

    try {
      await api.post('/documentos/upload', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(`✅ Documento subido: ${file.name}`);
      setSuccess("Documento subido correctamente");
      await fetchDocumentos();
    } catch (err) {
      setError(handleError(err, "subir documento"));
    } finally {
      setLoading(false);
    }
  };

  // Eliminar documento
  const deleteDocumento = async (idDocumento) => {
    if (!idDocumento) {
      setError("ID de documento inválido");
      return;
    }

    if (!user?.id) {
      setError("Usuario no autenticado. Por favor inicia sesión");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // ✅ El backend valida automáticamente propiedad usando el token
      await api.delete(`/documentos/${idDocumento}`);

      console.log(`🗑️ Documento ${idDocumento} eliminado`);
      setSuccess("Documento eliminado correctamente");
      await fetchDocumentos();
    } catch (err) {
      setError(handleError(err, "eliminar documento"));
    } finally {
      setLoading(false);
    }
  };

  // Helper para extensión de archivo
  const getFileExtension = (filename) => {
    if (!filename) return null;
    return filename.split(".").pop().toLowerCase();
  };

  // Actualizar procesoId cuando cambia el prop
  useEffect(() => {
    setProcesoId(procesoIdProp);
  }, [procesoIdProp]);

  // Cargar plantillas cuando hay usuario
  useEffect(() => {
    if (user?.id) {
      fetchPlantillas();
    } else {
      setError("Debes iniciar sesión para ver las plantillas");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, tipoProceso]);

  // Cargar documentos cuando hay proceso activo
  useEffect(() => {
    if (procesoId && user?.id) {
      fetchDocumentos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procesoId, user?.id]);

  return {
    plantillas,
    documentos,
    procesoId,
    loading,
    error,
    success,
    uploadDocumento,
    deleteDocumento,
    getFileExtension,
    resetMessages: () => {
      setError(null);
      setSuccess(null);
    },
  };
};

export default useDocumentosEstudiante;