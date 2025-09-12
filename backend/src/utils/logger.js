import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Créer le dossier logs s'il n'existe pas
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'pharmacie-api' },
  transports: [
    // Fichier pour les erreurs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Fichier pour tous les logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// Ajouter la console en développement
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Fonctions utilitaires supplémentaires sans écraser les méthodes natives
const helper = {
  startup(message) {
    logger.log({ level: 'info', message: `🚀 ${message}` });
  },
  success(message) {
    logger.log({ level: 'info', message: `✅ ${message}` });
  },
  security(message, details = null) {
    if (details) {
      logger.log({ level: 'warn', message: `🔒 ${message}`, details });
    } else {
      logger.log({ level: 'warn', message: `🔒 ${message}` });
    }
  },
  audit(action, user, details = null) {
    logger.log({
      level: 'info',
      message: `📋 AUDIT: ${action}`,
      user: user?.id || user?.email || 'anonymous',
      action,
      timestamp: new Date().toISOString(),
      details
    });
  }
};

logger.startup = helper.startup;
logger.success = helper.success;
logger.security = helper.security;
logger.audit = helper.audit;

export default logger;
