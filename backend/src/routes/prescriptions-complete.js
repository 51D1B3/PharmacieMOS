import express from 'express';
import multer from 'multer';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import { getIO } from '../socket/socketHandler.js';

const router = express.Router();

// Configuration multer pour Cloudinary (simulation)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Middleware d'authentification
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token requis' });
    }
    
    // Décoder le token (version simplifiée)
    const user = await User.findOne({ email: 'test@test.com' }); // Remplacer par décodage JWT réel
    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    req.user = {
      id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// POST /api/prescriptions - Envoyer une ordonnance
router.post('/', authMiddleware, upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image requise' });
    }

    // Simuler upload Cloudinary
    const cloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/v1/${Date.now()}.jpg`;

    // Créer la prescription en base
    const prescription = await Prescription.create({
      clientId: req.user.id,
      clientName: `${req.user.prenom} ${req.user.nom}`,
      clientEmail: req.user.email,
      imageUrl: cloudinaryUrl,
      fileName: req.file.originalname,
      status: 'pending'
    });

    // Peupler les données client
    await prescription.populate('clientId', 'nom prenom email');
    
    // Notification temps réel aux admins via WebSocket
    try {
      const io = getIO();
      io.to('admin').emit('new-prescription', {
        id: prescription._id,
        clientName: prescription.clientName,
        clientEmail: prescription.clientEmail,
        imageUrl: prescription.imageUrl,
        submittedAt: prescription.submittedAt,
        message: `Nouvelle ordonnance de ${prescription.clientName}`
      });
      console.log('🔔 Notification envoyée aux admins');
    } catch (error) {
      console.log('⚠️ WebSocket non disponible');
    }

    console.log('✅ Ordonnance reçue et sauvegardée:', prescription._id);

    res.status(201).json({
      success: true,
      message: 'Ordonnance envoyée avec succès',
      data: prescription
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur: ' + error.message
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
      data: { prescriptions }
    });
  } catch (error) {
    console.error('Erreur prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement'
    });
  }
});

// PUT /api/prescriptions/:id - Valider une prescription (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Ordonnance non trouvée'
      });
    }

    // Mettre à jour la prescription
    prescription.status = status || 'validated';
    prescription.description = description || '';
    prescription.validatedAt = new Date();
    prescription.validatedBy = 'admin';
    
    const updatedPrescription = await prescription.save();
    await updatedPrescription.populate('clientId', 'nom prenom email');

    // Notification temps réel au client
    try {
      const io = getIO();
      io.to('client').emit('prescription-validated', {
        prescriptionId: id,
        status: updatedPrescription.status,
        description: updatedPrescription.description,
        message: 'Votre ordonnance a été validée'
      });
      console.log('🔔 Notification envoyée au client');
    } catch (error) {
      console.log('⚠️ WebSocket non disponible');
    }

    console.log('✅ Prescription validée:', id);

    res.json({
      success: true,
      message: 'Ordonnance validée avec succès',
      data: updatedPrescription
    });
  } catch (error) {
    console.error('❌ Erreur validation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation'
    });
  }
});

export default router;