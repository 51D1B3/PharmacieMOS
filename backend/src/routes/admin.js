const express = require('express');
const { authGuard, requireRole } = require('../middleware/authGuard.js');
const { createAdmin } = require('../controllers/adminController.js');
const { validateBody } = require('../middleware/errorHandler.js');
const Joi = require('joi');

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

module.exports = router;
