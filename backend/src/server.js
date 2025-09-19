import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Définir __filename et __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le .env
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
import cookieParser from 'cookie-parser';
import socketHandler from './socket/socketHandler.js';

import connectDB from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes simples
import authRoutes from './routes/auth-simple.js';
import productRoutes from './routes/products-simple.js';
import productsApiRoutes from './routes/products.js';
import pharmacistStatsRoutes from './routes/pharmacist-stats.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import prescriptionRoutes from './routes/prescriptions.js';
import personnelRoutes from './routes/personnel.js';
import salesRoutes from './routes/sales.js';

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5005;
const NODE_ENV = process.env.NODE_ENV || 'development';

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware de base
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(morgan('dev'));
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsApiRoutes);
app.use('/api/pharmacist', pharmacistStatsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/sales', salesRoutes);

// Initialiser Socket.IO
socketHandler(io);

// Rendre io accessible dans les routes
app.set('io', io);

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
    
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export { app, server, io };