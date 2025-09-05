const express = require('express');
const router = express.Router();
const { authGuard } = require('../middleware/authGuard');

router.get('/unread-count', authGuard, async (req, res) => {
  const Chat = require('../models/Chat');
  const count = await Chat.getUnreadCount(req.userId);
  res.status(200).json({ success: true, data: { count } });
});

module.exports = router;


