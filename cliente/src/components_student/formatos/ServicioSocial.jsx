import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PlantillaServicio from "../PlantillaServicio";
import { FileText } from "lucide-react";
import ModalRegistroProceso from "../../components/estudiante/ModalRegistroProceso";
import axios from "axios";
import TablaReportesMensuales from "../../components_student/TablaReportesMensuales";

const ServicioSocial = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [procesoActivo, setProcesoActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodoExpirado, setPeriodoExpirado] = useState(false);
  const [todosBloqueados, setTodosBloqueados] = useState(false);

  const reportesMensuales = Array.from({ length: 12 }, (_, index) => ({
    idTipoDoc: 7 + index,
    nombre: `Reporte Mensual ${index + 1}`,
    numeroReporte: index + 1
  }));

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchProcesoActivo = async () => {
    setLoading(true);
    setError(null);
    setPeriodoExpirado(false);
    setTodosBloqueados(false);
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const { data: periodos } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/periodos`);
      const periodoActivo = periodos.find((p) => p.EstadoActivo === "Activo");
      setPeriodoExpirado(!periodoActivo);

      const { data: formatos } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/documentosAdmin`
      );
      const hayFormatosActivos = formatos.some((f) => f.estado === "Activo");
      if (!periodoActivo && !hayFormatosActivos) setTodosBloqueados(true);

      const periodoId = periodoActivo?.IdPeriodo || (periodos.length > 0 ? periodos[periodos.length - 1].IdPeriodo : null);
      if (!periodoId) throw new Error("No hay periodos disponibles.");

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_ENDPOINT}/api/procesos/validar/${user.id}/${periodoId}`
      );

      if (data.registrado) {
        if (data.proceso.tipo_proceso === "Servicio Social") {
          setIsRegistered(true);
          setProcesoActivo(data.proceso);
        } else if (data.proceso.tipo_proceso) {
          setError(`Ya estás registrado en ${data.proceso.tipo_proceso} para este periodo.`);
          setIsRegistered(false);
          setProcesoActivo(null);
        } else {
          setIsRegistered(false);
          setProcesoActivo(data.proceso);
          setShowModal(true);
        }
      } else {
        setIsRegistered(false);
        setProcesoActivo(null);
        setShowModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al verificar el proceso.");
      setIsRegistered(false);
      setProcesoActivo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesoActivo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSuccess = async () => {
    setIsRegistered(true);
    await fetchProcesoActivo();
    handleCloseModal();
  };

  return (
    <PlantillaServicio
      titulo="Servicio Social"
      descripcion="Gestiona tu proceso de Servicio Social, sube tus 12 reportes mensuales y da seguimiento a tu progreso académico."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center"
          >
            <span>{error}</span>
          </motion.div>
        )}

        {loading && (
          <div className="text-center text-gray-500 animate-pulse">
            Verificando registro...
          </div>
        )}

        {!loading && (
          <>
            {!isRegistered && (
              <motion.button
                onClick={handleOpenModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gradient-to-r from-red-900 to-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 mb-6 shadow-md hover:from-red-800 hover:to-red-600"
              >
                <FileText className="w-5 h-5" />
                <span className="font-semibold">Registrar Servicio Social</span>
              </motion.button>
            )}

            <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gradient-to-r from-red-900 to-red-700 text-white">
                <h2 className="text-white sm:text-2xl font-semibold">
                  Reportes Mensuales Requeridos
                </h2>
              </div>

              {(periodoExpirado || todosBloqueados) && isRegistered && procesoActivo && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-t-lg text-center"
                >
                  <span>⚠️ {todosBloqueados ? "No hay periodo activo ni formatos manualmente activados. Todos los documentos están bloqueados." : "El periodo ha expirado. Los documentos manualmente activados están disponibles."}</span>
                </motion.div>
              )}

              {isRegistered && procesoActivo ? (
                <div className="p-4">
                  <TablaReportesMensuales
                    tipoProceso="Servicio Social"
                    procesoId={procesoActivo.id_proceso}
                    documentosRequeridos={reportesMensuales}
                    todosBloqueados={todosBloqueados}
                  />
                </div>
              ) : (
                <div className="p-4 text-gray-500 italic">
                  Regístrate para comenzar a subir tus reportes mensuales de Servicio Social.
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>

      {showModal && (
        <ModalRegistroProceso
          open={showModal}
          onClose={handleCloseModal}
          tipoProceso="Servicio Social"
          procesoExistente={procesoActivo}
          onSuccess={handleSuccess}
        />
      )}
    </PlantillaServicio>
  );
};

export default ServicioSocial;