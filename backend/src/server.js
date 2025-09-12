const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

const logger = require('./utils/logger.js');
const connectDB = require('./config/database.js');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.js');

const authRoutes = require('./routes/auth.js');
const adminRoutes = require('./routes/admin.js');
const prescriptionRoutes = require('./routes/prescriptions.js');
const categoryRoutes = require('./routes/categories.js');
const productRoutes = require('./routes/products.js');
const orderRoutes = require('./routes/orders.js');
const supplierRoutes = require('./routes/suppliers.js');
const userRoutes = require('./routes/users.js');
const cartRoutes = require('./routes/cart.js');
const chatRoutes = require('./routes/chat.js');
const notificationRoutes = require('./routes/notifications.js');
const paymentRoutes = require('./routes/payments.js');
const posRoutes = require('./routes/pos.js');
const stockRoutes = require('./routes/stock.js');

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

module.exports = { app, server };
