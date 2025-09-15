import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import Supplier from '../src/models/Supplier.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecté');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    await connectDB();

    // Créer un ID utilisateur fictif pour les champs requis
    const dummyUserId = new mongoose.Types.ObjectId();

    // Créer une catégorie par défaut si elle n'existe pas
    let category = await Category.findOne({ name: 'Médicaments' });
    if (!category) {
      category = await Category.create({
        name: 'Médicaments',
        slug: 'medicaments',
        description: 'Médicaments généraux',
        createdBy: dummyUserId
      });
    }

    // Créer un fournisseur par défaut si il n'existe pas
    let supplier = await Supplier.findOne({ name: 'Fournisseur Général' });
    if (!supplier) {
      supplier = await Supplier.create({
        name: 'Fournisseur Général',
        email: 'contact@fournisseur.com',
        phone: '+224 123 456 789',
        address: 'Conakry, Guinée'
      });
    }

    // Produits de test
    const testProducts = [
      {
        name: 'Paracétamol 500mg',
        brand: 'Doliprane',
        dosage: '500mg',
        form: 'comprimé',
        sku: 'PARA500',
        description: 'Antalgique et antipyrétique',
        category: category._id,
        supplierId: supplier._id,
        priceHT: 2500,
        priceTTC: 2500,
        taxRate: 0,
        stock: {
          onHand: 150,
          thresholdAlert: 20
        },
        seo: {
          slug: 'paracetamol-500mg-doliprane'
        },
        image: 'https://res.cloudinary.com/pharmacie/image/upload/v1/products/paracetamol.jpg'
      },
      {
        name: 'Amoxicilline 250mg',
        brand: 'Clamoxyl',
        dosage: '250mg',
        form: 'gélule',
        sku: 'AMOX250',
        description: 'Antibiotique pénicilline',
        category: category._id,
        supplierId: supplier._id,
        priceHT: 8500,
        priceTTC: 8500,
        taxRate: 0,
        stock: {
          onHand: 75,
          thresholdAlert: 15
        },
        isPrescriptionRequired: true,
        seo: {
          slug: 'amoxicilline-250mg-clamoxyl'
        },
        image: 'https://res.cloudinary.com/pharmacie/image/upload/v1/products/amoxicilline.jpg'
      },
      {
        name: 'Vitamine C 1000mg',
        brand: 'Laroscorbine',
        dosage: '1000mg',
        form: 'comprimé',
        sku: 'VITC1000',
        description: 'Complément vitaminique',
        category: category._id,
        supplierId: supplier._id,
        priceHT: 4200,
        priceTTC: 4200,
        taxRate: 0,
        stock: {
          onHand: 200,
          thresholdAlert: 30
        },
        seo: {
          slug: 'vitamine-c-1000mg-laroscorbine'
        },
        image: 'https://res.cloudinary.com/pharmacie/image/upload/v1/products/vitamine-c.jpg'
      },
      {
        name: 'Aspirine 500mg',
        brand: 'Aspégic',
        dosage: '500mg',
        form: 'comprimé',
        sku: 'ASP500',
        description: 'Anti-inflammatoire non stéroïdien',
        category: category._id,
        supplierId: supplier._id,
        priceHT: 3200,
        priceTTC: 3200,
        taxRate: 0,
        stock: {
          onHand: 5,
          thresholdAlert: 10
        },
        seo: {
          slug: 'aspirine-500mg-aspegic'
        },
        image: 'https://res.cloudinary.com/pharmacie/image/upload/v1/products/aspirine.jpg'
      },
      {
        name: 'Sirop contre la toux',
        brand: 'Toplexil',
        dosage: '150ml',
        form: 'sirop',
        sku: 'TOUX150',
        description: 'Sirop antitussif',
        category: category._id,
        supplierId: supplier._id,
        priceHT: 6800,
        priceTTC: 6800,
        taxRate: 0,
        stock: {
          onHand: 0,
          thresholdAlert: 8
        },
        seo: {
          slug: 'sirop-toux-toplexil-150ml'
        },
        image: 'https://res.cloudinary.com/pharmacie/image/upload/v1/products/sirop-toux.jpg'
      }
    ];

    // Supprimer les produits existants
    await Product.deleteMany({});
    console.log('Produits existants supprimés');

    // Insérer les nouveaux produits
    const createdProducts = await Product.insertMany(testProducts);
    console.log(`${createdProducts.length} produits créés avec succès`);

    // Afficher les statistiques
    const totalStock = createdProducts.reduce((sum, p) => sum + p.stock.onHand, 0);
    const lowStock = createdProducts.filter(p => p.stock.onHand <= p.stock.thresholdAlert);
    const outOfStock = createdProducts.filter(p => p.stock.onHand === 0);

    console.log('\n=== STATISTIQUES ===');
    console.log(`Total produits: ${createdProducts.length}`);
    console.log(`Stock total: ${totalStock} unités`);
    console.log(`Produits en stock: ${createdProducts.filter(p => p.stock.onHand > 0).length}`);
    console.log(`Stock faible: ${lowStock.length}`);
    console.log(`Rupture de stock: ${outOfStock.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
    process.exit(1);
  }
};

seedProducts();