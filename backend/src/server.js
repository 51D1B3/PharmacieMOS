import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(path.dirname(''), '../.env') });
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import cookieParser from 'cookie-parser';


import logger from './utils/logger.js';
import connectDB from './config/database.js';
// import socketHandler from './socket/socketHandler.js';
// import { setIO } from './socket/io.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Les routes seront importées dynamiquement

const app = express();
const server = createServer(app);

// Configuration Socket.IO avec Redis
const io = new Server(server, {
  cors: {
    origin: [process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rendre io accessible globalement
// setIO(io);

// Configuration de base
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Compression
app.use(compression());

// Cookies
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite chaque IP à 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// CORS

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173' // Ajout pour Vite
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes statiques pour les uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes - chargement dynamique
const loadRoutes = async () => {
  try {
    const { default: adminRoutes } = await import('./routes/admin.js');
    app.use('/api/admin', adminRoutes);
    
    // Autres routes à ajouter au besoin
    console.log('✅ Routes chargées');
  } catch (error) {
    console.error('❌ Erreur lors du chargement des routes:', error);
  }
};

// Route 404
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Gestion des erreurs non capturées
const exitHandler = (error, origin) => {
  const message = origin ? `${origin}:` : 'Error:';
  // Utilise console.error pour garantir que le message s'affiche même si le logger est défaillant
  console.error(message, error);
  if (server && server.listening) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => exitHandler(reason, `Unhandled Rejection at: ${promise}`));

process.on('uncaughtException', (error) => exitHandler(error, 'Uncaught Exception'));

// Socket.IO handler
// socketHandler(io);

// Démarrage du serveur
const startServer = async () => {
  await loadRoutes();
  const useRedisAdapter = process.env.USE_REDIS === 'true';
  try {
    // Connexion à MongoDB
    await connectDB();
    
    // Connexion Redis si activé
    if (useRedisAdapter) {
      const pubClient = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      const subClient = pubClient.duplicate();

      pubClient.on('error', (err) => logger.error('Redis PubClient Error:', err));
      subClient.on('error', (err) => logger.error('Redis SubClient Error:', err));

      logger.info('⏳ Connexion à Redis...');
      await Promise.all([pubClient.connect(), subClient.connect()]);
      logger.info('✅ Redis connecté.');
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('✅ Adapter Socket.IO Redis activé');
    } else {
      logger.info('ℹ️ Redis désactivé (USE_REDIS!=true), Socket.IO utilise l\'adapter mémoire');
    }
    
    server.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
      logger.info(`📱 Mode: ${NODE_ENV}`);
      logger.info(`🔗 API: http://localhost:${PORT}`);
      logger.info(`💬 Socket.IO: ws://localhost:${PORT}`);
    });
    
  } catch (error) {
    // Utiliser console.error pour les erreurs de démarrage critiques car le logger pourrait ne pas être initialisé
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    logger.info('Processus terminé');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT reçu, arrêt gracieux...');
  server.close(() => {
    logger.info('Processus terminé');
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io };
