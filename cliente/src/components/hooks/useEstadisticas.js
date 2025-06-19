import { useState, useEffect } from 'react';
import axios from 'axios';

const useEstadisticas = () => {
  const [estadisticas, setEstadisticas] = useState({
    periodoActual: {
      EstanciaI: 0,
      EstanciaII: 0,
      Estadias: 0,
      ServicioSocial: 0,
      EstadiasNacionales: 0,
    },
    globales: {
      totalUsuarios: 0,
      EstanciaI: 0,
      EstanciaII: 0,
      Estadias: 0,
      ServicioSocial: 0,
      EstadiasNacionales: 0,
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
        const { data: periodos } = await axios.get('http://189.203.249.19:9999/api/periodos');
        const periodoActivo = periodos.find((p) => p.EstadoActivo === 'Activo');
        if (!periodoActivo) throw new Error('No hay periodo activo');

        // Obtener procesos
        const { data: procesos } = await axios.get('http://189.203.249.19:9999/api/procesos');

        // Obtener total de usuarios
        const { data: estudiantes } = await axios.get('http://189.203.249.19:9999/api/estudiantes');

        // Calcular estadísticas
        const tiposProceso = [
          'Estancia I',
          'Estancia II',
          'Estadías',
          'Servicio Social',
          'Estadías Nacionales',
        ];

        const periodoActual = {
          EstanciaI: 0,
          EstanciaII: 0,
          Estadias: 0,
          ServicioSocial: 0,
          EstadiasNacionales: 0,
        };

        const globales = {
          totalUsuarios: estudiantes.length,
          EstanciaI: 0,
          EstanciaII: 0,
          Estadias: 0,
          ServicioSocial: 0,
          EstadiasNacionales: 0,
        };

        // Contar procesos por tipo
        procesos.forEach((proceso) => {
          const tipo = proceso.tipo_proceso;
          // Ignorar procesos sin tipo_proceso (incompletos)
          if (tipo && tiposProceso.includes(tipo)) {
            // Normalizar nombres para las claves
            const clave = tipo
              .replace('Estancia I', 'EstanciaI')
              .replace('Estancia II', 'EstanciaII')
              .replace('Estadías', 'Estadias')
              .replace('Servicio Social', 'ServicioSocial')
              .replace('Estadías Nacionales', 'EstadiasNacionales');

            // Contar para estadísticas globales
            globales[clave] += 1;

            // Contar para periodo actual
            if (proceso.id_periodo === periodoActivo.IdPeriodo) {
              periodoActual[clave] += 1;
            }
          }
        });

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