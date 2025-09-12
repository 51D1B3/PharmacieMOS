// backend/middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Configuration du stockage Multer pour Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "pharmacie",                  // dossier Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // formats autorisés
  },
});

// Filtre pour n'accepter que certains types d'images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    file.originalname.toLowerCase().split('.').pop()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Erreur : Seuls les fichiers image (jpeg, jpg, png, webp) sont autorisés !'));
};

// Initialisation de Multer avec stockage Cloudinary et filtre
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter
});

export default upload;
