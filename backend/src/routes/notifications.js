const express = require('express');
const router = express.Router();
const { createNotification } = require('../controllers/notificationController');

// Route pour créer une notification
router.post('/', createNotification);

module.exports = router;