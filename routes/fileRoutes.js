const express = require('express');
const multer = require('multer');
const authenticate = require('../middlewares/authenticate');
const fileController = require('../controllers/fileController');

const router = express.Router();

// Custom storage configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Apenas imagens são permitidas'), false);
  }
  cb(null, true);
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// File upload route
router.post('/upload', authenticate, upload.single('file'), fileController.uploadFile);

module.exports = router;