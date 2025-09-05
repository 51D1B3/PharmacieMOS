const express = require('express');
const router = express.Router();
const { authGuard, requireRole } = require('../middleware/authGuard');

router.get('/movements', authGuard, requireRole(['admin']), (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

module.exports = router;


