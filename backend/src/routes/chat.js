import express from 'express';
const router = express.Router();
import { authGuard } from '../middleware/authGuard.js';
import Chat from '../models/Chat.js';

router.get('/unread-count', authGuard, async (req, res) => {
  const count = await Chat.getUnreadCount(req.userId);
  res.status(200).json({ success: true, data: { count } });
});

export default router;