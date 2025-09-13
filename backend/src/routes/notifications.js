import express from 'express';
const router = express.Router();
import { createNotification } from '../controllers/notificationController.js';

// Route pour créer une notification
router.post('/', createNotification);

export default router;
