
import cron from "node-cron";
import pool from "../config/config.db.js";

const tareaActualizarPeriodos = () => {
  // Ejecuta cada minuto
  cron.schedule("* * * * *", async () => {
    const ahora = new Date();

    try {
      const [periodosActivos] = await pool.query(`
        SELECT IdPeriodo, FechaFin, HoraFin FROM periodos
        WHERE EstadoActivo = 'Activo'
      `);

      for (const periodo of periodosActivos) {
        const fechaHoraFin = new Date(`${periodo.FechaFin}T${periodo.HoraFin}`);

        if (ahora > fechaHoraFin) {
          await pool.query(`
            UPDATE periodos SET EstadoActivo = 'Inactivo' WHERE IdPeriodo = ?
          `, [periodo.IdPeriodo]);

          console.log(`✅ Periodo ${periodo.IdPeriodo} desactivado automáticamente`);
        }
      }
    } catch (error) {
      console.error("❌ Error al actualizar periodos automáticamente:", error);
    } 
  });

  console.log("🕐 Cron de actualización de periodos iniciado");
};
 
export default tareaActualizarPeriodos;

 