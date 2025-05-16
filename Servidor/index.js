import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import morgan from 'morgan';
import { fileURLToPath } from "url";
import userRouter from "./routes/users.js";
import estudianteRouter from "./routes/estudiantes.js";
import empresaRouter from "./routes/empresas.js";
import documentoRouter from "./routes/documentos.js";
import authRouter from './routes/auth.js';
import documentosAdminRouter from './routes/documentosAdmin.js';
import periodosRouter from './routes/periodos.js';
import procesoRouter from './routes/proceso.js';
import programasRouter from './routes/programas.js';
import asesoresRouter from './routes/asesores.js';
import tareaActualizarPeriodos from "./cron/actualizarPeriodos.js";

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 9999;

// Obtener __dirname en módulos de ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear la carpeta "public/uploads/documentos" si no existe
const uploadsDir = path.join(__dirname, "public", "Uploads", "documentos");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Carpeta 'public/uploads/documentos' creada automáticamente.");
}

tareaActualizarPeriodos();

// Configurar CORS para permitir peticiones desde el cliente
app.use(cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
 
app.use(express.json()); // Para recibir JSON en las peticiones

// Configurar Morgan para ver el body de las solicitudes
app.use(morgan(':method :url :status - Body: :body'));

// Crear token personalizado para mostrar el body
morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

// Servir archivos estáticos desde public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'Uploads')));

// Montar rutas
app.use("/api/users", userRouter);
app.use("/api/estudiantes", estudianteRouter);
app.use("/api/empresas", empresaRouter);
app.use("/api/documentos", documentoRouter);
app.use("/api/documentosAdmin", documentosAdminRouter);
app.use("/api/periodos", periodosRouter);
app.use("/api/auth", authRouter);
app.use("/api/procesos", procesoRouter);
app.use("/api/programas", programasRouter);
app.use("/api/asesores", asesoresRouter);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("¡Servidor funcionando! 🚀");
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});