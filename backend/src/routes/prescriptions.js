import express from 'express';
import { authGuard, requireRole } from '../middleware/authGuard.js';
import { uploadPrescription } from '../config/cloudinary.js';
import { 
  createPrescription, 
  getAllPrescriptions, 
  updatePrescriptionStatus 
} from '../controllers/prescriptionController.js';

const router = express.Router();

// Client envoie une ordonnance
router.post('/', authGuard, uploadPrescription.single('prescription'), createPrescription);

// Admin récupère toutes les ordonnances
router.get('/', authGuard, requireRole(['admin']), getAllPrescriptions);

// Admin met à jour le statut
router.put('/:id/status', authGuard, requireRole(['admin']), updatePrescriptionStatus);

export default router;