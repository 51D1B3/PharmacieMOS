const express = require('express');
const router = express.Router();
const { authGuard } = require('../middleware/authGuard');

// Stubs basiques pour éviter 404
router.get('/', authGuard, (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

module.exports = router;


