const fs = require('fs');
const path = require('path');

class FileUploadController {
  async uploadINE(req, res) {
    try {
      console.log('=== UPLOAD INE START ===');
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('Archivo recibido:', {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        tempPath: req.file.path
      });

      // Crear directorio de subidas si no existe
      const uploadDir = path.join(__dirname, '../../uploads/ine');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Directorio creado:', uploadDir);
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const originalName = req.file.originalname;
      const fileExtension = path.extname(originalName);
      const fileName = `INE_${timestamp}${fileExtension}`;
      
      // Mover el archivo a la carpeta de uploads
      const filePath = path.join(uploadDir, fileName);
      fs.renameSync(req.file.path, filePath);
      
      console.log('Archivo movido a:', filePath);

      // Retornar la ruta relativa para guardar en BD
      const relativePath = `/uploads/ine/${fileName}`;
      
      console.log('Ruta relativa a guardar en BD:', relativePath);
      console.log('=== UPLOAD INE SUCCESS ===');

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
  async uploadXML(req, res) {
    try {
      console.log('=== UPLOAD XML START ===');
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('Archivo recibido:', {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        tempPath: req.file.path
      });

      // Crear directorio de subidas si no existe
      const uploadDir = path.join(__dirname, '../../uploads/xml');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Directorio XML creado:', uploadDir);
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const originalName = req.file.originalname;
      const fileExtension = path.extname(originalName);
      const fileName = `XML_${timestamp}${fileExtension}`;
      
      // Mover el archivo a la carpeta de uploads
      const filePath = path.join(uploadDir, fileName);
      fs.renameSync(req.file.path, filePath);
      
      console.log('Archivo movido a:', filePath);

      // Retornar la ruta relativa para guardar en BD
      const relativePath = `/uploads/xml/${fileName}`;
      
      console.log('Ruta relativa a guardar en BD:', relativePath);
      console.log('=== UPLOAD XML SUCCESS ===');

      res.json({
        success: true,
        filePath: relativePath,
        fileName: fileName,
        message: 'XML file uploaded successfully'
      });
    } catch (error) {
      console.error('FileUploadController.uploadXML error:', error.message);
      res.status(500).json({ error: `Error uploading XML: ${error.message}` });
    }
  }

  async uploadFactura(req, res) {
    try {
      console.log('=== UPLOAD FACTURA START ===');
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('Archivo Factura recibido:', {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        tempPath: req.file.path
      });

      // Crear directorio si no existe
      const uploadDir = path.join(__dirname, '../../uploads/facturas');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Directorio Facturas creado:', uploadDir);
      }

      // Generar nombre único
      const timestamp = Date.now();
      const originalName = req.file.originalname;
      const fileExtension = path.extname(originalName);
      const fileName = `FACTURA_${timestamp}${fileExtension}`;
      
      // Mover archivo
      const filePath = path.join(uploadDir, fileName);
      fs.renameSync(req.file.path, filePath);
      
      console.log('Archivo Factura movido a:', filePath);

      const relativePath = `/uploads/facturas/${fileName}`;
      
      console.log('Ruta relativa guardada:', relativePath);
      console.log('=== UPLOAD FACTURA SUCCESS ===');

      res.json({
        success: true,
        filePath: relativePath,
        fileName: fileName,
        message: 'Factura PDF uploaded successfully'
      });
    } catch (error) {
      console.error('FileUploadController.uploadFactura error:', error.message);
      res.status(500).json({ error: `Error uploading Factura: ${error.message}` });
    }
  }
}

module.exports = new FileUploadController();
