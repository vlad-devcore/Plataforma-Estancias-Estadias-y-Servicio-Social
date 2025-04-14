import React, { useEffect, useState } from "react";
import useEmpresas from "../hooks/useEmpresas";
import useAsesoresAcademicos from "../hooks/useAsesoresAcademicos";
import useAsesoresEmpresariales from "../hooks/useAsesoresEmpresariales";
import useProgramasEducativos from "../hooks/useProgramasEducativos";
import usePeriodos from "../hooks/usePeriodos";
import useProcesos from "../hooks/useProcesos";
import { motion } from "framer-motion";

const ModalRegistroProceso = ({ open, onClose, onSuccess, tipoProceso }) => {
  const { companies } = useEmpresas();
  const { asesoresAcademicos } = useAsesoresAcademicos();
  const { asesoresEmpresariales } = useAsesoresEmpresariales();
  const { programas } = useProgramasEducativos();
  const { getPeriodoActivo } = usePeriodos();
  const { createProceso, getProcesoByEstudiante, validarRegistroEnPeriodo } = useProcesos();

  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [yaRegistrado, setYaRegistrado] = useState(false);
  const [procesoExistente, setProcesoExistente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    empresa: "",
    asesorAcademico: "",
    asesorEmpresarial: "",
    programa: "",
    periodo: "",
  });

  useEffect(() => {
    const fetchPeriodo = async () => {
      try {
        const periodo = await getPeriodoActivo();
        setPeriodoActivo(periodo);
        setForm((prev) => ({ ...prev, periodo: periodo.IdPeriodo }));
      } catch (err) {
        console.error("Error al obtener el periodo activo:", err);
      }
    };

    if (open) {
      fetchPeriodo();
    }
  }, [open]);

  useEffect(() => {
    const validar = async () => {
      setLoading(true);
      try {
        if (periodoActivo) {
          const validacion = await validarRegistroEnPeriodo(periodoActivo.IdPeriodo);
          if (validacion.registrado) {
            setYaRegistrado(true);
            setProcesoExistente(validacion.proceso);
          }
        }
      } catch (err) {
        console.error("Error en validación de registro:", err);
      } finally {
        setLoading(false);
      }
    };

    if (periodoActivo && open) {
      validar();
    }
  }, [periodoActivo, open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await createProceso(form, tipoProceso);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error al registrar proceso:", err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-800">
          Registro en {tipoProceso}
        </h2>

        {loading ? (
          <p>Cargando...</p>
        ) : yaRegistrado ? (
          <div className="text-center">
            <p>Ya estás registrado en el periodo activo.</p>
            <p>Proceso: {procesoExistente.tipo_proceso}</p>
            {/* Aquí puedes agregar el formulario de subida de documentos */}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                name="periodo"
                value={form.periodo}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              >
                <option value="">Seleccionar periodo</option>
                {periodoActivo && (
                  <option value={periodoActivo.IdPeriodo}>
                    {`${periodoActivo.Fase} ${periodoActivo.Año}`}
                  </option>
                )}
              </select>

              <select
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              >
                <option value="">Seleccionar empresa</option>
                {companies.map((e) => (
                  <option key={e.id_empresa} value={e.id_empresa}>
                    {e.empresa_nombre}
                  </option>
                ))}
              </select>

              <select
                name="asesorAcademico"
                value={form.asesorAcademico}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              >
                <option value="">Seleccionar asesor académico</option>
                {asesoresAcademicos.map((a) => (
                  <option key={a.id_asesor} value={a.id_asesor}>
                    {a.nombre}
                  </option>
                ))}
              </select>

              <select
                name="asesorEmpresarial"
                value={form.asesorEmpresarial}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              >
                <option value="">Seleccionar asesor empresarial</option>
                {asesoresEmpresariales.map((a) => (
                  <option key={a.id_asesor_emp} value={a.id_asesor_emp}>
                    {a.nombre}
                  </option>
                ))}
              </select>

              <select
                name="programa"
                value={form.programa}
                onChange={handleChange}
                className="border rounded px-3 py-2"
              >
                <option value="">Seleccionar programa educativo</option>
                {programas.map((p) => (
                  <option key={p.id_programa} value={p.id_programa}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800"
              >
                Registrar
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ModalRegistroProceso;
