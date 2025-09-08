const express = require('express');
const Joi = require('joi');
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} = require('../controllers/authController');
const { authGuard, refreshTokenGuard } = require('../middleware/authGuard');
const { validateBody } = require('../middleware/errorHandler');
const uploadProfile = require('../middleware/uploadProfile'); // Assurez-vous que ce chemin est correct

const router = express.Router();

// Schémas de validation
const registerSchema = Joi.object({
  nom: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Le nom est requis',
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 50 caractères'
  }),
  prenom: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Le prénom est requis',
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'string.max': 'Le prénom ne peut pas dépasser 50 caractères'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invalide',
    'string.empty': 'L\'email est requis'
  }),
  password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).messages({
    'string.empty': 'Le mot de passe est requis',
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
  }),
  telephone: Joi.string().pattern(/^\+?[0-9]{7,15}$/).messages({
    'string.pattern.base': 'Format de téléphone invalide.'
  }),
  sexe: Joi.string().valid('Homme', 'Femme', 'Autre').required().messages({
    'any.only': 'Le sexe doit être Homme, Femme ou Autre',
    'string.empty': 'Le sexe est requis'
  }),
  role: Joi.string().valid('client', 'admin').default('client').messages({
    'any.only': 'Rôle invalide'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invalide',
    'string.empty': 'L\'email est requis'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Le mot de passe est requis'
  })
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'Le refresh token est requis'
  })
});

const updateMeSchema = Joi.object({
  nom: Joi.string().min(2).max(50).messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 50 caractères'
  }),
  prenom: Joi.string().min(2).max(50).messages({
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'string.max': 'Le prénom ne peut pas dépasser 50 caractères'
  }),
  telephone: Joi.string().pattern(/^\+?[0-9]{7,15}$/).messages({
    'string.pattern.base': 'Format de téléphone invalide.'
  }),
  sexe: Joi.string().valid('F', 'M').messages({
    'any.only': 'Le sexe doit être F ou M'
  }),
  adresse: Joi.object({
    rue: Joi.string().max(200),
    ville: Joi.string().max(100),
    codePostal: Joi.string().max(10),
    pays: Joi.string().max(50)
  }),
  informationsMedicales: Joi.object({
    allergies: Joi.array().items(Joi.string()),
    conditions: Joi.array().items(Joi.string()),
    medicamentsActuels: Joi.array().items(Joi.string()),
    groupeSanguin: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  }),
  preferences: Joi.object({
    language: Joi.string().valid('fr', 'en'),
    theme: Joi.string().valid('light', 'dark'),
    notifications: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean()
    })
  })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Le mot de passe actuel est requis'
  }),
  newPassword: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).messages({
    'string.empty': 'Le nouveau mot de passe est requis',
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format d\'email invalide',
    'string.empty': 'L\'email est requis'
  })
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).messages({
    'string.empty': 'Le mot de passe est requis',
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
  })
});

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', validateBody(refreshTokenSchema), refreshTokenGuard, refreshToken);
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', validateBody(resetPasswordSchema), resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Routes protégées
router.post('/logout', authGuard, logout);
router.get('/me', authGuard, getMe);
router.put('/me', authGuard, validateBody(updateMeSchema), updateMe);
router.put('/change-password', authGuard, validateBody(changePasswordSchema), changePassword);
router.post('/resend-verification', authGuard, resendVerification);

module.exports = router;
