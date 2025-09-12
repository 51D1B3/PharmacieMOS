import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Routes de base
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Chargement des routes
const loadRoutes = async () => {
  try {
    const { default: prescriptionRoutes } = await import('./routes/prescriptions.js');
    app.use('/api/prescriptions', prescriptionRoutes);
    console.log('✅ Routes chargées');
  } catch (error) {
    console.error('❌ Erreur routes:', error.message);
  }
};

const startServer = async () => {
  await loadRoutes();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  });
};

startServer();