import express from 'express';
const router = express.Router();
import { authGuard } from '../middleware/authGuard.js';

// Stubs basiques pour éviter 404
router.get('/', authGuard, (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

export default router;