<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual del Programador - Plataforma de Estancias</title>
    <style>
        @page {
            margin: 2.5cm;
            size: letter;
        }
        
        body {
            font-family: 'Calibri', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #000;
            max-width: 21.59cm;
            margin: 0 auto;
            padding: 2.5cm;
            background: white;
        }
        
        h1 {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin-top: 0;
            margin-bottom: 12pt;
            color: #000;
            text-transform: uppercase;
        }
        
        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 18pt;
            margin-bottom: 12pt;
            color: #1f4e78;
            border-bottom: 2px solid #1f4e78;
            padding-bottom: 4pt;
        }
        
        h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 14pt;
            margin-bottom: 8pt;
            color: #000;
        }
        
        h4 {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 10pt;
            margin-bottom: 6pt;
            color: #000;
        }
        
        p {
            margin-top: 0;
            margin-bottom: 8pt;
            text-align: justify;
        }
        
        ul, ol {
            margin-top: 0;
            margin-bottom: 8pt;
            padding-left: 24pt;
        }
        
        li {
            margin-bottom: 4pt;
        }
        
        .title-page {
            text-align: center;
            margin-top: 100pt;
            page-break-after: always;
        }
        
        .title-page h1 {
            font-size: 24pt;
            margin-bottom: 20pt;
        }
        
        .title-page .subtitle {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 40pt;
        }
        
        .title-page .info {
            font-size: 12pt;
            margin-top: 60pt;
        }
        
        .code-block {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-left: 4px solid #1f4e78;
            padding: 10pt;
            margin: 8pt 0;
            font-family: 'Courier New', monospace;
            font-size: 10pt;
            overflow-x: auto;
        }
        
        .note {
            background-color: #fff4e6;
            border-left: 4px solid #ff9800;
            padding: 10pt;
            margin: 8pt 0;
            font-style: italic;
        }
        
        .important {
            background-color: #ffebee;
            border-left: 4px solid #f44336;
            padding: 10pt;
            margin: 8pt 0;
            font-weight: bold;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 12pt 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8pt;
            text-align: left;
        }
        
        th {
            background-color: #1f4e78;
            color: white;
            font-weight: bold;
        }
        
        .file-structure {
            font-family: 'Courier New', monospace;
            font-size: 10pt;
            background-color: #f9f9f9;
            padding: 10pt;
            border: 1px solid #ddd;
            margin: 8pt 0;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 20pt 0;
        }
        
        .button-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }
        
        .download-btn {
            background-color: #1f4e78;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .download-btn:hover {
            background-color: #163a5f;
        }
        
        @media print {
            .button-container {
                display: none;
            }
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="button-container">
        <button class="download-btn" onclick="window.print()">📄 Imprimir / Guardar como PDF</button>
    </div>

    <!-- PORTADA -->
    <div class="title-page">
        <h1>MANUAL DEL PROGRAMADOR</h1>
        <div class="subtitle">PLATAFORMA DE ESTANCIAS, ESTADÍAS Y SERVICIO SOCIAL</div>
        <div class="info">
            <p><strong>Versión del documento:</strong> 1.0</p>
            <p><strong>Fecha:</strong> Enero 2026</p>
            <p><strong>Estado:</strong> Vigente</p>
        </div>
    </div>

    <!-- CONTENIDO -->
    <h2>1. INTRODUCCIÓN</h2>

    <h3>1.1 Nombre del sistema</h3>
    <p>Plataforma de Estancias, Estadías y Servicio Social</p>

    <h3>1.2 Propósito del sistema</h3>
    <p>La plataforma tiene como objetivo digitalizar y normalizar el proceso de gestión de documentos relacionados con estancias, estadías y servicio social. El sistema permite que los documentos previamente firmados sean cargados a la plataforma para su revisión y validación individual, hasta que todos los documentos de un proceso sean evaluados y marcados como aprobados o rechazados.</p>

    <h3>1.3 Audiencia</h3>
    <p>Este manual está dirigido a programadores que necesiten instalar, ejecutar, mantener o extender el sistema.</p>

    <hr>

    <h2>2. ARQUITECTURA DEL SISTEMA</h2>
    <p>El sistema está desarrollado con una arquitectura <strong>cliente-servidor</strong> de tres capas:</p>
    <ul>
        <li><strong>Capa de presentación:</strong> Interfaz de usuario desarrollada en React</li>
        <li><strong>Capa de lógica de negocio:</strong> API REST desarrollada en Node.js con Express</li>
        <li><strong>Capa de datos:</strong> Base de datos MySQL</li>
    </ul>

    <h3>2.1 Tecnologías principales</h3>

    <h4>Frontend</h4>
    <ul>
        <li>React</li>
        <li>Tailwind CSS</li>
        <li>JavaScript</li>
    </ul>

    <h4>Backend</h4>
    <ul>
        <li>Node.js</li>
        <li>Express.js</li>
    </ul>

    <h4>Base de datos</h4>
    <ul>
        <li>MySQL (entorno de producción)</li>
        <li>MySQL (entorno de desarrollo local)</li>
    </ul>

    <hr>

    <h2>3. REQUISITOS DEL SISTEMA</h2>

    <h3>3.1 Requisitos de software</h3>
    <p>Para ejecutar correctamente la Plataforma de Estancias, Estadías y Servicio Social se requiere el siguiente entorno:</p>

    <table>
        <tr>
            <th>Componente</th>
            <th>Versión requerida</th>
        </tr>
        <tr>
            <td>Sistema operativo</td>
            <td>Windows 10 o superior, distribuciones Linux modernas o macOS</td>
        </tr>
        <tr>
            <td>Node.js</td>
            <td>Versión 18.x o superior</td>
        </tr>
        <tr>
            <td>Administrador de paquetes</td>
            <td>npm (incluido con Node.js)</td>
        </tr>
        <tr>
            <td>Base de datos</td>
            <td>MySQL 8.x</td>
        </tr>
        <tr>
            <td>Navegador web</td>
            <td>Google Chrome, Mozilla Firefox o Microsoft Edge (última versión estable)</td>
        </tr>
    </table>

    <h3>3.2 Dependencias del frontend</h3>
    <p>El frontend está desarrollado con React y utiliza las siguientes dependencias principales:</p>

    <h4>Librería principal y navegación</h4>
    <ul>
        <li><strong>react / react-dom:</strong> Librería principal para la interfaz de usuario</li>
        <li><strong>react-router-dom:</strong> Manejo de rutas y navegación en la aplicación</li>
    </ul>

    <h4>Comunicación y datos</h4>
    <ul>
        <li><strong>axios:</strong> Cliente HTTP para comunicación con el backend</li>
    </ul>

    <h4>Estilos y animaciones</h4>
    <ul>
        <li><strong>tailwindcss:</strong> Framework de utilidades CSS</li>
        <li><strong>framer-motion:</strong> Librería de animaciones fluidas</li>
    </ul>

    <h4>Componentes de interfaz</h4>
    <ul>
        <li><strong>sweetalert2:</strong> Alertas y confirmaciones modales</li>
        <li><strong>react-icons, lucide-react, react-feather, @heroicons/react:</strong> Conjunto de iconos</li>
    </ul>

    <h4>Generación de documentos</h4>
    <ul>
        <li><strong>@react-pdf/renderer:</strong> Generación y renderizado de documentos PDF</li>
    </ul>

    <h4>Configuración</h4>
    <ul>
        <li><strong>dotenv:</strong> Gestión de variables de entorno</li>
    </ul>

    <h4>Dependencias de desarrollo</h4>
    <ul>
        <li><strong>postcss y autoprefixer:</strong> Procesamiento automático de CSS</li>
        <li><strong>eslint-plugin-react-hooks:</strong> Validación de buenas prácticas en React Hooks</li>
    </ul>

    <div class="note">
        <strong>Nota:</strong> Todas las dependencias del frontend se instalan automáticamente mediante el archivo package.json ubicado en la carpeta del cliente.
    </div>

    <h3>3.3 Dependencias del backend</h3>
    <p>El backend está desarrollado con Node.js y Express, e incluye las siguientes dependencias:</p>

    <h4>Framework y servidor</h4>
    <ul>
        <li><strong>express:</strong> Framework web para Node.js</li>
        <li><strong>cors:</strong> Control de acceso entre dominios (CORS)</li>
        <li><strong>body-parser:</strong> Procesamiento del cuerpo de solicitudes HTTP</li>
        <li><strong>morgan:</strong> Registro de solicitudes HTTP para debugging</li>
    </ul>

    <h4>Base de datos</h4>
    <ul>
        <li><strong>mysql2:</strong> Cliente MySQL con soporte para promesas</li>
    </ul>

    <h4>Seguridad y autenticación</h4>
    <ul>
        <li><strong>bcrypt:</strong> Cifrado seguro de contraseñas mediante hash</li>
        <li><strong>jsonwebtoken:</strong> Generación y validación de tokens JWT para autenticación</li>
    </ul>

    <h4>Gestión de archivos</h4>
    <ul>
        <li><strong>multer:</strong> Middleware para carga de archivos multipart/form-data</li>
    </ul>

    <h4>Comunicación</h4>
    <ul>
        <li><strong>nodemailer:</strong> Envío de correos electrónicos transaccionales</li>
    </ul>

    <h4>Tareas programadas</h4>
    <ul>
        <li><strong>node-cron:</strong> Programación y ejecución de tareas cron</li>
    </ul>

    <h4>Procesamiento de datos</h4>
    <ul>
        <li><strong>exceljs:</strong> Generación y lectura de archivos Excel</li>
        <li><strong>csv-parser / csv-parse:</strong> Procesamiento de archivos CSV</li>
        <li><strong>iconv-lite:</strong> Conversión de codificaciones de texto</li>
    </ul>

    <h4>Inteligencia artificial</h4>
    <ul>
        <li><strong>@google/generative-ai:</strong> Integración con servicios de IA generativa de Google</li>
    </ul>

    <h4>Configuración</h4>
    <ul>
        <li><strong>dotenv:</strong> Gestión de variables de entorno</li>
    </ul>

    <h4>Dependencias de desarrollo</h4>
    <ul>
        <li><strong>nodemon:</strong> Reinicio automático del servidor durante el desarrollo</li>
    </ul>

    <div class="note">
        <strong>Nota:</strong> Todas las dependencias del backend se gestionan desde el archivo package.json ubicado en la carpeta del servidor.
    </div>

    <div class="page-break"></div>

    <h2>4. INSTALACIÓN DEL SISTEMA</h2>

    <h3>4.1 Instalación del entorno</h3>
    
    <p><strong>Paso 1:</strong> Descargar e instalar Node.js desde el sitio oficial (https://nodejs.org/)</p>
    
    <p><strong>Paso 2:</strong> Verificar la instalación ejecutando en la terminal:</p>
    <div class="code-block">
node --version
npm --version
    </div>

    <p><strong>Paso 3:</strong> Instalar MySQL Server y MySQL Workbench (opcional para gestión gráfica de la base de datos)</p>

    <h3>4.2 Instalación del backend</h3>

    <p><strong>Paso 1:</strong> Acceder a la carpeta del backend:</p>
    <div class="code-block">
cd backend
    </div>

    <p><strong>Paso 2:</strong> Instalar las dependencias:</p>
    <div class="code-block">
npm install
    </div>

    <p><strong>Paso 3:</strong> Configurar el archivo .env con los datos de la base de datos local:</p>
    <div class="code-block">
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=plataforma_estancias
DB_PORT=3306
JWT_SECRET=tu_clave_secreta_jwt
EMAIL_USER=correo@ejemplo.com
EMAIL_PASS=contraseña_correo
    </div>

    <p><strong>Paso 4:</strong> Iniciar el servidor en modo desarrollo:</p>
    <div class="code-block">
npm run dev
    </div>

    <h3>4.3 Instalación del frontend</h3>

    <p><strong>Paso 1:</strong> Acceder a la carpeta del frontend:</p>
    <div class="code-block">
cd frontend
    </div>

    <p><strong>Paso 2:</strong> Instalar las dependencias:</p>
    <div class="code-block">
npm install
    </div>

    <p><strong>Paso 3:</strong> Configurar el archivo .env (si aplica):</p>
    <div class="code-block">
VITE_API_URL=http://localhost:3000
    </div>

    <p><strong>Paso 4:</strong> Iniciar la aplicación en modo desarrollo:</p>
    <div class="code-block">
npm run dev
    </div>

    <hr>

    <h2>5. BASE DE DATOS</h2>

    <h3>5.1 Descripción general</h3>
    <p>El sistema utiliza MySQL como motor de base de datos tanto en el entorno de producción como en el entorno de desarrollo local. Esto garantiza consistencia y evita problemas de compatibilidad entre ambientes.</p>

    <h3>5.2 Base de datos de producción</h3>
    <ul>
        <li><strong>Motor:</strong> MySQL 8.x</li>
        <li><strong>Ubicación:</strong> Servidor remoto de producción</li>
        <li><strong>Propósito:</strong> Almacenamiento de datos reales del sistema en operación</li>
    </ul>

    <h4>Características:</h4>
    <ul>
        <li>Configuración optimizada para rendimiento</li>
        <li>Respaldos automáticos programados</li>
        <li>Acceso controlado y seguro</li>
    </ul>

    <h3>5.3 Base de datos de desarrollo (localhost)</h3>
    <ul>
        <li><strong>Motor:</strong> MySQL 8.x</li>
        <li><strong>Ubicación:</strong> Servidor local del desarrollador</li>
        <li><strong>Propósito:</strong> Entorno de desarrollo y pruebas</li>
    </ul>

    <h4>Características:</h4>
    <ul>
        <li>Incluye tablas y registros mínimos para pruebas funcionales</li>
        <li>Permite validar procesos sin afectar el entorno de producción</li>
        <li>Datos de ejemplo pre-cargados</li>
        <li>Configuración idéntica a producción para evitar incompatibilidades</li>
    </ul>

    <div class="page-break"></div>

    <h2>6. ESTRUCTURA DEL PROYECTO</h2>

    <h3>6.1 Backend</h3>
    <div class="file-structure">
/backend
│
├── app.js                    Punto de entrada principal del servidor
├── routes/                   Definición de rutas de la API
├── controllers/              Lógica de negocio y procesamiento
├── models/                   Modelos de datos y consultas a BD
├── config/                   Configuración de la aplicación
├── middleware/               Middlewares personalizados
├── .env                      Variables de entorno (no versionado)
├── .env.example              Plantilla de variables de entorno
└── package.json              Dependencias y scripts npm
    </div>

    <h3>6.2 Frontend</h3>
    <div class="file-structure">
/frontend
│
├── src/
│   ├── components/           Componentes reutilizables de React
│   ├── pages/                Páginas/vistas principales
│   ├── services/             Servicios de comunicación con API
│   ├── utils/                Funciones auxiliares
│   ├── App.jsx               Componente raíz de la aplicación
│   └── main.jsx              Punto de entrada de React
│
├── public/                   Archivos estáticos
├── tailwind.config.js        Configuración de Tailwind CSS
├── .env                      Variables de entorno (no versionado)
├── .env.example              Plantilla de variables de entorno
└── package.json              Dependencias y scripts npm
    </div>

    <hr>

    <h2>7. FUNCIONAMIENTO GENERAL DEL SISTEMA</h2>
    <p>El flujo principal del sistema sigue los siguientes pasos:</p>

    <ol>
        <li><strong>Carga de documentos:</strong> El usuario carga documentos previamente firmados a la plataforma</li>
        <li><strong>Almacenamiento:</strong> Los documentos se almacenan en el servidor y se asocian a un proceso específico (estancia, estadía o servicio social)</li>
        <li><strong>Revisión individual:</strong> Un validador revisa cada documento de forma individual</li>
        <li><strong>Validación:</strong> Cada documento se marca como aprobado o rechazado, con observaciones si es necesario</li>
        <li><strong>Finalización:</strong> El proceso finaliza cuando todos los documentos han sido validados</li>
    </ol>

    <h3>7.1 Roles del sistema</h3>

    <h4>Usuario/Estudiante</h4>
    <ul>
        <li>Carga documentos firmados</li>
        <li>Consulta el estado de sus procesos</li>
        <li>Recibe notificaciones de validación</li>
    </ul>

    <h4>Validador</h4>
    <ul>
        <li>Revisa documentos cargados</li>
        <li>Aprueba o rechaza documentos</li>
        <li>Agrega observaciones cuando sea necesario</li>
    </ul>

    <h4>Administrador</h4>
    <ul>
        <li>Gestiona usuarios y permisos</li>
        <li>Administra procesos y configuración del sistema</li>
        <li>Genera reportes y estadísticas</li>
    </ul>

    <div class="page-break"></div>

    <h2>8. SEGURIDAD</h2>

    <h3>8.1 Autenticación y autorización</h3>

    <h4>JWT (JSON Web Tokens)</h4>
    <p>El sistema utiliza tokens JWT para autenticar usuarios y mantener sesiones seguras. Cada token contiene información del usuario y tiene un tiempo de expiración configurable.</p>

    <h4>Bcrypt</h4>
    <p>Las contraseñas se almacenan mediante hash utilizando bcrypt con salt rounds configurables. Nunca se almacenan contraseñas en texto plano.</p>

    <h4>Middleware de autenticación</h4>
    <p>Todas las rutas protegidas verifican la validez del token antes de permitir el acceso. Los tokens inválidos o expirados son rechazados automáticamente.</p>

    <h3>8.2 Protección de datos</h3>

    <h4>CORS configurado</h4>
    <p>Control de acceso desde dominios específicos para prevenir peticiones no autorizadas desde otros orígenes.</p>

    <h4>Validación de entrada</h4>
    <p>Sanitización y validación de todos los datos recibidos en el backend para prevenir inyecciones SQL y XSS.</p>

    <h4>Variables de entorno</h4>
    <p>Credenciales, claves secretas y configuración sensible se almacenan fuera del código fuente en archivos .env que no se versionan.</p>

    <h4>Multer configurado</h4>
    <p>Control de tipos de archivo, tamaño máximo y ubicación de almacenamiento para prevenir carga de archivos maliciosos.</p>

    <hr>

    <h2>9. MANTENIMIENTO Y EXTENSIONES</h2>

    <h3>9.1 Agregar nuevas funcionalidades</h3>

    <h4>Nuevas validaciones</h4>
    <p>Implementar en el backend dentro de la carpeta controllers/. Seguir el patrón existente de controladores.</p>

    <h4>Nuevas vistas</h4>
    <p>Crear componentes en frontend/src/pages/ o frontend/src/components/ según corresponda. Mantener la estructura de componentes reutilizables.</p>

    <h4>Nuevas rutas API</h4>
    <p>Definir en backend/routes/ y vincular con el controlador correspondiente. Documentar los endpoints nuevos.</p>

    <h4>Nuevos modelos de datos</h4>
    <p>Agregar en backend/models/ y actualizar la estructura de base de datos si es necesario.</p>

    <h3>9.2 Buenas prácticas</h3>
    <ul>
        <li>Documentar cualquier cambio significativo en este manual</li>
        <li>Seguir la estructura de carpetas existente</li>
        <li>Mantener la separación de responsabilidades (MVC en backend, componentes en frontend)</li>
        <li>Escribir código limpio y comentado</li>
        <li>Utilizar nombres descriptivos para variables, funciones y componentes</li>
        <li>Realizar pruebas antes de implementar en producción</li>
        <li>Actualizar las variables de entorno de ejemplo (.env.example) cuando se agreguen nuevas configuraciones</li>
        <li>Mantener las dependencias actualizadas y revisar vulnerabilidades</li>
    </ul>

    <h3>9.3 Scripts útiles</h3>

    <h4>Backend</h4>
    <div class="code-block">
npm run dev          # Inicia servidor en modo desarrollo con nodemon
npm start            # Inicia servidor en modo producción
    </div>

    <h4>Frontend</h4>
    <div class="code-block">
npm run dev          # Inicia aplicación en modo desarrollo
npm run build        # Genera build optimizado para producción
npm run preview      # Previsualiza build de producción localmente
    </div>

    <div class="page-break"></div>

    <h2>10. SOLUCIÓN DE PROBLEMAS COMUNES</h2>

    <h3>10.1 Error de conexión a base de datos</h3>
    <p><strong>Síntoma:</strong> El backend no puede conectarse a MySQL</p>
    <p><strong>Soluciones:</strong></p>
    <ul>
        <li>Verificar que MySQL esté ejecutándose</li>
        <li>Revisar las credenciales en el archivo .env</li>
        <li>Confirmar que el puerto 3306 esté disponible</li>
        <li>Verificar que la base de datos exista</li>
    </ul>

    <h3>10.2 Error de dependencias</h3>
    <p><strong>Síntoma:</strong> Errores al ejecutar npm install o npm run dev</p>
    <p><strong>Soluciones:</strong></p>
    <ul>
        <li>Eliminar carpeta node_modules y archivo package-lock.json</li>
        <li>Ejecutar nuevamente npm install</li>
        <li>Verificar la versión de Node.js instalada</li>
        <li>Limpiar caché de npm: npm cache clean --force</li>
    </ul>

    <h3>10.3 Error de CORS</h3>
    <p><strong>Síntoma:</strong> El frontend no puede comunicarse con el backend</p>
    <p><strong>Soluciones:</strong></p>
    <ul>
        <li>Verificar la configuración de CORS en el backend</li>
        <li>Confirmar que la URL del backend en el frontend sea correcta</li>
        <li>Revisar que ambos servidores estén ejecutándose</li>
    </ul>

    <h3>10.4 Problemas con archivos subidos</h3>
    <p><strong>Síntoma:</strong> Los archivos no se cargan correctamente</p>
    <p><strong>Soluciones:</strong></p>
    <ul>
        <li>Verificar permisos de escritura en la carpeta de uploads</li>
        <li>Confirmar la configuración de Multer</li>
        <li>Revisar el tamaño máximo de archivo permitido</li>
        <li>Validar el tipo de archivo</li>
    </ul>

    <hr>

    <h2>11. CONSIDERACIONES FINALES</h2>

    <p>Este manual proporciona la información necesaria para comprender, instalar, mantener y extender la Plataforma de Estancias, Estadías y Servicio Social. Cualquier modificación futura debe respetar la arquitectura actual y las buenas prácticas de desarrollo.</p>

    <h3>11.1 Recomendaciones generales</h3>
    <ul>
        <li>Mantener este documento actualizado con cada cambio significativo</li>
        <li>Realizar respaldos regulares de la base de datos</li>
        <li>Documentar nuevas funcionalidades agregadas</li>
        <li>Seguir los estándares de código establecidos</li>
        <li>Realizar revisiones de código antes de implementar cambios en producción</li>
    </ul>

    <h3>11.2 Soporte y contacto</h3>
    <p>Para reportar problemas, solicitar mejoras o consultar dudas técnicas, contactar al equipo de desarrollo responsable del proyecto.</p>

    <hr>

    <div style="text-align: center; margin-top: 40pt;">
        <p><strong>Versión del documento:</strong> 1.0</p>
        <p><strong>Última actualización:</strong> Enero 2026</p>
        <p><strong>Estado:</strong> Vigente</p>
    </div>

</body>
</html>
