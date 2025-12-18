import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";

import userRouter from "./routes/users.js";
import estudianteRouter from "./routes/estudiantes.js";
import empresaRouter, { errorHandler } from "./routes/empresas.js";
import documentoRouter from "./routes/documentos.js";
import authRouter from "./routes/auth.js";
import documentosAdminRouter from "./routes/documentosAdmin.js";
import periodosRouter from "./routes/periodos.js";
import procesoRouter from "./routes/proceso.js";
import programasRouter from "./routes/programas.js";
import asesoresRouter from "./routes/asesores.js";
import tareaActualizarPeriodos from "./cron/actualizarPeriodos.js";
import chatbotRouter from "./routes/chatbot.js";

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT;

// __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear carpeta uploads (usar lowercase de forma consistente)
const uploadsDir = path.join(__dirname, "public", "uploads", "documentos");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cron
tareaActualizarPeriodos();

// CORS
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json());

// Morgan
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(morgan(":method :url :status - Body: :body"));

// Servir uploads (compatibilidad Uploads / uploads)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/Uploads", express.static(path.join(__dirname, "public", "Uploads")));


// Rutas
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
app.use("/api/chatbot", chatbotRouter);

// Root
app.get("/", (req, res) => {
  res.send("¡Servidor funcionando!");
});

// API root (CORREGIDO, sin carácter invisible)
app.get("/api", (req, res) => {
  res.status(200).send("API funcionando y rutas disponibles.");
});

// 404
app.use((req, res, next) => {
  const error = new Error("Ruta no encontrada");
  error.status = 404;
  next(error);
});

// Error handler
app.use(errorHandler);

// Start
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
