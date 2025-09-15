import mongoose from 'mongoose';
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

const resetProducts = async () => {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    
    // Supprimer complètement la collection products
    try {
      await db.collection('products').drop();
      console.log('Collection products supprimée');
    } catch (error) {
      console.log('Collection products n\'existe pas ou déjà supprimée');
    }

    // Créer les produits de test
    const testProducts = [
      {
        name: 'Paracétamol 500mg',
        category: 'Antalgiques',
        priceHT: 2500,
        priceTTC: 2500,
        stock: {
          onHand: 150,
          thresholdAlert: 20
        },
        image: '/uploads/products/paracetamol_products.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Amoxicilline 250mg',
        category: 'Antibiotiques',
        priceHT: 8500,
        priceTTC: 8500,
        stock: {
          onHand: 75,
          thresholdAlert: 15
        },
        image: '/uploads/products/Amoxicilline_products.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Aspirine 500mg',
        category: 'Anti-inflammatoires',
        priceHT: 3200,
        priceTTC: 3200,
        stock: {
          onHand: 100,
          thresholdAlert: 10
        },
        image: '/uploads/products/Aspirine_products.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ibuprofène 400mg',
        category: 'Anti-inflammatoires',
        priceHT: 4500,
        priceTTC: 4500,
        stock: {
          onHand: 80,
          thresholdAlert: 15
        },
        image: '/uploads/products/Ibuprofène_products.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sirop contre la toux',
        category: 'Sirops',
        priceHT: 6800,
        priceTTC: 6800,
        stock: {
          onHand: 45,
          thresholdAlert: 8
        },
        image: '/uploads/products/Sirop-toux_products.jpeg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Vitamine C 1000mg',
        category: 'Vitamines',
        priceHT: 4200,
        priceTTC: 4200,
        stock: {
          onHand: 200,
          thresholdAlert: 30
        },
        image: '/uploads/products/calcium_Magnesium_products.png',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Azithromycine 250mg',
        category: 'Antibiotiques',
        priceHT: 12000,
        priceTTC: 12000,
        stock: {
          onHand: 60,
          thresholdAlert: 10
        },
        image: '/uploads/products/Azithromycine_products.webp',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cétirizine 10mg',
        category: 'Antihistaminiques',
        priceHT: 3800,
        priceTTC: 3800,
        stock: {
          onHand: 90,
          thresholdAlert: 12
        },
        image: '/uploads/products/Cétirizine_products.jpeg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gaviscon',
        category: 'Antiacides',
        priceHT: 5500,
        priceTTC: 5500,
        stock: {
          onHand: 70,
          thresholdAlert: 15
        },
        image: '/uploads/products/Gaviscon_products.jpeg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Thermomètre digital',
        category: 'Matériel médical',
        priceHT: 15000,
        priceTTC: 15000,
        stock: {
          onHand: 25,
          thresholdAlert: 5
        },
        image: '/uploads/products/Thermomètre_products.jpeg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Masques chirurgicaux',
        category: 'Protection',
        priceHT: 1200,
        priceTTC: 1200,
        stock: {
          onHand: 500,
          thresholdAlert: 50
        },
        image: '/uploads/products/Masque_products.jpeg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pansements adhésifs',
        category: 'Pansements',
        priceHT: 2800,
        priceTTC: 2800,
        stock: {
          onHand: 120,
          thresholdAlert: 20
        },
        image: '/uploads/products/Pansements_products.webp',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insérer les nouveaux produits directement dans la collection
    const result = await db.collection('products').insertMany(testProducts);
    console.log(`${result.insertedCount} produits créés avec succès`);

    // Afficher les statistiques
    const totalStock = testProducts.reduce((sum, p) => sum + p.stock.onHand, 0);
    const categories = [...new Set(testProducts.map(p => p.category))];

    console.log('\n=== STATISTIQUES ===');
    console.log(`Total produits: ${testProducts.length}`);
    console.log(`Stock total: ${totalStock} unités`);
    console.log(`Catégories: ${categories.length} (${categories.join(', ')})`);

    console.log('\n=== PRODUITS CRÉÉS ===');
    testProducts.forEach(p => {
      console.log(`- ${p.name} (${p.category}) - ${p.priceTTC} GNF - Stock: ${p.stock.onHand}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du reset:', error);
    process.exit(1);
  }
};

resetProducts();