const express = require('express');
const router = express.Router();
const { authGuard } = require('../middleware/authGuard');

router.post('/intent', authGuard, (req, res) => {
  res.status(200).json({ success: true, data: { clientSecret: 'stub' } });
});

module.exports = router;


