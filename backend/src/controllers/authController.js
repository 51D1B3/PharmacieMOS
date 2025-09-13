import mongoose from 'mongoose';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Générer les tokens d'authentification
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    // Utiliser une valeur par défaut si le secret n'est pas défini
    process.env.JWT_SECRET || 'votre_super_secret_pour_access_token_a_changer',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    // Utiliser une valeur par défaut si le secret n'est pas défini
    process.env.JWT_REFRESH_SECRET || 'votre_super_secret_pour_refresh_token_a_changer',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Envoyer la réponse avec les tokens
const sendTokenResponse = async (req, res, user, statusCode) => {
  const { accessToken, refreshToken } = generateTokens(user);

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
        permissions: user.permissions || [],
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      },
      accessToken,
      refreshToken
    }
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { nom, prenom, email, password, sexe, telephone, role } = req.body;

  // Validation basique
  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Tous les champs obligatoires doivent être remplis'
    });
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Un utilisateur avec cet email existe déjà'
    });
  }

  // Créer le nouvel utilisateur
  const user = await User.create({
    nom,
    prenom,
    email,
    password,
    sexe: sexe || 'Autre',
    telephone,
    role: role || 'client',
    isEmailVerified: true // Simplifier pour les tests
  });

  // Envoyer la réponse
  await sendTokenResponse(req, res, user, 201);
});

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  console.log('Tentative de connexion pour:', email);

  // Vérifier que l'email et le mot de passe sont fournis
  if (!email || !password) {
    console.log('Email ou mot de passe manquant');
    return next(new AppError('Email et mot de passe requis', 400, 'MISSING_CREDENTIALS'));
  }

  // Vérifier si l'utilisateur existe
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    console.log('Utilisateur non trouvé pour email:', email);
    return next(new AppError('Email ou mot de passe incorrect', 401, 'INVALID_CREDENTIALS'));
  }

  console.log('Utilisateur trouvé:', user.email, 'Rôle:', user.role);

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
    console.log('Mot de passe incorrect pour:', email);
    // Incrémenter les tentatives de connexion
    await user.incrementLoginAttempts();

    return next(new AppError('Email ou mot de passe incorrect', 401, 'INVALID_CREDENTIALS'));
  }

  console.log('Mot de passe correct pour:', email);

  // Réinitialiser les tentatives de connexion
  await user.resetLoginAttempts();

  // Mettre à jour la dernière connexion
  user.lastLogin = new Date();
  user.lastLoginIp = req.ip;
  await user.save();

  // Logger la connexion
  console.log('Connexion réussie pour:', user.email, 'Rôle:', user.role);

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
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'votre_super_secret_pour_refresh_token_a_changer');
  
  // Vérifier si l'utilisateur existe et si le token est valide
  const user = await User.findById(decoded.id);
  if (!user) {
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
    console.log('Déconnexion pour:', req.user.email);
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
  console.log('Profil mis à jour pour:', user.email);

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
  console.log('Mot de passe changé pour:', user.email);

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
  user.passwordResetExpires = Date.now() + 10 * 60 * 60 * 1000; // 10 minutes

  await user.save();

  // Envoyer l'email de réinitialisation (à implémenter)
  // await sendPasswordResetEmail(user.email, resetToken);

  console.log('Réinitialisation de mot de passe demandée pour:', user.email);

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
  console.log('Mot de passe réinitialisé pour:', user.email);

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
  console.log('Email vérifié pour:', user.email);

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

  console.log('Email de vérification renvoyé pour:', user.email);

  res.status(200).json({
    success: true,
    message: 'Email de vérification renvoyé'
  });
});

export {
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
