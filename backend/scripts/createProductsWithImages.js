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

// Mapping automatique des images Cloudinary
const cloudinaryImages = {
  'paracetamol': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/paracetamol_products.png',
  'amoxicilline': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Amoxicilline_products.jpg',
  'aspirine': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Aspirine_products.jpg',
  'ibuprofene': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Ibuprofène_products.png',
  'azithromycine': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Azithromycine_products.webp',
  'bandage': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Bandage_products.jpeg',
  'betadine': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Betadine_products.jpeg',
  'cetirizine': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Cétirizine_products.jpeg',
  'ciprofloxacine': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Ciprofloxacine_products.png',
  'doxycycline': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Doxycycline_products.png',
  'gaviscon': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Gaviscon_products.jpeg',
  'loratadine': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Loratadine_products.jpg',
  'multivitamine': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Multivitamine_products.jpeg',
  'pansements': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Pansements_products.webp',
  'probiotique': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Probiotique_products.png',
  'sirop': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Sirop-toux_products.jpeg',
  'tensiometre': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Tensiomètre_products.jpeg',
  'thermometre': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Thermomètre_products.jpeg',
  'warfarine': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Warfarine_products.jpeg',
  'antiacide': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Antiacide_products.jpg',
  'brosse': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Brosse_products.jpeg',
  'calcium': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/calcium_Magnesium_products.png',
  'couche': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Couche_products.png',
  'crème': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/crème_products.png',
  'crèmehyd': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/CrèmeHyd_products.jpeg',
  'déodorant': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Déodorant_products.png',
  'dentifrice': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Dentifrice_products.jpeg',
  'gant': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Gant_products.jpeg',
  'gel': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Gel_products.jpeg',
  'geldouche': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Geldouche_products.jpeg',
  'glucomètre': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Glucomètre_products.jpeg',
  'lingette': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Lingette_products.png',
  'lotion': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Lotion_products.png',
  'lotionhyd': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/LotionHyd_products.jpeg',
  'masque': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Masque_products.jpeg',
  'pommade': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/pommandeAntiInf_products.jpeg',
  'poudre': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Poudre_products.jpeg',
  'risperidone': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Risperidone-products.jpeg',
  'savonbébé': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/SavonBébé_products.jpg',
  'savondoux': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Savondoux_products.jpeg',
  'sertraline': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Sertraline_products.jpeg',
  'shampoing': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/Shampoing_products.png',
  'siropToux': 'https://res.cloudinary.com/dxb7m3jvp/image/upload/v1/products/SiropToux_products.jpeg'
};

// Fonction pour trouver automatiquement l'image
const findCloudinaryImage = (productName) => {
  const name = productName.toLowerCase();
  for (const [key, imageUrl] of Object.entries(cloudinaryImages)) {
    if (name.includes(key)) {
      return imageUrl;
    }
  }
  return 'https://via.placeholder.com/400x400/e5e7eb/6b7280?text=Produit';
};

// ========== 44 PRODUITS À CRÉER ==========
const productsToCreate = [
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
    isPrescriptionRequired: false
  },
  {
    name: 'Amoxicilline 500mg',
    brand: 'Mylan',
    dosage: '500mg',
    form: 'Capsule',
    sku: 'AMOX500',
    description: 'Antibiotique à large spectre',
    category: 'Antibiotiques',
    priceHT: 4500,
    taxRate: 18,
    priceTTC: 5310,
    stock: { onHand: 80, thresholdAlert: 15 },
    isPrescriptionRequired: true
  },
  {
    name: 'Aspirine 500mg',
    brand: 'Bayer',
    dosage: '500mg',
    form: 'Comprimé',
    sku: 'ASP500',
    description: 'Antidouleur et anticoagulant',
    category: 'Antalgiques',
    priceHT: 2500,
    taxRate: 18,
    priceTTC: 2950,
    stock: { onHand: 120, thresholdAlert: 25 },
    isPrescriptionRequired: false
  },
  {
    name: 'Ibuprofène 400mg',
    brand: 'Advil',
    dosage: '400mg',
    form: 'Comprimé',
    sku: 'IBU400',
    description: 'Anti-inflammatoire',
    category: 'Anti-inflammatoires',
    priceHT: 3500,
    taxRate: 18,
    priceTTC: 4130,
    stock: { onHand: 60, thresholdAlert: 12 },
    isPrescriptionRequired: false
  },
  {
    name: 'Azithromycine 250mg',
    brand: 'Pfizer',
    dosage: '250mg',
    form: 'Comprimé',
    sku: 'AZI250',
    description: 'Antibiotique macrolide',
    category: 'Antibiotiques',
    priceHT: 6000,
    taxRate: 18,
    priceTTC: 7080,
    stock: { onHand: 50, thresholdAlert: 10 },
    isPrescriptionRequired: true
  },
  {
    name: 'Bandage élastique',
    brand: 'Hansaplast',
    dosage: '5m',
    form: 'Rouleau',
    sku: 'BAND01',
    description: 'Bandage de maintien et premiers soins',
    category: 'Matériel médical',
    priceHT: 1500,
    taxRate: 18,
    priceTTC: 1770,
    stock: { onHand: 200, thresholdAlert: 40 },
    isPrescriptionRequired: false
  },
  {
    name: 'Bétadine 10%',
    brand: 'Meda Pharma',
    dosage: '10%',
    form: 'Solution',
    sku: 'BETA10',
    description: 'Désinfectant antiseptique',
    category: 'Antiseptiques',
    priceHT: 4000,
    taxRate: 18,
    priceTTC: 4720,
    stock: { onHand: 70, thresholdAlert: 15 },
    isPrescriptionRequired: false
  },
  {
    name: 'Cétirizine 10mg',
    brand: 'Zyrtec',
    dosage: '10mg',
    form: 'Comprimé',
    sku: 'CETI10',
    description: 'Antihistaminique contre les allergies',
    category: 'Antihistaminiques',
    priceHT: 3500,
    taxRate: 18,
    priceTTC: 4130,
    stock: { onHand: 90, thresholdAlert: 18 },
    isPrescriptionRequired: false
  },
  {
    name: 'Ciprofloxacine 500mg',
    brand: 'Cipro',
    dosage: '500mg',
    form: 'Comprimé',
    sku: 'CIPRO500',
    description: 'Antibiotique fluoroquinolone',
    category: 'Antibiotiques',
    priceHT: 5000,
    taxRate: 18,
    priceTTC: 5900,
    stock: { onHand: 65, thresholdAlert: 13 },
    isPrescriptionRequired: true
  },
  {
    name: 'Doxycycline 100mg',
    brand: 'Vibramycin',
    dosage: '100mg',
    form: 'Capsule',
    sku: 'DOXY100',
    description: 'Antibiotique tétracycline',
    category: 'Antibiotiques',
    priceHT: 4800,
    taxRate: 18,
    priceTTC: 5660,
    stock: { onHand: 55, thresholdAlert: 11 },
    isPrescriptionRequired: true
  },
  {
    name: 'Gaviscon 250ml',
    brand: 'Reckitt',
    dosage: '250ml',
    form: 'Suspension orale',
    sku: 'GAVI250',
    description: 'Traitement du reflux gastrique',
    category: 'Antiacides',
    priceHT: 5500,
    taxRate: 18,
    priceTTC: 6490,
    stock: { onHand: 45, thresholdAlert: 9 },
    isPrescriptionRequired: false
  },
  {
    name: 'Loratadine 10mg',
    brand: 'Claritin',
    dosage: '10mg',
    form: 'Comprimé',
    sku: 'LORA10',
    description: 'Antihistaminique',
    category: 'Antihistaminiques',
    priceHT: 3200,
    taxRate: 18,
    priceTTC: 3776,
    stock: { onHand: 85, thresholdAlert: 17 },
    isPrescriptionRequired: false
  },
  {
    name: 'Multivitamines',
    brand: 'Centrum',
    dosage: '30 comprimés',
    form: 'Comprimé',
    sku: 'MULTI01',
    description: 'Complément multivitaminé',
    category: 'Compléments alimentaires',
    priceHT: 8000,
    taxRate: 18,
    priceTTC: 9440,
    stock: { onHand: 60, thresholdAlert: 12 },
    isPrescriptionRequired: false
  },
  {
    name: 'Pansements adhésifs',
    brand: 'Hansaplast',
    dosage: 'Boîte de 20',
    form: 'Pansement',
    sku: 'PAN20',
    description: 'Pansements résistants à l\'eau',
    category: 'Matériel médical',
    priceHT: 1500,
    taxRate: 18,
    priceTTC: 1770,
    stock: { onHand: 200, thresholdAlert: 40 },
    isPrescriptionRequired: false
  },
  {
    name: 'Probiotique',
    brand: 'BioGaia',
    dosage: '30 capsules',
    form: 'Capsule',
    sku: 'PROBIO01',
    description: 'Complément probiotique pour flore intestinale',
    category: 'Compléments alimentaires',
    priceHT: 4000,
    taxRate: 18,
    priceTTC: 4720,
    stock: { onHand: 60, thresholdAlert: 12 },
    isPrescriptionRequired: false
  },
  {
    name: 'Sirop antitussif',
    brand: 'Bronchofor',
    dosage: '120ml',
    form: 'Flacon',
    sku: 'SIROP01',
    description: 'Sirop contre la toux sèche',
    category: 'Antitussifs',
    priceHT: 3000,
    taxRate: 18,
    priceTTC: 3540,
    stock: { onHand: 90, thresholdAlert: 18 },
    isPrescriptionRequired: false
  },
  {
    name: 'Tensiomètre électronique',
    brand: 'Omron',
    dosage: 'Adulte',
    form: 'Appareil médical',
    sku: 'TENSI01',
    description: 'Mesure de la tension artérielle',
    category: 'Matériel médical',
    priceHT: 35000,
    taxRate: 18,
    priceTTC: 41300,
    stock: { onHand: 15, thresholdAlert: 3 },
    isPrescriptionRequired: false
  },
  {
    name: 'Thermomètre digital',
    brand: 'Braun',
    dosage: 'Sans contact',
    form: 'Appareil médical',
    sku: 'THERMO01',
    description: 'Thermomètre médical digital',
    category: 'Matériel médical',
    priceHT: 12000,
    taxRate: 18,
    priceTTC: 14160,
    stock: { onHand: 25, thresholdAlert: 5 },
    isPrescriptionRequired: false
  },
  {
    name: 'Warfarine 5mg',
    brand: 'Coumadin',
    dosage: '5mg',
    form: 'Comprimé',
    sku: 'WARF05',
    description: 'Anticoagulant',
    category: 'Anticoagulants',
    priceHT: 8000,
    taxRate: 18,
    priceTTC: 9440,
    stock: { onHand: 30, thresholdAlert: 6 },
    isPrescriptionRequired: true
  },
  {
    name: 'Antiacide',
    brand: 'Maalox',
    dosage: '20 comprimés',
    form: 'Comprimé',
    sku: 'ANTI01',
    description: 'Traitement des brûlures d\'estomac',
    category: 'Antiacides',
    priceHT: 2500,
    taxRate: 18,
    priceTTC: 2950,
    stock: { onHand: 80, thresholdAlert: 16 },
    isPrescriptionRequired: false
  },
  {
    name: 'Brosse à dents',
    brand: 'Oral-B',
    dosage: 'Adulte',
    form: 'Brosse',
    sku: 'BROS01',
    description: 'Brosse à dents souple',
    category: 'Hygiène dentaire',
    priceHT: 800,
    taxRate: 18,
    priceTTC: 944,
    stock: { onHand: 150, thresholdAlert: 30 },
    isPrescriptionRequired: false
  },
  {
    name: 'Calcium Magnésium',
    brand: 'Nature Made',
    dosage: '60 comprimés',
    form: 'Comprimé',
    sku: 'CALC01',
    description: 'Complément calcium et magnésium',
    category: 'Compléments alimentaires',
    priceHT: 6000,
    taxRate: 18,
    priceTTC: 7080,
    stock: { onHand: 40, thresholdAlert: 8 },
    isPrescriptionRequired: false
  },
  {
    name: 'Couches bébé',
    brand: 'Pampers',
    dosage: 'Taille 3',
    form: 'Paquet de 30',
    sku: 'COUC01',
    description: 'Couches ultra absorbantes',
    category: 'Puériculture',
    priceHT: 8000,
    taxRate: 18,
    priceTTC: 9440,
    stock: { onHand: 50, thresholdAlert: 10 },
    isPrescriptionRequired: false
  },
  {
    name: 'Crème hydratante',
    brand: 'Nivea',
    dosage: '200ml',
    form: 'Tube',
    sku: 'CREM01',
    description: 'Crème hydratante pour le corps',
    category: 'Cosmétiques',
    priceHT: 3000,
    taxRate: 18,
    priceTTC: 3540,
    stock: { onHand: 70, thresholdAlert: 14 },
    isPrescriptionRequired: false
  },
  {
    name: 'Crème hydratante visage',
    brand: 'La Roche Posay',
    dosage: '50ml',
    form: 'Tube',
    sku: 'CREMHYD01',
    description: 'Crème hydratante pour visage sensible',
    category: 'Cosmétiques',
    priceHT: 4500,
    taxRate: 18,
    priceTTC: 5310,
    stock: { onHand: 35, thresholdAlert: 7 },
    isPrescriptionRequired: false
  },
  {
    name: 'Déodorant',
    brand: 'Dove',
    dosage: '150ml',
    form: 'Spray',
    sku: 'DEOD01',
    description: 'Déodorant anti-transpirant',
    category: 'Hygiène corporelle',
    priceHT: 2000,
    taxRate: 18,
    priceTTC: 2360,
    stock: { onHand: 100, thresholdAlert: 20 },
    isPrescriptionRequired: false
  },
  {
    name: 'Dentifrice',
    brand: 'Colgate',
    dosage: '75ml',
    form: 'Tube',
    sku: 'DENT01',
    description: 'Dentifrice protection complète',
    category: 'Hygiène dentaire',
    priceHT: 1500,
    taxRate: 18,
    priceTTC: 1770,
    stock: { onHand: 120, thresholdAlert: 24 },
    isPrescriptionRequired: false
  },
  {
    name: 'Gants latex',
    brand: 'Medline',
    dosage: 'Taille M',
    form: 'Boîte de 100',
    sku: 'GANT01',
    description: 'Gants d\'examen en latex',
    category: 'Matériel médical',
    priceHT: 5000,
    taxRate: 18,
    priceTTC: 5900,
    stock: { onHand: 30, thresholdAlert: 6 },
    isPrescriptionRequired: false
  },
  {
    name: 'Gel hydroalcoolique',
    brand: 'Baccide',
    dosage: '100ml',
    form: 'Flacon',
    sku: 'GEL01',
    description: 'Gel désinfectant pour les mains',
    category: 'Antiseptiques',
    priceHT: 1800,
    taxRate: 18,
    priceTTC: 2124,
    stock: { onHand: 200, thresholdAlert: 40 },
    isPrescriptionRequired: false
  },
  {
    name: 'Gel douche',
    brand: 'Sanex',
    dosage: '250ml',
    form: 'Flacon',
    sku: 'GELDOU01',
    description: 'Gel douche dermo-protecteur',
    category: 'Hygiène corporelle',
    priceHT: 2200,
    taxRate: 18,
    priceTTC: 2596,
    stock: { onHand: 80, thresholdAlert: 16 },
    isPrescriptionRequired: false
  },
  {
    name: 'Glucomètre',
    brand: 'Accu-Chek',
    dosage: 'Kit complet',
    form: 'Appareil',
    sku: 'GLUC01',
    description: 'Lecteur de glycémie',
    category: 'Matériel médical',
    priceHT: 25000,
    taxRate: 18,
    priceTTC: 29500,
    stock: { onHand: 10, thresholdAlert: 2 },
    isPrescriptionRequired: false
  },
  {
    name: 'Lingettes bébé',
    brand: 'Mustela',
    dosage: 'Paquet de 70',
    form: 'Lingettes',
    sku: 'LING01',
    description: 'Lingettes nettoyantes pour bébé',
    category: 'Puériculture',
    priceHT: 2500,
    taxRate: 18,
    priceTTC: 2950,
    stock: { onHand: 90, thresholdAlert: 18 },
    isPrescriptionRequired: false
  },
  {
    name: 'Lotion tonique',
    brand: 'Vichy',
    dosage: '200ml',
    form: 'Flacon',
    sku: 'LOT01',
    description: 'Lotion tonique purifiante',
    category: 'Cosmétiques',
    priceHT: 3500,
    taxRate: 18,
    priceTTC: 4130,
    stock: { onHand: 45, thresholdAlert: 9 },
    isPrescriptionRequired: false
  },
  {
    name: 'Lotion hydratante',
    brand: 'CeraVe',
    dosage: '236ml',
    form: 'Flacon',
    sku: 'LOTHYD01',
    description: 'Lotion hydratante corps',
    category: 'Cosmétiques',
    priceHT: 4000,
    taxRate: 18,
    priceTTC: 4720,
    stock: { onHand: 55, thresholdAlert: 11 },
    isPrescriptionRequired: false
  },
  {
    name: 'Masque chirurgical',
    brand: '3M',
    dosage: 'Boîte de 50',
    form: 'Masque',
    sku: 'MASQ01',
    description: 'Masques chirurgicaux jetables',
    category: 'Matériel médical',
    priceHT: 3000,
    taxRate: 18,
    priceTTC: 3540,
    stock: { onHand: 100, thresholdAlert: 20 },
    isPrescriptionRequired: false
  },
  {
    name: 'Pommade anti-inflammatoire',
    brand: 'Voltaren',
    dosage: '50g',
    form: 'Tube',
    sku: 'POMM01',
    description: 'Pommade anti-inflammatoire topique',
    category: 'Anti-inflammatoires',
    priceHT: 4500,
    taxRate: 18,
    priceTTC: 5310,
    stock: { onHand: 40, thresholdAlert: 8 },
    isPrescriptionRequired: false
  },
  {
    name: 'Poudre bébé',
    brand: 'Johnson\'s',
    dosage: '200g',
    form: 'Flacon',
    sku: 'POUD01',
    description: 'Poudre douce pour bébé',
    category: 'Puériculture',
    priceHT: 2000,
    taxRate: 18,
    priceTTC: 2360,
    stock: { onHand: 75, thresholdAlert: 15 },
    isPrescriptionRequired: false
  },
  {
    name: 'Rispéridone 2mg',
    brand: 'Janssen',
    dosage: '2mg',
    form: 'Comprimé',
    sku: 'RISP02',
    description: 'Antipsychotique',
    category: 'Psychotropes',
    priceHT: 12000,
    taxRate: 18,
    priceTTC: 14160,
    stock: { onHand: 20, thresholdAlert: 4 },
    isPrescriptionRequired: true
  },
  {
    name: 'Savon bébé',
    brand: 'Mustela',
    dosage: '150g',
    form: 'Pain',
    sku: 'SAVBEB01',
    description: 'Savon surgras pour bébé',
    category: 'Puériculture',
    priceHT: 1800,
    taxRate: 18,
    priceTTC: 2124,
    stock: { onHand: 60, thresholdAlert: 12 },
    isPrescriptionRequired: false
  },
  {
    name: 'Savon doux',
    brand: 'Dove',
    dosage: '100g',
    form: 'Pain',
    sku: 'SAVDOU01',
    description: 'Savon doux hydratant',
    category: 'Hygiène corporelle',
    priceHT: 1200,
    taxRate: 18,
    priceTTC: 1416,
    stock: { onHand: 100, thresholdAlert: 20 },
    isPrescriptionRequired: false
  },
  {
    name: 'Sertraline 50mg',
    brand: 'Pfizer',
    dosage: '50mg',
    form: 'Comprimé',
    sku: 'SERT50',
    description: 'Antidépresseur ISRS',
    category: 'Psychotropes',
    priceHT: 10000,
    taxRate: 18,
    priceTTC: 11800,
    stock: { onHand: 25, thresholdAlert: 5 },
    isPrescriptionRequired: true
  },
  {
    name: 'Shampoing',
    brand: 'L\'Oréal',
    dosage: '250ml',
    form: 'Flacon',
    sku: 'SHAM01',
    description: 'Shampoing tous types de cheveux',
    category: 'Hygiène capillaire',
    priceHT: 2800,
    taxRate: 18,
    priceTTC: 3304,
    stock: { onHand: 85, thresholdAlert: 17 },
    isPrescriptionRequired: false
  },
  {
    name: 'Sirop pour la toux',
    brand: 'Humex',
    dosage: '150ml',
    form: 'Flacon',
    sku: 'SIRTOUX01',
    description: 'Sirop expectorant',
    category: 'Antitussifs',
    priceHT: 3200,
    taxRate: 18,
    priceTTC: 3776,
    stock: { onHand: 65, thresholdAlert: 13 },
    isPrescriptionRequired: false
  }
];

const createProductsWithImages = async () => {
  try {
    console.log('🔄 Création des produits avec images automatiques...');
    console.log(`📦 ${productsToCreate.length} produits à traiter`);
    
    let created = 0;
    let skipped = 0;
    
    for (const productData of productsToCreate) {
      const existingProduct = await Product.findOne({ sku: productData.sku });
      
      if (existingProduct) {
        console.log(`⚠️  Produit ${productData.sku} existe déjà`);
        skipped++;
        continue;
      }
      
      // Attribution automatique de l'image Cloudinary
      const cloudinaryImage = findCloudinaryImage(productData.name);
      
      const productWithImage = {
        ...productData,
        image: cloudinaryImage
      };
      
      const product = new Product(productWithImage);
      await product.save();
      
      console.log(`✅ ${productData.name} → ${cloudinaryImage}`);
      created++;
    }
    
    console.log(`\n🎉 Résumé:`);
    console.log(`   ✅ ${created} produits créés`);
    console.log(`   ⚠️  ${skipped} produits ignorés (déjà existants)`);
    console.log(`   📸 Images automatiquement attribuées depuis Cloudinary`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

const main = async () => {
  console.log('🚀 Démarrage du script de création de produits...');
  await connectDB();
  await createProductsWithImages();
  await mongoose.disconnect();
  console.log('📝 Déconnexion de MongoDB');
};

main().catch(console.error);