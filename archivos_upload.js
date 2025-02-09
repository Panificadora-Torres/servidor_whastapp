const fs = require('fs');
const path = require('path');


// Función para guardar el archivo subido
function saveFile(file) {
  return new Promise((resolve, reject) => {
    const dest = path.join(__dirname, 'files', file.filename);  // Ruta donde guardar el archivo
    fs.rename(file.path, dest, (err) => {  // Mover el archivo desde la carpeta temporal
      if (err) {
        return reject(err);
      }
      resolve(dest);  // Retorna la ruta donde se guardó el archivo
    });
  });
}



// Función para convertir un archivo en Base64
function convertFileToBase64(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'base64', (err, data) => {
      if (err) {
        return reject(err);  // Si ocurre un error, lo rechazamos
      }

      // Extraer el nombre del archivo
      const fileName = filePath.split('/').pop();  // Nombre del archivo (sin la ruta)
      
      // Devolver el resultado como un objeto
      resolve({
        fileBase64: data,
        fileName: fileName
      });
    });
  });
}

module.exports = { saveFile , convertFileToBase64};  // Si esta función está en otro archivo, no olvides exportarla
