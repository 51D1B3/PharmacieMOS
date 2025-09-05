const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config({ path: './backend/.env' });

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

const resetPassword = async (email, newPassword) => {
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      console.error(`❌ Aucun utilisateur trouvé avec l'email "${email}".`);
      return;
    }

    user.password = newPassword;
    user.role = 'admin';
    
    await user.save();

    console.log('✅ Mot de passe réinitialisé et rôle mis à jour avec succès pour l\'utilisateur:');
    console.log('----------------------------------------');
    console.log(`  Email: ${user.email}`);
    console.log(`  Nouveau rôle: ${user.role}`);
    console.log('----------------------------------------');
    console.log('Vous pouvez maintenant vous connecter avec le nouveau mot de passe.');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation du mot de passe:', error.message);
  }
};

const run = async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node backend/scripts/resetAdminPassword.js <email> <nouveauMotDePasse>');
    console.error('Exemple: node backend/scripts/resetAdminPassword.js admin@example.com nouveauMotDePasseSécurisé');
    return;
  }

  const [email, newPassword] = args;

  await connectDB();
  await resetPassword(email, newPassword);
  await disconnectDB();
};

run();
