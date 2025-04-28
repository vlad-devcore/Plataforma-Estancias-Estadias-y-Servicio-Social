import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Importamos los iconos que necesitamos
import { CheckCircle, AlertCircle, BookOpen, Calendar } from 'lucide-react';

const ProgramaEducativoForm = () => {
  const [programas, setProgramas] = useState([]);
  const [idPrograma, setIdPrograma] = useState('');
  const [periodos, setPeriodos] = useState([]);
  const [idPeriodo, setIdPeriodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!idPrograma) {
      setError('Por favor selecciona un programa educativo');
      return;
    }
    
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white"
    >
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-red-100"
      >
        <motion.div variants={itemVariants} className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-red-800" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-900">
            Programa Educativo
          </h2>
          <p className="text-gray-600 mt-1">Selecciona tu programa y periodo académico</p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start"
          >
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1">
              Programa Educativo
            </label>
            {loading ? (
              <div className="w-full h-10 bg-gray-200 animate-pulse rounded-md"></div>
            ) : (
              <div className="relative">
                <select
                  value={idPrograma}
                  onChange={(e) => setIdPrograma(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Selecciona un programa</option>
                  {programas.map((p) => (
                    <option key={p.id_programa} value={p.id_programa}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-gray-700 font-medium mb-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Periodo</span>
              </div>
            </label>
            {loading ? (
              <div className="w-full h-10 bg-gray-200 animate-pulse rounded-md"></div>
            ) : (
              <div className="relative">
                <select
                  value={idPeriodo}
                  onChange={(e) => setIdPeriodo(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Selecciona un periodo</option>
                  {periodos.map((p) => (
                    <option key={p.IdPeriodo} value={p.IdPeriodo}>
                      {`${p.Fase} ${p.Año}`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <button
              type="submit"
              className="w-full bg-red-900 text-white py-2.5 rounded-md hover:bg-red-800 disabled:opacity-70 transition-colors flex items-center justify-center"
              disabled={submitting || loading}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Continuar</span>
                </div>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProgramaEducativoForm;