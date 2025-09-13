import express from 'express';
const router = express.Router();
import { authGuard, requireRole } from '../middleware/authGuard.js';
import { uploadPrescription } from '../config/cloudinary.js';
import { 
  submitPrescription, 
  getMyPrescriptions,
  getAllPrescriptions, 
  updatePrescriptionStatus 
} from '../controllers/prescriptionController.js';

// Client envoie une ordonnance
router.post('/', authGuard, uploadPrescription.single('prescription'), submitPrescription);

// Client récupère ses ordonnances
router.get('/my', authGuard, getMyPrescriptions);

// Admin récupère toutes les ordonnances
router.get('/all', authGuard, requireRole(['admin']), getAllPrescriptions);

// Admin met à jour le statut
router.put('/:id/status', authGuard, requireRole(['admin']), updatePrescriptionStatus);

export default router;