import express from 'express';
const router = express.Router();
import { authGuard, requireRole } from '../middleware/authGuard.js';

router.get('/status', authGuard, requireRole(['admin']), (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ready' } });
});

export default router;