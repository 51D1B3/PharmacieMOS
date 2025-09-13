import express from 'express';
const router = express.Router();
import { authGuard, requireRole } from '../middleware/authGuard.js';

router.get('/movements', authGuard, requireRole(['admin']), (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

export default router;