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

// Mapping des noms de produits avec leurs images Cloudinary
const productImageMapping = {
  'Paracétamol': '/uploads/products/paracetamol_products.png',
  'Amoxicilline': '/uploads/products/Amoxicilline_products.jpg',
  'Aspirine': '/uploads/products/Aspirine_products.jpg',
  'Ibuprofène': '/uploads/products/Ibuprofène_products.png',
  'Azithromycine': '/uploads/products/Azithromycine_products.webp',
  'Bandage': '/uploads/products/Bandage_products.jpeg',
  'Bétadine': '/uploads/products/Bétadine_products.jpeg',
  'Brosse': '/uploads/products/Brosse_products.jpeg',
  'Calcium': '/uploads/products/calcium_Magnesium_products.png',
  'Cétirizine': '/uploads/products/Cétirizine_products.jpeg',
  'Ciprofloxacine': '/uploads/products/Ciprofloxacine_products.png',
  'Couche': '/uploads/products/Couche_products.png',
  'Crème': '/uploads/products/crème_products.png',
  'Déodorant': '/uploads/products/Dédorant_products.png',
  'Dentifrice': '/uploads/products/Dentifrice_products.jpeg',
  'Doxycycline': '/uploads/products/Doxycycline_products.png',
  'Gant': '/uploads/products/Gant_products.jpeg',
  'Gaviscon': '/uploads/products/Gaviscon_products.jpeg',
  'Gel': '/uploads/products/Gel_products.jpeg',
  'Glucomètre': '/uploads/products/Glucomètre_products.jpeg',
  'Lingette': '/uploads/products/Lingette_products.png',
  'Loratadine': '/uploads/products/Loratadine_products.jpg',
  'Lotion': '/uploads/products/Lotion_products.png',
  'Masque': '/uploads/products/Masque_products.jpeg',
  'Multivitamine': '/uploads/products/Multivitamine_products.jpeg',
  'Pansements': '/uploads/products/Pansements_products.webp',
  'Probiotique': '/uploads/products/Probiotique_products.png',
  'Savon': '/uploads/products/SavonBébé_products.jpg',
  'Shampoing': '/uploads/products/Shampoing_products.png',
  'Sirop': '/uploads/products/Sirop-toux_products.jpeg',
  'Tensiomètre': '/uploads/products/Tensiomètre_products.jpeg',
  'Thermomètre': '/uploads/products/Thermomètre_products.jpeg',
  'Warfarine': '/uploads/products/Warfarine_products.jpeg'
};

const findImageForProduct = (productName) => {
  // Recherche exacte d'abord
  for (const [key, imagePath] of Object.entries(productImageMapping)) {
    if (productName.toLowerCase().includes(key.toLowerCase())) {
      return imagePath;
    }
  }
  return null;
};

const assignImagesToProducts = async () => {
  try {
    console.log('🔄 Attribution automatique des images...');
    
    const products = await Product.find({ image: { $in: [null, undefined, ''] } });
    console.log(`📦 ${products.length} produits sans image trouvés`);
    
    let updated = 0;
    
    for (const product of products) {
      const imagePath = findImageForProduct(product.name);
      
      if (imagePath) {
        await Product.findByIdAndUpdate(product._id, { image: imagePath });
        console.log(`✅ ${product.name} → ${imagePath}`);
        updated++;
      } else {
        console.log(`⚠️  Aucune image trouvée pour: ${product.name}`);
      }
    }
    
    console.log(`🎉 ${updated} produits mis à jour avec des images`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

const main = async () => {
  await connectDB();
  await assignImagesToProducts();
  await mongoose.disconnect();
};

main().catch(console.error);