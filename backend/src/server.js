import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Définir __filename et __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Toujours charger le .env du dossier racine du projet (backend/.env)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import prescriptionRoutes from './routes/prescriptions.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import supplierRoutes from './routes/suppliers.js';
import userRoutes from './routes/users.js';
import cartRoutes from './routes/cart.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payments.js';
import posRoutes from './routes/pos.js';
import stockRoutes from './routes/stock.js';

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5002;
const NODE_ENV = process.env.NODE_ENV || 'development';

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
app.use(compression());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];
app.use(cors({
  origin: function (origin, callback) {
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/stock', stockRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Gestion des erreurs non capturées
const exitHandler = (error, origin) => {
  const message = origin ? `${origin}:` : 'Error:';
  console.error(message, error);
  if (server && server.listening) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => exitHandler(reason, `Unhandled Rejection at: ${promise}`));
process.on('uncaughtException', (error) => exitHandler(error, 'Uncaught Exception'));

const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export { app, server };