import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le .env depuis le dossier backend
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Modèle User simple
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'pharmacien', 'admin'], default: 'client' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://51D1B3:Sidibe2004@cluster0.i2yw1cl.mongodb.net/PhacieDB?retryWrites=true&w=majority&appName=Cluster0';
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

const createPharmacist = async () => {
  try {
    await connectDB();

    // Données du pharmacien
    const pharmacistData = {
      nom: 'Diallo',
      prenom: 'Mamadou',
      email: 'pharmacien@pharmacie.com',
      telephone: '+224 123 456 789',
      password: 'pharmacien123',
      role: 'pharmacien'
    };

    // Vérifier si le pharmacien existe déjà
    const existingUser = await User.findOne({ email: pharmacistData.email });
    if (existingUser) {
      console.log('⚠️ Un utilisateur avec cet email existe déjà');
      process.exit(1);
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pharmacistData.password, salt);

    // Créer le pharmacien
    const pharmacist = new User({
      ...pharmacistData,
      password: hashedPassword
    });

    await pharmacist.save();

    console.log('🎉 Pharmacien créé avec succès !');
    console.log('📧 Email:', pharmacistData.email);
    console.log('🔑 Mot de passe:', pharmacistData.password);
    console.log('👤 Rôle: pharmacien');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    process.exit(1);
  }
};

createPharmacist();