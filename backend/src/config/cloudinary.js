import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Storage pour les ordonnances
const prescriptionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'prescriptions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  },
});

export const uploadPrescription = multer({ 
  storage: prescriptionStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export default cloudinary;