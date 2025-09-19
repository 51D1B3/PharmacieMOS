import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Import du modèle Product
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

const productsToRestore = [
  {
    name: 'Paracétamol 500mg',
    brand: 'Doliprane',
    dosage: '500mg',
    form: 'Comprimé',
    sku: 'PARA500',
    description: 'Antalgique et antipyrétique',
    category: 'Antalgiques',
    priceHT: 2000,
    taxRate: 18,
    priceTTC: 2360,
    stock: { onHand: 100, thresholdAlert: 20 },
    isPrescriptionRequired: false,
    image: 'https://res.cloudinary.com/your-cloud/image/upload/v1/products/paracetamol_products.png'
  },
  {
    name: 'Amoxicilline 250mg',
    brand: 'Clamoxyl',
    dosage: '250mg',
    form: 'Gélule',
    sku: 'AMOX250',
    description: 'Antibiotique pénicilline',
    category: 'Antibiotiques',
    priceHT: 4200,
    taxRate: 18,
    priceTTC: 4956,
    stock: { onHand: 50, thresholdAlert: 10 },
    isPrescriptionRequired: true,
    image: 'https://res.cloudinary.com/your-cloud/image/upload/v1/products/Amoxicilline_products.jpg'
  },
  {
    name: 'Aspirine 100mg',
    brand: 'Aspégic',
    dosage: '100mg',
    form: 'Comprimé',
    sku: 'ASP100',
    description: 'Antiagrégant plaquettaire',
    category: 'Antalgiques',
    priceHT: 1200,
    taxRate: 18,
    priceTTC: 1416,
    stock: { onHand: 75, thresholdAlert: 15 },
    isPrescriptionRequired: false,
    image: 'https://res.cloudinary.com/your-cloud/image/upload/v1/products/Aspirine_products.jpg'
  },
  {
    name: 'Ibuprofène 400mg',
    brand: 'Advil',
    dosage: '400mg',
    form: 'Comprimé',
    sku: 'IBU400',
    description: 'Anti-inflammatoire non stéroïdien',
    category: 'Anti-inflammatoires',
    priceHT: 2500,
    taxRate: 18,
    priceTTC: 2950,
    stock: { onHand: 60, thresholdAlert: 12 },
    isPrescriptionRequired: false,
    image: 'https://res.cloudinary.com/your-cloud/image/upload/v1/products/Ibuprofène_products.png'
  }
];

const restoreProducts = async () => {
  try {
    console.log('🔄 Restauration des produits...');
    
    for (const productData of productsToRestore) {
      // Vérifier si le produit existe déjà
      const existingProduct = await Product.findOne({ sku: productData.sku });
      
      if (existingProduct) {
        console.log(`⚠️  Produit ${productData.sku} existe déjà`);
        continue;
      }
      
      // Créer le produit
      const product = new Product(productData);
      await product.save();
      
      console.log(`✅ Produit restauré: ${productData.name} (${productData.sku})`);
    }
    
    console.log('🎉 Restauration terminée!');
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
  }
};

const main = async () => {
  await connectDB();
  await restoreProducts();
  await mongoose.disconnect();
  console.log('📝 Déconnexion de MongoDB');
};

main().catch(console.error);