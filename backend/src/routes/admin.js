import express from 'express';
import { authGuard, requireRole } from '../middleware/authGuard.js';
import { createAdmin } from '../controllers/adminController.js';
import { validateBody } from '../middleware/errorHandler.js';
import Joi from 'joi';

const router = express.Router();

// Schéma de validation pour la création d'un admin (email/password uniquement)
const createAdminSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8)
});

// Route pour vérifier le statut (existante)
router.get('/health', authGuard, requireRole(['admin']), (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

// Nouvelle route pour créer un administrateur
router.post(
    '/users',
    authGuard,
    requireRole(['admin']),
    validateBody(createAdminSchema),
    createAdmin
);

export default router;