import express from 'express';
import Prescription from '../models/Prescription.js';
import Product from '../models/Product.js';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configuration multer simple pour stockage local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:\\Users\\51D1B3\\MesProjets\\Pharmacie\\backend\\uploads\\prescriptions\\');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Soumettre une nouvelle ordonnance
router.post('/', upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }

    const prescription = new Prescription({
      clientName: 'Client',
      clientEmail: 'client@example.com',
      imageUrl: `/uploads/prescriptions/${req.file.filename}`,
      fileName: req.file.originalname,
      status: 'pending'
    });

    await prescription.save();
    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ajouter des médicaments à une ordonnance
router.post('/:id/medications', async (req, res) => {
  try {
    const { medications } = req.body;
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });
    }

    let totalAmount = 0;
    const processedMedications = [];

    for (const med of medications) {
      const product = await Product.findById(med.productId);
      if (product) {
        const available = product.stock >= med.quantity;
        processedMedications.push({
          productId: med.productId,
          name: product.name,
          quantity: med.quantity,
          price: product.price,
          available
        });
        if (available) {
          totalAmount += product.price * med.quantity;
        }
      }
    }

    prescription.medications = processedMedications;
    prescription.totalAmount = totalAmount;
    prescription.status = 'validated';
    await prescription.save();

    // Notification WebSocket au client
    const io = req.app.get('io');
    if (io) {
      io.emit('prescription-validated', prescription);
    }

    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confirmer préparation
router.put('/:id/prepare', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });
    }

    // Réduire le stock
    for (const med of prescription.medications) {
      if (med.available) {
        await Product.findByIdAndUpdate(med.productId, {
          $inc: { stock: -med.quantity }
        });
      }
    }

    prescription.status = 'prepared';
    await prescription.save();

    // Notification au client
    const io = req.app.get('io');
    if (io) {
      io.to(`client-${prescription.clientId}`).emit('prescription-ready', prescription);
    }

    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Traiter le paiement
router.post('/:id/payment', async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });
    }

    prescription.paymentStatus = 'paid';
    prescription.paymentMethod = paymentMethod;
    prescription.status = 'delivered';
    await prescription.save();

    res.json({ success: true, message: 'Paiement confirmé', data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer toutes les ordonnances
router.get('/all', async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .sort({ createdAt: -1 })
      .populate('clientId', 'nom prenom email')
      .populate('medications.productId');
    
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer les ordonnances d'un client
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    const prescriptions = await Prescription.find({ clientId })
      .sort({ createdAt: -1 })
      .populate('medications.productId');
    
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;