const express = require("express");
const multer = require("multer");
const path = require("path");

const fs = require("fs");
const { initializeWhatsAppClient, sendMessage, isClientInitialized, isSessionActive, checkPortsAndSendMessage } = require("./funtions");

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

// Ruta para obtener el estado del cliente
app.get("/client-status", (req, res) => {
  if (isClientInitialized()) {
    res.send("Cliente de WhatsApp está inicializado.");
  } else {
    res.send("Cliente de WhatsApp no está inicializado.");
  }
});

app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
  setInterval(checkPortsAndSendMessage, 30000); // Verifica cada 5 segundos
});

//node app.js
//curl --location 'http://127.0.0.1:9090/initialize'
