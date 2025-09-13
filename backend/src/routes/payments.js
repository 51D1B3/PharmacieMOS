import express from 'express';
const router = express.Router();
import { authGuard } from '../middleware/authGuard.js';

router.post('/intent', authGuard, (req, res) => {
  res.status(200).json({ success: true, data: { clientSecret: 'stub' } });
});

export default router;