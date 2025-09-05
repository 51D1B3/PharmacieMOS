const express = require('express');
const router = express.Router();
const { authGuard, requireRole } = require('../middleware/authGuard');
const { createAdmin } = require('../controllers/adminController');
const { validateBody } = require('../middleware/errorHandler');
const Joi = require('joi');

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

module.exports = router;