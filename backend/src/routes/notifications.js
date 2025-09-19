import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;