import { useState, useEffect } from 'react';
import axios from 'axios';

const useEstadisticas = () => {
  const [estadisticas, setEstadisticas] = useState({
    periodoActual: {
      EstanciaI: 0,
      EstanciaII: 0,
      Estadia: 0,
      ServicioSocial: 0,
      EstadiaNacional: 0,
    },
    globales: {
      totalUsuarios: 0,
      EstanciaI: 0,
      EstanciaII: 0,
      Estadia: 0,
      ServicioSocial: 0,
      EstadiaNacional: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener periodo activo
        const { data: periodos } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/periodos`);
        const periodoActivo = periodos.find((p) => p.EstadoActivo === 'Activo');
        if (!periodoActivo) throw new Error('No hay periodo activo');

        // Obtener procesos
        const { data: procesos } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/procesos`);
        console.log('Datos crudos de procesos:', procesos); // Nuevo log

        // Obtener total de usuarios
        const { data: estudiantes } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/estudiantes`);

        // Calcular estadísticas
        const tiposProceso = [
          'Estancia I',
          'Estancia II',
          'Estadía',
          'Servicio Social',
          'Estadía Nacional',
        ];

        const periodoActual = {
          EstanciaI: 0,
          EstanciaII: 0,
          Estadia: 0,
          ServicioSocial: 0,
          EstadiaNacional: 0,
        };

        const globales = {
          totalUsuarios: estudiantes.length,
          EstanciaI: 0,
          EstanciaII: 0,
          Estadia: 0,
          ServicioSocial: 0,
          EstadiaNacional: 0,
        };

        // Contar procesos por tipo
        procesos.forEach((proceso) => {
          const tipo = proceso.tipo_proceso;
          if (tipo && tiposProceso.includes(tipo)) {
            let clave = tipo
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace('Estancia I', 'EstanciaI')
              .replace('Estancia II', 'EstanciaII')
              .replace('Estadia', 'Estadia')
              .replace('Servicio Social', 'ServicioSocial')
              .replace('Estadia Nacional', 'EstadiaNacional');

            globales[clave] += 1;

            // Depuración detallada con conversión a número
            const idPeriodoProc = Number(proceso.id_periodo); // Intenta otros nombres si falla
            const idPeriodoActivo = Number(periodoActivo.IdPeriodo);
            console.log('Procesando:', proceso, 'Clave:', clave, 'id_periodo:', idPeriodoProc, 'Periodo Activo:', idPeriodoActivo);
            if (idPeriodoProc === idPeriodoActivo) {
              console.log('Coincidencia encontrada para:', clave);
              periodoActual[clave] += 1;
            }
          }
        });

        console.log('Periodos:', periodos);
        console.log('Periodo Activo:', periodoActivo);
        console.log('Procesos:', procesos);
        console.log('Estudiantes:', estudiantes);
        console.log('Periodo Actual Contadores:', periodoActual);
        console.log('Globales Contadores:', globales);

        setEstadisticas({ periodoActual, globales });
      } catch (err) {
        setError(err.response?.data?.error || 'Error al obtener estadísticas');
        console.error('Error en useEstadisticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  return { estadisticas, loading, error };
};

export default useEstadisticas;