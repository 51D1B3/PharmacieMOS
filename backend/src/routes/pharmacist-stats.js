import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/pharmacist/stats
router.get('/stats', auth, async (req, res) => {
  try {
    res.json({
      totalSales: 0,
      totalPrescriptions: 0,
      lowStockItems: 0,
      todayRevenue: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/pharmacist/recent-prescriptions
router.get('/recent-prescriptions', auth, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/pharmacist/recent-sales
router.get('/recent-sales', auth, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;