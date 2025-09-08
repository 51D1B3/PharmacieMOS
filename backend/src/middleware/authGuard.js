const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const authGuard = async (req, res, next) => {
  try {
    let token;
    
    // Vérifier si le token est dans le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Vérifier si le token est dans les cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis',
        code: 'TOKEN_REQUIRED'
      });
    }
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Un seul modèle User pour tous les rôles
    const { id } = decoded;
    const user = await User.findById(id).select('+permissions');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé',
        code: 'ACCOUNT_DISABLED'
      });
    }
    
    // Vérifier si le compte est verrouillé
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Compte temporairement verrouillé',
        code: 'ACCOUNT_LOCKED'
      });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    req.userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    
    // Logger l'accès
    console.log('Accès API pour:', user.email);
    
    next();
    
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware pour les routes optionnelles (avec ou sans authentification)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id } = decoded;
      const user = await User.findById(id).select('+permissions');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
        req.userPermissions = user.permissions;
      }
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, continuer sans authentification
    next();
  }
};

// Middleware pour vérifier le refresh token
const refreshTokenGuard = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token requis',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }
    
    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Vérifier si le refresh token existe dans la base de données
    const user = await User.findByRefreshToken(refreshToken);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé',
        code: 'ACCOUNT_DISABLED'
      });
    }
    
    req.user = user;
    req.refreshToken = refreshToken;
    
    next();
    
  } catch (error) {
    console.error('Erreur de refresh token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expiré',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erreur de refresh token',
      code: 'REFRESH_ERROR'
    });
  }
};

// Middleware pour vérifier les permissions spécifiques
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!req.userPermissions.includes(permission)) {
      console.log('Tentative d\'accès non autorisé pour:', req.user.email);
      
      return res.status(403).json({
        success: false,
        message: 'Permission insuffisante',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

// Middleware pour vérifier les rôles
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!roleArray.includes(req.userRole)) {
      console.log('Tentative d\'accès avec rôle insuffisant pour:', req.user.email);
      
      return res.status(403).json({
        success: false,
        message: 'Rôle insuffisant',
        code: 'INSUFFICIENT_ROLE'
      });
    }
    
    next();
  };
};

// Middleware pour vérifier la propriété (l'utilisateur peut accéder à ses propres ressources)
const requireOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise',
          code: 'AUTH_REQUIRED'
        });
      }
      
      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID de ressource requis',
          code: 'RESOURCE_ID_REQUIRED'
        });
      }
      
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ressource non trouvée',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Vérifier si l'utilisateur est propriétaire ou admin
      if (resource.user && resource.user.toString() !== req.userId.toString() && req.userRole !== 'admin') {
        console.log('Tentative d\'accès à une ressource non autorisée pour:', req.user.email);
        
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à cette ressource',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }
      
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Erreur lors de la vérification de propriété:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de propriété',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

module.exports = {
  authGuard,
  optionalAuth,
  refreshTokenGuard,
  requirePermission,
  requireRole,
  requireOwnership
};
