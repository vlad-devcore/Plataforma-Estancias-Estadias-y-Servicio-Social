import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar las variables de entorno
dotenv.config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
  try {
    // Realizar una consulta simple para verificar la conexión
    const [rows] = await pool.execute('SELECT 1 + 1 AS result');
    console.log('Conexión exitosa a la base de datos:', rows[0].result);
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
};

// Ejecutar el test de conexión
testConnection();

export default pool;
