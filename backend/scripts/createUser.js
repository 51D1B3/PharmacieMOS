import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le .env depuis le dossier backend
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Modèle User
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

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

const createUser = async () => {
  try {
    await connectDB();

    console.log('🏥 === Création d\'un utilisateur PharmaMOS ===\n');

    // Collecter les informations
    const nom = await question('Nom: ');
    const prenom = await question('Prénom: ');
    const email = await question('Email: ');
    const telephone = await question('Téléphone: ');
    const password = await question('Mot de passe: ');
    
    console.log('\nRôles disponibles:');
    console.log('1. client');
    console.log('2. pharmacien');
    console.log('3. admin');
    const roleChoice = await question('Choisir le rôle (1-3): ');
    
    const roles = ['client', 'pharmacien', 'admin'];
    const role = roles[parseInt(roleChoice) - 1] || 'client';

    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Un utilisateur avec cet email existe déjà');
      rl.close();
      process.exit(1);
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const user = new User({
      nom,
      prenom,
      email,
      telephone,
      password: hashedPassword,
      role
    });

    await user.save();

    console.log('\n🎉 Utilisateur créé avec succès !');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('👤 Rôle:', role);
    console.log('📱 Téléphone:', telephone);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    rl.close();
    process.exit(1);
  }
};

createUser();