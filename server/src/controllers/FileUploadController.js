const fs = require('fs');
const path = require('path');

class FileUploadController {
  async uploadINE(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Crear directorio de subidas si no existe
      const uploadDir = path.join(__dirname, '../../uploads/ine');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const originalName = req.file.originalname;
      const fileExtension = path.extname(originalName);
      const fileName = `INE_${timestamp}${fileExtension}`;
      
      // Mover el archivo a la carpeta de uploads
      const filePath = path.join(uploadDir, fileName);
      fs.renameSync(req.file.path, filePath);

      // Retornar la ruta relativa para guardar en BD
      const relativePath = `/uploads/ine/${fileName}`;

      res.json({
        success: true,
        filePath: relativePath,
        fileName: fileName,
        message: 'File uploaded successfully'
      });
    } catch (error) {
      console.error('FileUploadController.uploadINE error:', error.message);
      res.status(500).json({ error: `Error uploading file: ${error.message}` });
    }
  }
}

module.exports = new FileUploadController();
