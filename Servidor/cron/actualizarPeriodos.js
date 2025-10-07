import cron from "node-cron";
import pool from "../config/config.db.js";

const tareaActualizarPeriodos = () => {
  // Ejecuta cada minuto
  cron.schedule("* * * * *", async () => {
    const ahora = new Date();

    try {
      // Consultar periodos activos
      const [periodosActivos] = await pool.query(`
        SELECT IdPeriodo, FechaFin, HoraFin 
        FROM periodos 
        WHERE EstadoActivo = 'Activo'
      `);

      // Actualizar periodos vencidos
      for (const periodo of periodosActivos) {
        const fechaHoraFin = new Date(`${periodo.FechaFin}T${periodo.HoraFin}`);

        if (ahora > fechaHoraFin) {
          await pool.query(`
            UPDATE periodos SET EstadoActivo = 'Inactivo' WHERE IdPeriodo = ?
          `, [periodo.IdPeriodo]);
        }
      }
    } catch (error) {
      console.error("❌ Error al actualizar periodos automáticamente:", error);
    }
  });
};

export default tareaActualizarPeriodos;