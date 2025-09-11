const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const cookieParser = require('cookie-parser');


const logger = require('./utils/logger');
const connectDB = require('./config/database');
const socketHandler = require('./socket/socketHandler');
const { setIO } = require('./socket/io');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const stockRoutes = require('./routes/stock');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const posRoutes = require('./routes/pos');
const prescriptionRoutes = require('./routes/prescriptions');
const notificationRoutes = require('./routes/notifications');

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
setIO(io);

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);

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
socketHandler(io);

// Démarrage du serveur
const startServer = async () => {
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
