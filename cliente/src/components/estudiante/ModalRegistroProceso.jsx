import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import useEmpresas from "../hooks/useEmpresas";
import useAsesoresAcademicos from "../hooks/useAsesoresAcademicos";
import { motion, AnimatePresence } from "framer-motion";

const ModalRegistroProceso = ({ open, onClose, onSuccess, tipoProceso, procesoExistente }) => {
  const { companies, setSearchTerm, loading: empresasLoading } = useEmpresas();
  const { asesoresAcademicos, loading: asesoresLoading } = useAsesoresAcademicos();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [cooldown, setCooldown] = useState(5);
  const [form, setForm] = useState({
    empresa: "",
    asesorAcademico: "",
  });
  const [searchEmpresa, setSearchEmpresa] = useState("");
  const [searchAsesor, setSearchAsesor] = useState("");
  const [showEmpresaDropdown, setShowEmpresaDropdown] = useState(false);
  const [showAsesorDropdown, setShowAsesorDropdown] = useState(false);
  const empresaRef = useRef(null);
  const asesorRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (procesoExistente) {
      setForm({
        empresa: procesoExistente.id_empresa || "",
        asesorAcademico: procesoExistente.id_asesor_academico || "",
      });
      setSearchEmpresa(getNombreEmpresa(procesoExistente.id_empresa) || "");
      setSearchAsesor(getNombreAsesorAcademico(procesoExistente.id_asesor_academico) || "");
    }
    // eslint-disable-next-line 
  }, [procesoExistente]);

  useEffect(() => {
    let timer;
    if (confirmModalOpen && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [confirmModalOpen, cooldown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (empresaRef.current && !empresaRef.current.contains(e.target)) {
        setShowEmpresaDropdown(false);
      }
      if (asesorRef.current && !asesorRef.current.contains(e.target)) {
        setShowAsesorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchTerm(searchEmpresa); // Actualiza el filtro de useEmpresas
  }, [searchEmpresa, setSearchTerm]);

  const handleSearchEmpresa = (e) => {
    setSearchEmpresa(e.target.value);
    setShowEmpresaDropdown(true);
  };

  const handleSearchAsesor = (e) => {
    setSearchAsesor(e.target.value);
    setShowAsesorDropdown(true);
  };

  const selectEmpresa = (empresa) => {
    setForm({ ...form, empresa: empresa.id_empresa });
    setSearchEmpresa(empresa.empresa_nombre);
    setShowEmpresaDropdown(false);
  };

  const selectAsesor = (asesor) => {
    setForm({ ...form, asesorAcademico: asesor.id_asesor });
    setSearchAsesor(asesor.nombre);
    setShowAsesorDropdown(false);
  };

  const filteredAsesores = asesoresAcademicos.filter((a) =>
    a.nombre.toLowerCase().includes(searchAsesor.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.empresa || !form.asesorAcademico) {
      setError("Por favor, selecciona una empresa y un asesor académico.");
      return;
    }
    setError(null);
    setCooldown(5);
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmModalOpen(false);
    setLoading(true);
    try {
      if (procesoExistente) {
        await axios.put(`http://189.203.249.19:3011/procesos/${procesoExistente.id_proceso}`, {
          id_empresa: form.empresa,
          id_asesor_academico: form.asesorAcademico,
          tipo_proceso: tipoProceso,
        });
      } else {
        const { data: periodos } = await axios.get("http://189.203.249.19:3011/periodos");
        const periodoActivo = periodos.find((p) => p.EstadoActivo === "Activo");
        if (!periodoActivo) throw new Error("No hay periodo activo");

        await axios.post("http://189.203.249.19:3011/procesos", {
          id_user: user.id,
          id_empresa: form.empresa,
          id_asesor_academico: form.asesorAcademico,
          id_programa: user.id_programa,
          tipo_proceso: tipoProceso,
          id_periodo: periodoActivo.IdPeriodo,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar el proceso.");
      console.error("Error al registrar proceso:", err);
    } finally {
      setLoading(false);
    }
  };

  const getNombreEmpresa = (id) => {
    const empresa = companies.find((e) => e.id_empresa === parseInt(id));
    return empresa ? empresa.empresa_nombre : "";
  };

  const getNombreAsesorAcademico = (id) => {
    const asesor = asesoresAcademicos.find((a) => a.id_asesor === parseInt(id));
    return asesor ? asesor.nombre : "";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xl space-y-6"
      >
        <div className="bg-gradient-to-r from-red-900 to-red-700 text-white p-4 rounded-t-lg">
          <h2 className="text-white font-semibold">Registro en {tipoProceso}</h2>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-900 hover:underline">
              Cerrar
            </button>
          </motion.div>
        )}

        {loading || empresasLoading || asesoresLoading ? (
          <div className="text-center text-gray-500 animate-pulse">
            Cargando...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Buscador de empresas */}
              <div className="relative" ref={empresaRef}>
                <input
                  type="text"
                  value={searchEmpresa}
                  onChange={handleSearchEmpresa}
                  onFocus={() => setShowEmpresaDropdown(true)}
                  placeholder="Buscar empresa..."
                  autoFocus
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {showEmpresaDropdown && companies.length > 0 && (
                  <ul
                    className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
                  >
                    {companies.map((e) => (
                      <li
                        key={e.id_empresa}
                        onClick={() => selectEmpresa(e)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {e.empresa_nombre} ({e.empresa_rfc})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Buscador de asesores académicos */}
              <div className="relative" ref={asesorRef}>
                <input
                  type="text"
                  value={searchAsesor}
                  onChange={handleSearchAsesor}
                  onFocus={() => setShowAsesorDropdown(true)}
                  placeholder="Buscar asesor académico..."
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {showAsesorDropdown && filteredAsesores.length > 0 && (
                  <ul
                    className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
                  >
                    {filteredAsesores.map((a) => (
                      <li
                        key={a.id_asesor}
                        onClick={() => selectAsesor(a)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {a.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-lg hover:from-red-800 hover:to-red-600 transition-colors disabled:opacity-50 shadow-md"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrar"}
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Modal de Confirmación */}
      <AnimatePresence>
        {confirmModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirmar Registro en {tipoProceso}
              </h3>
              <p className="text-gray-600 mb-4">
                <strong>¡Importante!</strong> Una vez que confirmes, no podrás editar la empresa ni el asesor académico. Por favor, verifica los datos:
              </p>
              <ul className="text-gray-700 mb-4 space-y-2">
                <li>
                  <strong>Empresa:</strong> {getNombreEmpresa(form.empresa)}
                </li>
                <li>
                  <strong>Asesor Académico:</strong> {getNombreAsesorAcademico(form.asesorAcademico)}
                </li>
              </ul>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={cooldown > 0}
                  className={`px-4 py-2 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-lg transition-colors shadow-md ${
                    cooldown > 0 ? "opacity-50 cursor-not-allowed" : "hover:from-red-800 hover:to-red-600"
                  }`}
                >
                  {cooldown > 0 ? `Confirmar (${cooldown}s)` : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModalRegistroProceso;