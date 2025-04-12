import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import morgan from 'morgan';
import { fileURLToPath } from "url"; // Importar fileURLToPath para obtener __dirname
import userRouter from "./routes/users.js"; // Importa las rutas de usuarios
import estudianteRouter from "./routes/estudiantes.js"; // Importa las rutas de estudiantes
import empresaRouter from "./routes/empresas.js"; // Importa las rutas de empresas
import documentoRouter from "./routes/documentos.js"; // Importa las rutas de documentos
import authRouter from './routes/auth.js'; // Importa las rutas de autenticación
import documentosAdminRouter from './routes/documentosAdmin.js'; // Importa las rutas de documentosAdmin
import periodosRouter from './routes/periodos.js'; // Importa las rutas de periodos
import procesoRouter from './routes/proceso.js'; // Importa las rutas de procesos
import programasRouter from './routes/programas.js'; // Importa las rutas de programas

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 9999; 

// Obtener __dirname en módulos de ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear la carpeta "uploads" si no existe
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log("Carpeta 'uploads' creada automáticamente.");
}

// ✅ Configurar CORS para permitir peticiones desde el cliente
app.use(cors({
    origin: "http://localhost:3000", 
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

// ✅ Montar rutas
app.use("/api/users", userRouter);
app.use("/api/estudiantes", estudianteRouter);
app.use("/api/empresas", empresaRouter);
app.use("/api/documentos", documentoRouter);
app.use("/api/documentosAdmin", documentosAdminRouter); // Montar las rutas de documentosAdmin
app.use("/api/periodos", periodosRouter); 
// Montar las rutas de autenticación
app.use('/api/auth', authRouter);
app.use("/api/proceso", procesoRouter); // Montar las rutas de procesos
app.use("/api/programas", programasRouter); // Montar las rutas de programas

// ✅ Ruta de prueba
app.get("/", (req, res) => {
    res.send("¡Servidor funcionando! 🚀");
});

// ✅ Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});
