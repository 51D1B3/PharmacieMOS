const express = require('express');
const { authGuard, requireRole } = require('../middleware/authGuard.js');
const { uploadPrescription } = require('../config/cloudinary.js');
const { 
  createPrescription, 
  getAllPrescriptions, 
  updatePrescriptionStatus 
} = require('../controllers/prescriptionController.js');

const router = express.Router();

// Client envoie une ordonnance
router.post('/', authGuard, uploadPrescription.single('prescription'), createPrescription);

// Admin récupère toutes les ordonnances
router.get('/', authGuard, requireRole(['admin']), getAllPrescriptions);

// Admin met à jour le statut
router.put('/:id/status', authGuard, requireRole(['admin']), updatePrescriptionStatus);

module.exports = router;
