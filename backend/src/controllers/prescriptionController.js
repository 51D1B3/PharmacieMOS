const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuration multer pour les ordonnances
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/prescriptions');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, JPG et PNG sont autorisés'));
    }
  }
});

const uploadPrescription = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier téléchargé'
      });
    }

    const prescriptionData = {
      _id: uuidv4(),
      clientId: req.body.clientId || 'anonymous',
      clientName: req.body.clientName || 'Client anonyme',
      uploadDate: new Date(),
      files: req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      })),
      status: 'pending'
    };

    res.status(200).json({
      success: true,
      message: 'Ordonnance téléchargée avec succès',
      data: prescriptionData
    });
  } catch (error) {
    console.error('Erreur upload ordonnance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement de l\'ordonnance'
    });
  }
};

module.exports = {
  upload: upload.array('prescriptions', 5),
  uploadPrescription
};