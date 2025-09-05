const logger = require('../utils/logger');

// Classe d'erreur personnalisée
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Gestionnaire d'erreurs global
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Logger l'erreur
  logger.error('Erreur API:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Erreur Mongoose - ID invalide
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    error = new AppError(message, 404, 'RESOURCE_NOT_FOUND');
  }

  // Erreur Mongoose - Validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // Erreur Mongoose - Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} déjà utilisé`;
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Erreur de limite de taille de fichier
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Fichier trop volumineux';
    error = new AppError(message, 400, 'FILE_TOO_LARGE');
  }

  // Erreur de type de fichier non supporté
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Type de fichier non supporté';
    error = new AppError(message, 400, 'UNSUPPORTED_FILE_TYPE');
  }

  // Erreur de connexion à la base de données
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const message = 'Erreur de connexion à la base de données';
    error = new AppError(message, 503, 'DATABASE_CONNECTION_ERROR');
  }

  // Erreur de validation Express
  if (err.type === 'entity.parse.failed') {
    const message = 'Données JSON invalides';
    error = new AppError(message, 400, 'INVALID_JSON');
  }

  // Erreur de limite de requêtes
  if (err.type === 'entity.too.large') {
    const message = 'Données trop volumineuses';
    error = new AppError(message, 413, 'PAYLOAD_TOO_LARGE');
  }

  // Erreur de socket
  if (err.type === 'socket') {
    const message = 'Erreur de connexion temps réel';
    error = new AppError(message, 500, 'SOCKET_ERROR');
  }

  // Erreur de paiement
  if (err.type === 'payment') {
    const message = err.message || 'Erreur de paiement';
    error = new AppError(message, 400, 'PAYMENT_ERROR');
  }

  // Erreur de stock
  if (err.type === 'stock') {
    const message = err.message || 'Erreur de gestion des stocks';
    error = new AppError(message, 400, 'STOCK_ERROR');
  }

  // Erreur de notification
  if (err.type === 'notification') {
    const message = err.message || 'Erreur de notification';
    error = new AppError(message, 500, 'NOTIFICATION_ERROR');
  }

  // Erreur de génération PDF
  if (err.type === 'pdf') {
    const message = err.message || 'Erreur de génération PDF';
    error = new AppError(message, 500, 'PDF_GENERATION_ERROR');
  }

  // Erreur d'upload
  if (err.type === 'upload') {
    const message = err.message || 'Erreur d\'upload de fichier';
    error = new AppError(message, 500, 'UPLOAD_ERROR');
  }

  // Erreur d'import/export
  if (err.type === 'import_export') {
    const message = err.message || 'Erreur d\'import/export';
    error = new AppError(message, 500, 'IMPORT_EXPORT_ERROR');
  }

  // Réponse d'erreur
  const response = {
    success: false,
    message: error.message || 'Erreur serveur interne',
    code: error.code || 'INTERNAL_ERROR'
  };

  // Ajouter des détails en développement
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = {
      name: err.name,
      statusCode: error.statusCode,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    };
  }

  // Ajouter des suggestions d'action selon le type d'erreur
  if (error.code) {
    switch (error.code) {
      case 'TOKEN_EXPIRED':
        response.suggestion = 'Veuillez vous reconnecter';
        break;
      case 'VALIDATION_ERROR':
        response.suggestion = 'Vérifiez les données saisies';
        break;
      case 'DUPLICATE_FIELD':
        response.suggestion = 'Utilisez une valeur différente';
        break;
      case 'RESOURCE_NOT_FOUND':
        response.suggestion = 'Vérifiez l\'identifiant de la ressource';
        break;
      case 'INSUFFICIENT_PERMISSIONS':
        response.suggestion = 'Contactez votre administrateur';
        break;
      case 'STOCK_ERROR':
        response.suggestion = 'Vérifiez la disponibilité du produit';
        break;
      case 'PAYMENT_ERROR':
        response.suggestion = 'Vérifiez vos informations de paiement';
        break;
    }
  }

  // Envoyer la réponse
  res.status(error.statusCode || 500).json(response);
};

// Gestionnaire d'erreurs pour les routes non trouvées
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} non trouvée`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Gestionnaire d'erreurs pour les promesses rejetées
const unhandledRejectionHandler = (reason, promise) => {
  logger.error('Promesse rejetée non gérée:', {
    reason: reason,
    promise: promise
  });
  
  // Fermer le serveur gracieusement
  process.exit(1);
};

// Gestionnaire d'erreurs pour les exceptions non capturées
const uncaughtExceptionHandler = (error) => {
  logger.error('Exception non capturée:', {
    error: error.message,
    stack: error.stack
  });
  
  // Fermer le serveur gracieusement
  process.exit(1);
};

// Middleware pour capturer les erreurs asynchrones
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware pour valider les paramètres de requête
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.params);
      if (error) {
        const message = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
          success: false,
          message,
          code: 'INVALID_PARAMS'
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Middleware pour valider le corps de la requête
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        const message = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
          success: false,
          message,
          code: 'INVALID_BODY'
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Middleware pour valider les paramètres de requête
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.query);
      if (error) {
        const message = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
          success: false,
          message,
          code: 'INVALID_QUERY'
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  asyncHandler,
  validateParams,
  validateBody,
  validateQuery
};
