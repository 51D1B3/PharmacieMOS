const User = require('../models/User.js');
const { AppError, asyncHandler } = require('../middleware/errorHandler.js');
const logger = require('../utils/logger.js');

/**
 * @desc    Créer un nouvel utilisateur administrateur
 * @route   POST /api/admin/users
 * @access  Private (Admin)
 */
const createAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  let { nom, prenom, sexe } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Un utilisateur avec cet email existe déjà', 400, 'EMAIL_EXISTS'));
  }

  // Appliquer les valeurs par défaut si les champs ne sont pas fournis
  if (!prenom) {
    prenom = email.split('@')[0];
  }
  if (!nom) {
    nom = 'Admin';
  }
  if (!sexe) {
    sexe = 'Autre';
  }

  // Créer le nouvel utilisateur avec le rôle admin
  const adminUser = await User.create({
    nom,
    prenom,
    email,
    password,
    sexe,
    role: 'admin',
    isEmailVerified: true
  });

  // Ne pas renvoyer le mot de passe
  adminUser.password = undefined;

  logger.audit('ADMIN_CREATED', req.user, { createdUserId: adminUser._id });

  res.status(201).json({
    success: true,
    message: 'Administrateur créé avec succès',
    data: adminUser
  });
});

module.exports = { createAdmin };