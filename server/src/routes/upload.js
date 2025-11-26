const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fileUploadController = require('../controllers/FileUploadController');

// Configurar multer para manejar subidas de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Solo permitir PDFs
  const allowedMimes = ['application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const xmlFilter = (req, file, cb) => {
  // Permitir archivos XML Y PDF para XML (como lo solicitaste)
  const allowedMimes = ['application/xml', 'text/xml', 'application/pdf'];
  const allowedExtensions = ['.xml', '.pdf'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos XML o PDF'), false);
  }
};

const pdfFilter = (req, file, cb) => {
  // Permitir archivos PDF
  const allowedMimes = ['application/pdf'];
  if (allowedMimes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo
});

const uploadXML = multer({
  storage: storage,
  fileFilter: xmlFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo para XML (ahora soporta PDF también)
});

const uploadFactura = multer({
  storage: storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo para Factura
});

// Ruta para subir INE
router.post('/ine', upload.single('file'), fileUploadController.uploadINE);

// Ruta para subir XML
router.post('/xml', uploadXML.single('file'), fileUploadController.uploadXML);

// Ruta para subir Factura PDF
router.post('/factura', uploadFactura.single('file'), fileUploadController.uploadFactura);

module.exports = router;
