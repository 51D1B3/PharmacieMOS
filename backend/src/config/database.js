const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Utiliser toujours MONGODB_URI, que ce soit en dev ou en prod.
    const mongoURI = process.env.MONGODB_URI;
    const conn = await mongoose.connect(mongoURI);

    logger.info(`✅ MongoDB connecté: ${conn.connection.host}`);

    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      logger.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnecté');
    });

    // Gestion de l'arrêt gracieux
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB déconnecté suite à l\'arrêt de l\'application');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
