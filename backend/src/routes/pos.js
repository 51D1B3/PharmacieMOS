const express = require('express');
const router = express.Router();
const { authGuard, requireRole } = require('../middleware/authGuard');

router.get('/status', authGuard, requireRole(['admin']), (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ready' } });
});

module.exports = router;


