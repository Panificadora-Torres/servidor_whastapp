# Servidor de WhatsApp

Este servidor de WhatsApp es un servidor Express que se encarga de inicializar el cliente de WhatsApp, enviar mensajes y obtener el estado del cliente.

## Instalación

1. Instala Node.js si no lo tienes instalado.
2. Abre una terminal y ejecuta el siguiente comando para instalar las dependencias necesarias:

```
node -v
npm install express
npm install multer
```

3. Descarga el código del servidor de WhatsApp desde este repositorio.
4. Abre una terminal y ejecuta el siguiente comando para iniciar el servidor:

```
node app.js
```

5. Abre una segunda terminal y ejecuta el siguiente comando para inicializar el cliente de WhatsApp:

```
curl --location 'http://127.0.0.1:9090/initialize'
```

6. Abre una tercera terminal y ejecuta el siguiente comando para enviar un mensaje:

```
curl --location --request POST 'http://127.0.0.1:9090/send-message' --header 'Content-Type: application/json' --data-raw '{"phone": "1234567890", "message": "Hola, ¿cómo estás?"}'
```

7. Abre una cuarta terminal y ejecuta el siguiente comando para obtener el estado del cliente:

```
curl --location 'http://127.0.0.1:9090/client-status'
```

## Ejemplo de uso

### Inicialización del cliente

Para inicializar el cliente de WhatsApp, envía una solicitud POST a la ruta `/initialize` con el cuerpo de la solicitud vacío.

```
curl --location 'http://127.0.0.1:9090/initialize'

```

### Envío de mensajes

Para enviar un mensaje, envía una solicitud POST a la ruta `/send-message` con el cuerpo de la solicitud conteniendo el número de teléfono y el mensaje.

### Obtención del estado del cliente

Para obtener el estado del cliente, envía una solicitud GET a la ruta `/client-status`.
