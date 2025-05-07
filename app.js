const express = require("express");
const multer = require("multer");
const path = require("path");

const fs = require("fs");
const { initializeWhatsAppClient, sendMessage, sendUbicacion, isClientInitialized, isSessionActive, send_file_base64, checkPortsAndSendMessage, send_file } = require("./funtions");
const { saveFile, convertFileToBase64 } = require("./archivos_upload");

const app = express();
const port = 9090;

app.use(express.json()); // Middleware para parsear JSON en las solicitudes

// Ruta para inicializar el cliente de WhatsApp (si no está iniciado)
app.get("/initialize", async (req, res) => {
  try {
    const sessionActive = await isSessionActive("sessionName"); // Verifica si la sesión está activa

    if (sessionActive) {
      res.send("La sesión de WhatsApp ya está activa.");
    } else {
      await initializeWhatsAppClient("sessionName"); // Si no está activa, la inicializa
      res.send("Cliente de WhatsApp inicializado correctamente.");
    }
  } catch (error) {
    res.status(500).send("Error al inicializar el cliente de WhatsApp.");
  }
});
// Ruta para enviar un mensaje
app.post("/send-message", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).send("El número de teléfono y el mensaje son requeridos.");
  }

  try {
    if (!isClientInitialized()) {
      return res.status(400).send("Cliente de WhatsApp no inicializado. Primero, inicializa el cliente.");
    }

    await sendMessage(phone, message);
    res.send("Mensaje enviado correctamente.");
  } catch (error) {
    res.status(500).send("Error al enviar el mensaje.");
  }
});

// Ruta para enviar mi ubicacion
app.post("/send-ubicacion", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).send("El número de teléfono y el mensaje son requeridos.");
  }

  try {
    if (!isClientInitialized()) {
      return res.status(400).send("Cliente de WhatsApp no inicializado. Primero, inicializa el cliente.");
    }

    await sendUbicacion(phone);
    res.send("Mensaje enviado correctamente.");
  } catch (error) {
    res.status(500).send("Error al enviar el mensaje.");
  }
});

// Ruta para obtener el estado del cliente
app.get("/client-status", (req, res) => {
  if (isClientInitialized()) {
    res.send("Cliente de WhatsApp está inicializado.");
  } else {
    res.send("Cliente de WhatsApp no está inicializado.");
  }
});

// Configuración de almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./files"); // Carpeta donde se almacenarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nombre único para cada archivo
  },
});

// Filtrado de tipos de archivos permitidos (solo PDF o imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Tipo de archivo no permitido"), false);
  }
  cb(null, true);
};

// Crear el middleware para manejar archivos
const upload = multer({ storage: storage, fileFilter: fileFilter }).single("file");

// Endpoint para recibir y almacenar archivos (solo PDF o imágenes)
app.post("/upload", upload, async (req, res) => {
  try {
    // Verificar si se proporcionó el número de teléfono
    if (!req.body.phone) {
      return res.status(400).json({ error: "No se proporcionó ningún número de teléfono" });
    }

    // Verificar si se cargó un archivo
    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó ningún archivo" });
    }

    // Archivo subido correctamente
    const filePath = await saveFile(req.file); // Asegúrate de que saveFile esté correctamente implementado
    const { fileBase64, fileName } = await convertFileToBase64(filePath); // Asegúrate de que esta función también esté implementada

    console.log("Archivo subido:", req.file);
    console.log("Número de teléfono:", req.body.phone);
    console.log("base64 del archivo:", String(fileBase64).substring(0, 10), "\n", "Nombre del archivo:", fileName);

    // Verificar si el cliente de WhatsApp está inicializado
    if (!isClientInitialized()) {
      return res.status(400).send("Cliente de WhatsApp no inicializado. Primero, inicializa el cliente.");
    }

    // Enviar el archivo a través de WhatsApp
    await send_file(req.body.phone, filePath, fileName);
    res.send("Mensaje enviado correctamente.");
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).send("Error al enviar el mensaje.");
  }
});


app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
  setInterval(checkPortsAndSendMessage, 30000); // Verifica cada 5 segundos
});

//node app.js
//curl --location 'http://127.0.0.1:9090/initialize'