import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../src/models/Product.js';
import { fileURLToPath } from 'url';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Fonction auto-exécutante pour utiliser async/await
(async () => {
  try {
    // Vérifier la configuration Cloudinary
    console.log('🔧 Configuration Cloudinary:');
    console.log('- Cloud Name:', process.env.CLOUD_NAME);
    console.log('- API Key:', process.env.CLOUD_API_KEY ? 'Configuré' : 'Manquant');
    console.log('- API Secret:', process.env.CLOUD_API_SECRET ? 'Configuré' : 'Manquant');
    
    if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
      throw new Error('Configuration Cloudinary incomplète');
    }

    // Test de connexion Cloudinary
    try {
      const testResult = await cloudinary.api.ping();
      console.log('✅ Connexion Cloudinary réussie:', testResult);
    } catch (err) {
      console.error('❌ Erreur de connexion Cloudinary:', err.message);
      throw err;
    }

    // Connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB réussie');

    const uploadDir = path.join(__dirname, '..', 'uploads');
    console.log('📁 Dossier uploads:', uploadDir);

    const products = await Product.find();
    console.log(`🔍 ${products.length} produits trouvés au total.`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      if (product.image && !product.image.startsWith("http")) {
        // Nettoyer le chemin de l'image (enlever uploads/ du début)
        const cleanImagePath = product.image.replace(/^uploads\//, '');
        const localPath = path.join(uploadDir, cleanImagePath);
        console.log(`\n- Traitement de "${product.name}"`);
        console.log(`  Image DB: ${product.image}`);
        console.log(`  Chemin nettoyé: ${cleanImagePath}`);
        console.log(`  Chemin local: ${localPath}`);

        if (fs.existsSync(localPath)) {
          try {
            console.log(`  📤 Upload vers Cloudinary...`);
            const result = await cloudinary.uploader.upload(localPath, {
              folder: "pharmacie/products",
              public_id: `product_${product._id}`,
              overwrite: true,
              resource_type: "auto"
            });

            product.image = result.secure_url;
            await product.save();
            migratedCount++;

            console.log(`  ✅ Succès: ${result.secure_url}`);
            console.log(`  📊 Public ID: ${result.public_id}`);
          } catch (err) {
            errorCount++;
            console.error(`  ❌ Erreur pour ${product.name}:`, err.message);
            if (err.http_code) {
              console.error(`  📡 Code HTTP: ${err.http_code}`);
            }
          }
        } else {
          console.log(`  ⚠️ Fichier local non trouvé, migration ignorée.`);
        }
      } else {
        console.log(`- Migration ignorée pour "${product.name}" (déjà une URL ou pas d'image).`);
      }
    }

    console.log(`\n📊 Résumé de la migration:`);
    console.log(`- Images migrées: ${migratedCount}`);
    console.log(`- Erreurs: ${errorCount}`);
    console.log(`- Total produits: ${products.length}`);

  } catch (error) {
    console.error("❌ Erreur critique lors de la migration:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    console.log("\n🎉 Migration terminée !");
    mongoose.disconnect();
    process.exit();
  }
})();
