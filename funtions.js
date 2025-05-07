const fs = require('fs');
const wppconnect = require('@wppconnect-team/wppconnect');

const multer = require('multer');


let whatsappClient = null; // Variable para almacenar el cliente de WhatsApp

// Inicializa el cliente de WhatsApp
async function initializeWhatsAppClient(sessionName = 'sessionName') {
  try {
    const client = await wppconnect.create({
      session: sessionName, // Nombre de la sesión
      catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        //console.log('Número de intentos para leer el código QR: ', attempts);
        //console.log('Código QR en terminal: ', asciiQR);
        //console.log('Imagen en base64 del código QR: ', base64Qrimg);
        //console.log('Código de URL (data-ref): ', urlCode);

        // Guardar el QR como archivo si es necesario
        saveQRCodeToFile(base64Qrimg);
      },
      statusFind: (statusSession, session) => {
        console.log('Estado de la sesión: ', statusSession);
        console.log('Nombre de la sesión: ', session);
      },
      headless: false, // Usar navegador con interfaz gráfica
      devtools: false,
      useChrome: true,
      debug: true, // Habilitar depuración
      logQR: true, // Mostrar QR en la terminal
    });

    whatsappClient = client; // Guardar el cliente para uso posterior

    //start_bot_test(client);

    console.log('Cliente creado correctamente');
  } catch (error) {
    console.error('Error al crear el cliente:', error);
  }
}

// Verifica si la sesión está activa y el cliente está inicializado
async function isSessionActive(sessionName = 'sessionName') {
  try {
    const client = await wppconnect.create({
      session: sessionName,
      headless: false, // Iniciar en modo headless para no mostrar el navegador
      debug: false,  // Deshabilitar la depuración
      logQR: false,  // No mostrar el QR
    });

    start_bot_test(client);

    const token = await client.getSessionTokenBrowser(); // Obtiene el token de la sesión
    if (token) {
      console.log('Sesión activa con token:', token);

      whatsappClient = client; // Actualiza el cliente

      return true; // La sesión está activa
    } else {
      console.log('Sesión no activa');
      return false; // La sesión no está activa
    }
  } catch (error) {
    console.error('Error al verificar la sesión:', error);
    return false; // Error al verificar la sesión
  }
}

// Guardar el QR en un archivo PNG
function saveQRCodeToFile(base64Qrimg) {
  const matches = base64Qrimg.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync('qr_code.png', buffer, 'binary');
    console.log('QR guardado como qr_code.png');
  } else {
    console.log('No se pudo procesar el QR');
  }
}

// Función para enviar un mensaje
async function sendMessage(phone, message) {
  if (!whatsappClient) {
    console.error('Cliente no inicializado. Por favor, crea una sesión primero.');
    return;
  }

  try {
    const result = await whatsappClient.sendText(`${phone}@c.us`, message);
    console.log('Mensaje enviado:', result);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
  }
}

async function sendUbicacion(phone) {
  if (!whatsappClient) {
    console.error('Cliente no inicializado. Por favor, crea una sesión primero.');
    return;
  }

  try {
    const result = await whatsappClient.sendLocation(`${phone}@c.us`, '-12.017790495513085', '-76.93507909477658', 'Ubicación en Perú')
    console.log('Mensaje enviado:', result);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
  }


}

async function send_file_base64(phone, base64File, fileName) {
  if (!whatsappClient) {
    console.error('Cliente no inicializado. Por favor, crea una sesión primero.');
    return;
  }

  try {
    const result = await whatsappClient.sendFileFromBase64(`${phone}@c.us`, base64File, fileName, 'Aquí está el archivo')
    console.log('Mensaje enviado:', result);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
  }
}

async function send_file(phone, base64File, fileName) {
  if (!whatsappClient) {
    console.error('Cliente no inicializado. Por favor, crea una sesión primero.');
    return;
  }

  try {
    const result = await whatsappClient.sendFileFromBase64(`${phone}@c.us`, base64File, fileName, 'Aquí está el archivo')
    console.log('Mensaje enviado:', result);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
  }
}



// Verifica si el cliente está inicializado
function isClientInitialized() {
  return whatsappClient !== null;
}
function start_bot_test(client) {
  console.log('Starting bot...');
  client.onMessage(async (msg) => {
    try {
      console.log("MENSAJE RECIBIDO ");
      //console.log(msg);
      console.log(msg.chatId);
      console.log(msg.sender.id);
      console.log(typeof (msg));
      if (msg.body == '!ping') {
        // Send a new message to the same chat
        client.sendText(msg.from, 'pong');
      } else if (msg.body == '!ping reply') {
        // Send a new message as a reply to the current one

        client.reply(msg.from, 'pong', msg.id.toString());
      } else if (msg.body == '!chats') {
        const chats = await client.getAllChats();

        console.log("CHATS");
        console.log(chats);
        console.log("CHATS");
        client.sendText(msg.from, `The bot has ${chats.length} chats open.`);
      } else if (msg.body == '!info') {
        let info = await client.getHostDevice();
        let message = `_*Connection info*_\n\n`;
        message += `*User name:* ${info.pushname}\n`;
        message += `*Number:* ${info.wid.user}\n`;
        message += `*Battery:* ${info.battery}\n`;
        message += `*Plugged:* ${info.plugged}\n`;
        message += `*Device Manufacturer:* ${info.phone.device_manufacturer}\n`;
        message += `*WhatsApp version:* ${info.phone.wa_version}\n`;
        client.sendText(msg.from, message);
      } else if (msg.body.startsWith('!sendto ')) {
        // Direct send a new message to specific id
        let number = msg.body.split(' ')[1];
        let messageIndex = msg.body.indexOf(number) + number.length;
        let message = msg.body.slice(messageIndex, msg.body.length);
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        client.sendText(number, message);
      } else if (msg.body.startsWith('!pin ')) {
        let option = msg.body.split(' ')[1];
        if (option == 'true') {
          await client.pinChat(msg.from, true);
        } else {
          await client.pinChat(msg.from, false);
        }
      } else if (msg.body.startsWith('!typing ')) {
        const option = msg.body.split(' ')[1];
        if (option == 'true') {
          // Start typing...
          await client.startTyping(msg.from);
        } else {
          // Stop typing
          await client.stopTyping(msg.from);
        }
      } else if (msg.body.startsWith('!ChatState ')) {
        const option = msg.body.split(' ')[1];
        if (option == '1') {
          await client.setChatState(msg.from, '0');
        } else if (option == '2') {
          await client.setChatState(msg.from, '1');
        } else {
          await client.setChatState(msg.from, '2');
        }
      } else if (msg.body.startsWith('!btn')) {
        await client.sendMessageOptions(msg.from, 'test', {
          title: "WOMEN'S JEANS PANTS",
          footer: 'Choose an option below',
          isDynamicReplyButtonsMsg: true,
          dynamicReplyButtons: [
            {
              buttonId: 'idYes',
              buttonText: {
                displayText: 'YES',
              },
              type: 1,
            },
            {
              buttonId: 'idNo',
              buttonText: {
                displayText: 'NO',
              },
              type: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
}

//OTRAS FUNCIONES
const TARGET_PHONE = "51993215845"
const TARGET_PHONE2 = "51963565310"
const MESSAGE_TEXT = "SE CAYO LOS 2 SERVIDORES"

function isPortOpen(port) {
  return new Promise((resolve) => {
    const net = require("net");
    const socket = new net.Socket();

    socket.setTimeout(2000); // Timeout de 2 segundos

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      resolve(false);
    });

    socket.connect(port, "127.0.0.1");
  });
}


// Variables globales para llevar el control del estado de la caída
let serverDownTimestamp = null;
let hasSentInitial = false;
let hasSent5Min = false;
let hasSent10Min = false;
let hasSent30Min = false;

// Función auxiliar para construir el mensaje completo de estado
function buildStatusMessage(port5000Open, port5050Open, port8000Open, extra = "") {
  const line5000 = `${port5000Open ? "ACTIVO" : "INACTIVO"}\nSERVIDOR 5000 BACKEND${extra ? " " + extra : ""}`;
  const line5050 = `${port5050Open ? "ACTIVO" : "INACTIVO"}\nSERVIDOR 5050 IMPRESORA${extra ? " " + extra : ""}`;
  const line8000 = `${port8000Open ? "ACTIVO" : "INACTIVO"}\nSERVIDOR 8000 FROTEND${extra ? " " + extra : ""}`;
  return `${line5000}\n${line5050}\n${line8000}`;
}

async function checkPortsAndSendMessage() {
  try {
    const port5000Open = await isPortOpen(5000);
    const port5050Open = await isPortOpen(5050);
    const port8000Open = await isPortOpen(8000);

    // Se considera que el "servidor" está caído si alguno de los puertos está cerrado.
    const serverDown = (!port5000Open || !port5050Open || !port8000Open);

    if (serverDown) {
      // Si es la primera detección de caída, se guarda el timestamp y se envía el mensaje inicial.
      if (serverDownTimestamp === null) {
        serverDownTimestamp = Date.now();
        if (whatsappClient) {
          const message = buildStatusMessage(port5000Open, port5050Open, port8000Open);
          console.log("Enviando mensajes iniciales:", message);
          await sendMessage(TARGET_PHONE, message);
          await sendMessage(TARGET_PHONE2, message);
          hasSentInitial = true;
        }
      } else {
        // Se calcula el tiempo transcurrido desde que se detectó la caída.
        const elapsed = Date.now() - serverDownTimestamp;

        // A los 5 minutos se envía un mensaje (si aún no se envió).
        if (elapsed >= 5 * 60 * 1000 && !hasSent5Min) {
          if (whatsappClient) {
            const message = buildStatusMessage(port5000Open, port5050Open, port8000Open, "- 5 min");
            console.log("Enviando notificación a los 5 minutos:", message);
            await sendMessage(TARGET_PHONE, message);
            await sendMessage(TARGET_PHONE2, message);
          }
          hasSent5Min = true;
        }

        // A los 10 minutos se envía otro mensaje (si aún no se envió).
        if (elapsed >= 10 * 60 * 1000 && !hasSent10Min) {
          if (whatsappClient) {
            const message = buildStatusMessage(port5000Open, port5050Open, port8000Open, "- 10 min");
            console.log("Enviando notificación a los 10 minutos:", message);
            await sendMessage(TARGET_PHONE, message);
            await sendMessage(TARGET_PHONE2, message);
          }
          hasSent10Min = true;
        }

        // A los 30 minutos se envía otro mensaje (si aún no se envió).
        if (elapsed >= 30 * 60 * 1000 && !hasSent30Min) {
          if (whatsappClient) {
            const message = buildStatusMessage(port5000Open, port5050Open, port8000Open, "- 30 min");
            console.log("Enviando notificación a los 30 minutos:", message);
            await sendMessage(TARGET_PHONE, message);
            await sendMessage(TARGET_PHONE2, message);
          }
          hasSent30Min = true;
        }
      }
    } else {
      // Si el servidor vuelve a estar activo y previamente se detectó una caída,
      // se envía un mensaje de recuperación y se reinician las variables de control.
      if (serverDownTimestamp !== null) {
        if (whatsappClient) {
          const message = buildStatusMessage(port5000Open, port5050Open, port8000Open);
          console.log("Servidor activo. Enviando mensaje de recuperación:", message);
          await sendMessage(TARGET_PHONE, message);
          await sendMessage(TARGET_PHONE2, message);
        }
        serverDownTimestamp = null;
        hasSentInitial = false;
        hasSent5Min = false;
        hasSent10Min = false;
        hasSent30Min = false;
      }
    }
  } catch (error) {
    console.error("Error en verificación de puertos:", error);
  }
}



module.exports = { initializeWhatsAppClient, sendMessage, isClientInitialized, isSessionActive, sendUbicacion, send_file_base64, send_file, checkPortsAndSendMessage };
