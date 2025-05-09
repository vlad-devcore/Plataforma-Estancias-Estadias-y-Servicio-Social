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

  // Definir los 12 reportes mensuales con IdTipoDoc de 7 a 18
  const reportesMensuales = Array.from({ length: 12 }, (_, index) => ({
    idTipoDoc: 7 + index, // IdTipoDoc de Reporte Mensual 1 (7) a Reporte Mensual 12 (18)
    nombre: `Reporte Mensual ${index + 1}`,
    numeroReporte: index + 1
  }));

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchProcesoActivo = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      console.log("🔍 Depuración: Iniciando fetchProcesoActivo, user.id:", user.id);

      // Obtener periodo activo
      const { data: periodos } = await axios.get("http://localhost:9999/api/periodos");
      console.log("🔍 Depuración: Periodos recibidos:", periodos);
      const periodoActivo = periodos.find((p) => p.EstadoActivo === "Activo");
      if (!periodoActivo) throw new Error("No hay periodo activo");
      console.log("🔍 Depuración: Periodo activo:", periodoActivo);

      // Validar proceso en el periodo activo
      const { data } = await axios.get(
        `http://localhost:9999/api/procesos/validar/${user.id}/${periodoActivo.IdPeriodo}`
      );
      console.log("🔐 Validación proceso (Servicio Social):", data);

      if (data.registrado) {
        if (data.proceso.tipo_proceso === "Servicio Social") {
          setIsRegistered(true);
          setProcesoActivo(data.proceso);
          console.log("🔍 Depuración: Proceso registrado como Servicio Social, procesoActivo:", data.proceso);
        } else if (data.proceso.tipo_proceso) {
          setError(`Ya estás registrado en ${data.proceso.tipo_proceso} para este periodo.`);
          setIsRegistered(false);
          setProcesoActivo(null);
          console.log("🔍 Depuración: Registrado en otro proceso:", data.proceso.tipo_proceso);
        } else {
          setIsRegistered(false);
          setProcesoActivo(data.proceso);
          setShowModal(true);
          console.log("🔍 Depuración: Proceso incompleto, mostrando modal");
        }
      } else {
        setIsRegistered(false);
        setProcesoActivo(null);
        setShowModal(true);
        console.log("🔍 Depuración: No hay proceso, mostrando modal para registrar");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al verificar el proceso.");
      setIsRegistered(false);
      setProcesoActivo(null);
      console.error("🚨 Error al verificar registro (Servicio Social):", err);
    } finally {
      setLoading(false);
      console.log("🔍 Depuración: fetchProcesoActivo finalizado, isRegistered:", isRegistered, "procesoActivo:", procesoActivo);
    }
  };

  useEffect(() => {
    console.log("🔍 Depuración: Ejecutando useEffect para fetchProcesoActivo");
    fetchProcesoActivo();
  }, []);

  useEffect(() => {
    console.log("🔍 Depuración: reportesMensuales:", reportesMensuales);
  }, [reportesMensuales]);

  const handleOpenModal = () => {
    setShowModal(true);
    console.log("🔍 Depuración: Abriendo modal");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    console.log("🔍 Depuración: Cerrando modal");
  };

  const handleSuccess = async () => {
    setIsRegistered(true);
    await fetchProcesoActivo();
    handleCloseModal();
    console.log("🔍 Depuración: Registro exitoso, actualizando proceso");
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

              {isRegistered && procesoActivo ? (
                <div className="p-4">
                  <TablaReportesMensuales
                    tipoProceso="Servicio Social"
                    procesoId={procesoActivo.id_proceso}
                    documentosRequeridos={reportesMensuales}
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