import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb+srv://51D1B3:Sidibe2004@cluster0.i2yw1cl.mongodb.net/PhacieDB')
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ MongoDB:', err));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur fonctionnel' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur sur http://localhost:${PORT}`);
});