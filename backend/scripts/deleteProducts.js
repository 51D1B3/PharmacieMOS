import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecté pour la suppression.');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

const deleteProducts = async () => {
  try {
    await connectDB();

    console.log('Suppression de tous les produits...');
    const { deletedCount } = await Product.deleteMany({});
    console.log(`${deletedCount} produits ont été supprimés.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la suppression des produits:', error);
    process.exit(1);
  }
};

deleteProducts();
