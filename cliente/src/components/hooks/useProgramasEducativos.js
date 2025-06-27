import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const useProgramas = () => {
  const [programas, setProgramas] = useState([]);
  const [procesosPermitidos, setProcesosPermitidos] = useState([]);
  const [idPrograma, setIdPrograma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cargar programas educativos
  const fetchProgramas = async () => {
    try {
      const { data } = await axios.get('http://189.203.249.19:3011/programas');
      setProgramas(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar programas educativos.');
    }
  };

  // Cargar id_programa del estudiante
  const fetchIdPrograma = async () => {
    if (!user?.id) {
      setError('Usuario no autenticado.');
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://189.203.249.19:3011/estudiantes/by-user/${user.id}`
      );
      setIdPrograma(data.id_programa);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el programa educativo.');
    }
  };

  // Cargar procesos permitidos
  const fetchProcesos = async () => {
    if (!idPrograma) return;
    try {
      const { data } = await axios.get(
        `http://189.203.249.19:3011/programas/${idPrograma}/procesos`
      );
      setProcesosPermitidos(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar procesos permitidos.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProgramas(), fetchIdPrograma()]);
      setLoading(false);
    };
    init();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchProcesos();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idPrograma]);

  return {
    programas,
    procesosPermitidos,
    idPrograma,
    loading,
    error,
    fetchProgramas,
  };
};

export default useProgramas;