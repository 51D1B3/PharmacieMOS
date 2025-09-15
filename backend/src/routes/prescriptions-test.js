import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuration multer pour stockage local temporaire
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../uploads/prescriptions/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Middleware d'authentification simple
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requis' });
  }
  req.user = { id: 'test-user', nom: 'Test', prenom: 'User', email: 'test@test.com' };
  next();
};

// POST /api/prescriptions - Envoyer une ordonnance
router.post('/', authMiddleware, upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image requise' });
    }

    // Simuler la sauvegarde en base
    const prescription = {
      id: Date.now(),
      clientId: req.user.id,
      clientName: `${req.user.prenom} ${req.user.nom}`,
      clientEmail: req.user.email,
      imageUrl: `/uploads/prescriptions/${req.file.filename}`,
      filename: req.file.filename,
      submittedAt: new Date()
    };

    console.log('✅ Ordonnance reçue:', prescription);

    res.status(201).json({
      success: true,
      message: 'Ordonnance envoyée avec succès',
      data: prescription
    });
  } catch (error) {
    console.error('❌ Erreur prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi: ' + error.message
    });
  }
});

// GET /api/prescriptions/all - Récupérer toutes les prescriptions (admin)
router.get('/all', async (req, res) => {
  try {
    // Simuler des données
    const prescriptions = [
      {
        _id: '1',
        clientId: { nom: 'Doe', prenom: 'John', email: 'john@test.com' },
        imageUrl: '/uploads/test.jpg',
        status: 'pending',
        submittedAt: new Date()
      }
    ];
    
    res.json({
      success: true,
      data: { prescriptions }
    });
  } catch (error) {
    console.error('❌ Erreur prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement'
    });
  }
});

export default router;