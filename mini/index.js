const express = require('express');
const path = require('path');

const app = express();
const PORT = 3012;

// Ruta absoluta a la carpeta dist (React build)
const distPath = path.join(__dirname, '../cliente/build');

// Servir archivos estáticos desde dist
app.use(express.static(distPath));

// Redireccionar todas las rutas a index.html (React Router soporte)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
