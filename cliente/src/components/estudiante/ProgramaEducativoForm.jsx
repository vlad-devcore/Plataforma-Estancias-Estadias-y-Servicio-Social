import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProgramaEducativoForm = () => {
  const [programas, setProgramas] = useState([]);
  const [idPrograma, setIdPrograma] = useState('');
  const [periodos, setPeriodos] = useState([]);
  const [idPeriodo, setIdPeriodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programasRes, periodosRes] = await Promise.all([
          axios.get('http://localhost:9999/api/programas'),
          axios.get('http://localhost:9999/api/periodos'),
        ]);
        setProgramas(programasRes.data);
        // Filtrar periodos activos
        const periodosActivos = periodosRes.data.filter((p) => p.EstadoActivo === 'Activo');
        setPeriodos(periodosActivos);
        // Seleccionar el primer periodo activo por defecto
        setIdPeriodo(periodosActivos[0]?.IdPeriodo || '');
      } catch (err) {
        setError('Error al cargar programas o periodos.');
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Crear proceso inicial
      await axios.post('http://localhost:9999/api/procesos/inicial', {
        id_user: user.id,
        id_programa: idPrograma,
        id_periodo: idPeriodo,
      });

      // Actualizar localStorage
      localStorage.setItem(
        'user',
        JSON.stringify({ ...user, id_programa: idPrograma })
      );

      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el programa educativo.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-100"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Selecciona tu programa educativo
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Programa Educativo</label>
            <select
              value={idPrograma}
              onChange={(e) => setIdPrograma(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Selecciona un programa</option>
              {programas.map((p) => (
                <option key={p.id_programa} value={p.id_programa}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Periodo</label>
            <select
              value={idPeriodo}
              onChange={(e) => setIdPeriodo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Selecciona un periodo</option>
              {periodos.map((p) => (
                <option key={p.IdPeriodo} value={p.IdPeriodo}>
                  {`${p.Fase} ${p.Año}`}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-red-900 text-white py-2 rounded-md hover:bg-red-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ProgramaEducativoForm;