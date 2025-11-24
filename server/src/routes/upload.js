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

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo
});

// Ruta para subir INE
router.post('/ine', upload.single('file'), fileUploadController.uploadINE);

module.exports = router;
