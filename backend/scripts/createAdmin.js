import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  console.error('Erreur: MONGODB_URI n\'est pas défini dans le fichier .env');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('✅ MongoDB connecté pour le script.');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB déconnecté.');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};

const createAdmin = async (adminData) => {
  try {
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.warn(`⚠️ Un utilisateur avec l'email "${adminData.email}" existe déjà.`);
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`✅ Le rôle de l'utilisateur existant a été mis à jour à "admin".`);
      }
      return;
    }

    const newAdmin = await User.create(adminData);
    console.log('✅ Nouvel administrateur créé avec succès !');
    console.log('----------------------------------------');
    console.log(`Nom: ${newAdmin.nomComplet}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Rôle: ${newAdmin.role}`);
    console.log('----------------------------------------');
    console.log('Vous pouvez maintenant vous connecter avec ces identifiants.');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error.message);
  }
};

const run = async () => {
  const args = process.argv.slice(2);
  if (args.length < 5) {
    console.error('Usage: node backend/scripts/createAdmin.js <nom> <prenom> <email> <password> <sexe>');
    console.error('Exemple: node backend/scripts/createAdmin.js Sidibe Mahamadou admin@example.com securepassword123 Homme');
    return;
  }

  const [nom, prenom, email, password, sexe] = args;

  const adminData = {
    nom,
    prenom,
    email,
    password,
    sexe,
    role: 'admin',
    isEmailVerified: true
  };

  await connectDB();
  await createAdmin(adminData);
  await disconnectDB();
};

run();
