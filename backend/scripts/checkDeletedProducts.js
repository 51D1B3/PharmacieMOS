import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import Product from '../src/models/Product.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    process.exit(1);
  }
};

const checkProducts = async () => {
  try {
    console.log('🔍 Vérification des produits...');
    
    // Produits actifs
    const activeProducts = await Product.find({ isActive: { $ne: false } });
    console.log(`📊 Produits actifs: ${activeProducts.length}`);
    
    // Produits désactivés (soft delete)
    const deletedProducts = await Product.find({ isActive: false });
    console.log(`🗑️  Produits désactivés: ${deletedProducts.length}`);
    
    if (deletedProducts.length > 0) {
      console.log('\n📋 Produits désactivés:');
      deletedProducts.forEach(product => {
        console.log(`- ${product.name} (${product.sku}) - Image: ${product.image ? '✅' : '❌'}`);
      });
    }
    
    // Total des produits
    const totalProducts = await Product.countDocuments();
    console.log(`📈 Total produits en base: ${totalProducts}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkProducts();
  await mongoose.disconnect();
};

main().catch(console.error);