import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const cleanProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Supprimer les doublons basés sur le nom
    const products = await Product.find();
    console.log(`📦 ${products.length} produits trouvés`);

    const uniqueProducts = new Map();
    const duplicates = [];

    products.forEach(product => {
      const key = product.name.toLowerCase().trim();
      if (uniqueProducts.has(key)) {
        duplicates.push(product._id);
      } else {
        uniqueProducts.set(key, product);
      }
    });

    if (duplicates.length > 0) {
      await Product.deleteMany({ _id: { $in: duplicates } });
      console.log(`🗑️ ${duplicates.length} doublons supprimés`);
    }

    // 2. Corriger les chemins d'images
    const remainingProducts = await Product.find();
    let updatedCount = 0;

    for (const product of remainingProducts) {
      let needsUpdate = false;
      let newImagePath = product.image;

      if (product.image) {
        // Corriger les chemins d'images
        if (product.image.startsWith('/uploads/')) {
          newImagePath = product.image;
        } else if (product.image.includes('_products.')) {
          // Format: NomProduit_products.extension
          newImagePath = `/uploads/products/${product.image}`;
          needsUpdate = true;
        } else if (!product.image.startsWith('http') && !product.image.startsWith('/uploads/')) {
          // Ajouter le préfixe uploads/products/
          newImagePath = `/uploads/products/${product.image}`;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, { image: newImagePath });
        updatedCount++;
      }
    }

    console.log(`🖼️ ${updatedCount} chemins d'images corrigés`);
    console.log(`✅ Nettoyage terminé. ${remainingProducts.length} produits restants`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
};

cleanProducts();