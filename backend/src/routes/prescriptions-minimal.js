import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configuration multer en mémoire (pas de stockage fichier)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Middleware d'authentification simple
const authMiddleware = (req, res, next) => {
  req.user = { id: 'test-user', nom: 'Test', prenom: 'User', email: 'test@test.com' };
  next();
};

// POST /api/prescriptions - Envoyer une ordonnance
router.post('/', authMiddleware, upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image requise' });
    }

    const prescription = {
      _id: Date.now().toString(),
      clientId: {
        nom: req.user.nom,
        prenom: req.user.prenom,
        email: req.user.email
      },
      clientName: `${req.user.prenom} ${req.user.nom}`,
      clientEmail: req.user.email,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      status: 'pending',
      imageUrl: 'data:image/png;base64,placeholder',
      createdAt: new Date(),
      submittedAt: new Date()
    };

    // Ajouter à la liste
    prescriptions.unshift(prescription);
    
    console.log('✅ Ordonnance reçue:', prescription);
    console.log('📊 Total prescriptions:', prescriptions.length);

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

// Stockage temporaire des prescriptions en mémoire
let prescriptions = [
  // Prescription de test pour vérifier
  {
    _id: 'test-1',
    clientId: {
      nom: 'Doe',
      prenom: 'John', 
      email: 'john@test.com'
    },
    status: 'pending',
    imageUrl: 'test.jpg',
    createdAt: new Date(),
    submittedAt: new Date()
  }
];

// GET /api/prescriptions/all
router.get('/all', async (req, res) => {
  console.log('📊 Admin demande prescriptions, total:', prescriptions.length);
  res.json({
    success: true,
    data: { prescriptions }
  });
});

// GET /api/prescriptions/count - Compter les prescriptions en attente
router.get('/count', async (req, res) => {
  const pendingCount = prescriptions.filter(p => p.status === 'pending').length;
  console.log('🔢 Prescriptions en attente:', pendingCount);
  res.json({
    success: true,
    count: pendingCount
  });
});

export default router;