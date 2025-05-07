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



function convertFileToBase64(filePath) {
  return new Promise((resolve, reject) => {
    // Validar que el path esté dentro de un directorio seguro (por ejemplo, './uploads')
    const safeBaseDir = path.resolve('./files');
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(safeBaseDir)) {
      return reject(new Error('Ruta no permitida'));
    }

    fs.readFile(resolvedPath, 'base64', (err, data) => {
      if (err) {
        return reject(err);
      }

      const fileName = path.basename(filePath); // Compatible cross-platform
      resolve({
        fileBase64: data,
        fileName: fileName
      });
    });
  });
}

module.exports = { saveFile , convertFileToBase64};  // Si esta función está en otro archivo, no olvides exportarla
