const express = require('express');
const router = express.Router();
const { upload, uploadPrescription } = require('../controllers/prescriptionController');

// Route pour télécharger une ordonnance
router.post('/upload', upload, uploadPrescription);

module.exports = router;