const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

// Configuration du stockage pour Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Le dossier où les images seront stockées
    cb(null, 'uploads/products');
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour n'accepter que certains types d'images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new AppError('Erreur : Seuls les fichiers image (jpeg, jpg, png, gif, webp) sont autorisés !', 400));
};

// Initialisation de Multer avec la configuration
const upload = multer({
  storage: storage,
  limits: {
    // Limite de taille de fichier à 5MB
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: fileFilter
});

module.exports = upload;
