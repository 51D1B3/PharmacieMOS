const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Générer les tokens d'authentification
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      permissions: user.permissions 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Envoyer la réponse avec les tokens
const sendTokenResponse = async (req, res, user, statusCode) => {
  const { accessToken, refreshToken } = generateTokens(user);

  // Ajouter le refresh token à l'utilisateur
  user.addRefreshToken(refreshToken, 'web', req.ip, req.get('User-Agent'));
  await user.save();

  // Options pour les cookies
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Envoyer les cookies
  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Réponse JSON
  res.status(statusCode).json({
    success: true,
    message: 'Authentification réussie',
    data: {
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        profileImage: user.profileImage,
        role: user.role,
        permissions: user.permissions,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        preferences: user.preferences
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m'
      }
    }
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {

  const {
    nom,
    prenom,
    email,
    password,
    sexe,
    telephone
  } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return next(new AppError('Un utilisateur avec cet email existe déjà', 400, 'EMAIL_EXISTS'));
  }

  // Gérer l'upload de l'image de profil
  let profileImagePath = null;
  if (req.file) {
    // Le chemin doit être accessible depuis le frontend
    profileImagePath = `/uploads/profiles/${req.file.filename}`;
  }

  // Créer le nouvel utilisateur
  const user = await User.create({
    nom,
    prenom,
    email,
    password,
    sexe,
    telephone,
    profileImage: profileImagePath,
    role: 'client'
  });

  // Générer le token de vérification email
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(emailVerificationToken)
    .digest('hex');
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 heures

  await user.save();

  // Envoyer l'email de vérification (à implémenter)
  // await sendEmailVerification(user.email, emailVerificationToken);

  // Logger l'inscription
  logger.audit('USER_REGISTERED', user, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Envoyer la réponse
  await sendTokenResponse(req, res, user, 201);
});

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Vérifier que l'email et le mot de passe sont fournis
  if (!email || !password) {
    return next(new AppError('Email et mot de passe requis', 400, 'MISSING_CREDENTIALS'));
  }

  // Vérifier si l'utilisateur existe
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    return next(new AppError('Email ou mot de passe incorrect', 401, 'INVALID_CREDENTIALS'));
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    return next(new AppError('Compte désactivé', 401, 'ACCOUNT_DISABLED'));
  }

  // Vérifier si le compte est verrouillé
  if (user.isLocked) {
    return next(new AppError('Compte temporairement verrouillé', 401, 'ACCOUNT_LOCKED'));
  }

  // Vérifier le mot de passe
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Incrémenter les tentatives de connexion
    await user.incrementLoginAttempts();
    
    logger.security('Tentative de connexion échouée', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return next(new AppError('Email ou mot de passe incorrect', 401, 'INVALID_CREDENTIALS'));
  }

  // Réinitialiser les tentatives de connexion
  await user.resetLoginAttempts();

  // Mettre à jour la dernière connexion
  user.lastLogin = new Date();
  user.lastLoginIp = req.ip;
  await user.save();

  // Logger la connexion
  logger.audit('USER_LOGIN', user, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Envoyer la réponse
  await sendTokenResponse(req, res, user, 200);
});

// @desc    Rafraîchir le token d'accès
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token requis', 400, 'REFRESH_TOKEN_REQUIRED'));
  }

  // Vérifier le refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
  // Vérifier si l'utilisateur existe et si le token est valide
  let user = await User.findByRefreshToken(refreshToken);
  if (!user) {
    return next(new AppError('Refresh token invalide', 401, 'INVALID_REFRESH_TOKEN'));
  }

  // Vérifier si l'utilisateur est actif
  if (!user.isActive) {
    return next(new AppError('Compte désactivé', 401, 'ACCOUNT_DISABLED'));
  }

  // Supprimer l'ancien refresh token
  user.removeRefreshToken(refreshToken);

  // Envoyer la nouvelle réponse
  await sendTokenResponse(req, res, user, 200);
});

// @desc    Déconnexion utilisateur
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Supprimer le refresh token de la base de données
    let user = await User.findByRefreshToken(refreshToken);
    if (user) {
      user.removeRefreshToken(refreshToken);
      await user.save();
    }
  }

  // Supprimer les cookies
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  // Logger la déconnexion
  if (req.user) {
    logger.audit('USER_LOGOUT', req.user, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// @desc    Obtenir le profil utilisateur actuel
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res, next) => {
  const {
    nom,
    prenom,
    telephone,
    sexe,
    adresse,
    informationsMedicales,
    preferences
  } = req.body;

  // Champs autorisés à être mis à jour
  const updateFields = {};
  if (nom) updateFields.nom = nom;
  if (prenom) updateFields.prenom = prenom;
  if (telephone) updateFields.telephone = telephone;
  if (sexe) updateFields.sexe = sexe;
  if (adresse) updateFields.adresse = adresse;
  if (informationsMedicales) updateFields.informationsMedicales = informationsMedicales;
  if (preferences) updateFields.preferences = preferences;

  const user = await User.findByIdAndUpdate(
    req.userId,
    updateFields,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -refreshTokens');

  // Logger la mise à jour
  logger.audit('USER_PROFILE_UPDATED', user, {
    updatedFields: Object.keys(updateFields),
    ip: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: {
      user
    }
  });
});

// @desc    Changer le mot de passe
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.userId).select('+password');

  // Vérifier l'ancien mot de passe
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Mot de passe actuel incorrect', 400, 'INVALID_CURRENT_PASSWORD'));
  }

  // Mettre à jour le mot de passe
  user.password = newPassword;
  await user.save();

  // Logger le changement de mot de passe
  logger.audit('PASSWORD_CHANGED', user, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: 'Mot de passe modifié avec succès'
  });
});

// @desc    Demander la réinitialisation du mot de passe
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  let user = await User.findByEmail(email);
  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet email', 404, 'USER_NOT_FOUND'));
  }

  // Générer le token de réinitialisation
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Envoyer l'email de réinitialisation (à implémenter)
  // await sendPasswordResetEmail(user.email, resetToken);

  logger.audit('PASSWORD_RESET_REQUESTED', user, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: 'Email de réinitialisation envoyé'
  });
});

// @desc    Réinitialiser le mot de passe
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hasher le token
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  let user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token de réinitialisation invalide ou expiré', 400, 'INVALID_RESET_TOKEN'));
  }

  // Mettre à jour le mot de passe
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Logger la réinitialisation
  logger.audit('PASSWORD_RESET_COMPLETED', user, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Envoyer la réponse avec les tokens
  await sendTokenResponse(req, res, user, 200);
});

// @desc    Vérifier l'email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  // Hasher le token
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  let user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token de vérification invalide ou expiré', 400, 'INVALID_VERIFICATION_TOKEN'));
  }

  // Marquer l'email comme vérifié
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  // Logger la vérification
  logger.audit('EMAIL_VERIFIED', user, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: 'Email vérifié avec succès'
  });
});

// @desc    Renvoyer l'email de vérification
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (user.isEmailVerified) {
    return next(new AppError('Email déjà vérifié', 400, 'EMAIL_ALREADY_VERIFIED'));
  }

  // Générer un nouveau token de vérification
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(emailVerificationToken)
    .digest('hex');
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 heures

  await user.save();

  // Envoyer l'email de vérification (à implémenter)
  // await sendEmailVerification(user.email, emailVerificationToken);

  logger.audit('VERIFICATION_EMAIL_RESENT', user, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: 'Email de vérification renvoyé'
  });
});

module.exports = {
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
};
