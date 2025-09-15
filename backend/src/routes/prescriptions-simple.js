import express from 'express';
import Prescription from '../models/Prescription.js';
import { uploadPrescription } from '../config/cloudinary.js';

const router = express.Router();

// Middleware d'authentification simple
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requis' });
  }
  // Pour le test, on accepte n'importe quel token
  req.user = { id: 'test-user', nom: 'Test', prenom: 'User', email: 'test@test.com' };
  next();
};

// POST /api/prescriptions - Envoyer une ordonnance
router.post('/', authMiddleware, uploadPrescription.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image requise' });
    }

    const prescription = await Prescription.create({
      clientId: req.user.id,
      clientName: `${req.user.prenom} ${req.user.nom}`,
      clientEmail: req.user.email,
      imageUrl: req.file.path,
      cloudinaryPublicId: req.file.filename
    });

    res.status(201).json({
      success: true,
      message: 'Ordonnance envoyée avec succès',
      data: prescription
    });
  } catch (error) {
    console.error('Erreur prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi'
    });
  }
});

// GET /api/prescriptions/all - Récupérer toutes les prescriptions (admin)
router.get('/all', async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('clientId', 'nom prenom email')
      .sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      data: {
        prescriptions: prescriptions
      }
    });
  } catch (error) {
    console.error('Erreur prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des prescriptions'
    });
  }
});

export default router;