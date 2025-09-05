const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacie';

async function initializeDatabase() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Connecté à MongoDB');
        
        const db = client.db();
        
        // Créer les collections avec validation
        await createCollections(db);
        
        // Créer les index
        await createIndexes(db);
        
        // Créer l'utilisateur admin par défaut
        await createDefaultAdmin(db);
        
        // Créer les données de test
        await createSeedData(db);
        
        console.log('✅ Base de données initialisée avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

async function createCollections(db) {
    console.log('📁 Création des collections...');
    
    // Collection Users
    await db.createCollection('users', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['email', 'password', 'role'],
                properties: {
                    email: { bsonType: 'string' },
                    password: { bsonType: 'string' },
                    role: { enum: ['admin', 'client'] }
                }
            }
        }
    });
    
    // Collection Products
    await db.createCollection('products', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['name', 'sku', 'priceHT'],
                properties: {
                    name: { bsonType: 'string' },
                    sku: { bsonType: 'string' },
                    priceHT: { bsonType: 'number' }
                }
            }
        }
    });
    
    // Collection Orders
    await db.createCollection('orders', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['orderNumber', 'customerId', 'items'],
                properties: {
                    orderNumber: { bsonType: 'string' },
                    customerId: { bsonType: 'objectId' },
                    items: { bsonType: 'array' }
                }
            }
        }
    });
    
    // Collection Chats
    await db.createCollection('chats', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['senderId', 'recipientId', 'content'],
                properties: {
                    senderId: { bsonType: 'objectId' },
                    recipientId: { bsonType: 'objectId' },
                    content: { bsonType: 'string' }
                }
            }
        }
    });
    
    // Collection StockMovements
    await db.createCollection('stockmovements', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['productId', 'type', 'quantity'],
                properties: {
                    productId: { bsonType: 'objectId' },
                    type: { enum: ['in', 'out', 'adjustment'] },
                    quantity: { bsonType: 'number' }
                }
            }
        }
    });
    
    // Collection Suppliers
    await db.createCollection('suppliers', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['name', 'email'],
                properties: {
                    name: { bsonType: 'string' },
                    email: { bsonType: 'string' }
                }
            }
        }
    });
    
    // Collection Categories
    await db.createCollection('categories', {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['name', 'slug'],
                properties: {
                    name: { bsonType: 'string' },
                    slug: { bsonType: 'string' }
                }
            }
        }
    });
    
    console.log('✅ Collections créées');
}

async function createIndexes(db) {
    console.log('🔍 Création des index...');
    
    // Index pour Users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    
    // Index pour Products
    await db.collection('products').createIndex({ sku: 1 }, { unique: true });
    await db.collection('products').createIndex({ barcode: 1 });
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ supplierId: 1 });
    await db.collection('products').createIndex({ expiryDate: 1 });
    await db.collection('products').createIndex({ 'stock.onHand': 1 });
    
    // Index pour Orders
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ customerId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    
    // Index pour Chats
    await db.collection('chats').createIndex({ senderId: 1, recipientId: 1 });
    await db.collection('chats').createIndex({ conversationId: 1 });
    await db.collection('chats').createIndex({ createdAt: -1 });
    await db.collection('chats').createIndex({ read: 1 });
    
    // Index pour StockMovements
    await db.collection('stockmovements').createIndex({ productId: 1 });
    await db.collection('stockmovements').createIndex({ createdAt: -1 });
    await db.collection('stockmovements').createIndex({ type: 1 });
    
    // Index pour Suppliers
    await db.collection('suppliers').createIndex({ email: 1 }, { unique: true });
    await db.collection('suppliers').createIndex({ name: 1 });
    
    // Index pour Categories
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true });
    await db.collection('categories').createIndex({ parentId: 1 });
    
    console.log('✅ Index créés');
}

async function createDefaultAdmin(db) {
    console.log('👤 Création de l\'utilisateur admin par défaut...');
    
    const adminExists = await db.collection('users').findOne({ email: 'admin@pharmacie.com' });
    
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await db.collection('users').insertOne({
            firstName: 'Admin',
            lastName: 'Système',
            email: 'admin@pharmacie.com',
            password: hashedPassword,
            role: 'admin',
            permissions: ['*'],
            isActive: true,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        console.log('✅ Utilisateur admin créé: admin@pharmacie.com / admin123');
    } else {
        console.log('ℹ️ Utilisateur admin existe déjà');
    }
}

async function createSeedData(db) {
    console.log('🌱 Création des données de test...');
    
    // Créer des catégories
    const categories = [
        { name: 'Médicaments', slug: 'medicaments', description: 'Médicaments sur ordonnance et en vente libre' },
        { name: 'Parapharmacie', slug: 'parapharmacie', description: 'Produits de soins et d\'hygiène' },
        { name: 'Bébé', slug: 'bebe', description: 'Produits pour bébés et enfants' },
        { name: 'Beauté', slug: 'beaute', description: 'Produits de beauté et cosmétiques' },
        { name: 'Nutrition', slug: 'nutrition', description: 'Compléments alimentaires et nutrition' }
    ];
    
    for (const category of categories) {
        const exists = await db.collection('categories').findOne({ slug: category.slug });
        if (!exists) {
            await db.collection('categories').insertOne({
                ...category,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    }
    
    // Créer des fournisseurs
    const suppliers = [
        { name: 'PharmaPlus', email: 'contact@pharmaplus.com', phone: '+224123456789' },
        { name: 'MediSupply', email: 'info@medisupply.com', phone: '+224987654321' },
        { name: 'HealthCare Pro', email: 'sales@healthcarepro.com', phone: '+224555666777' }
    ];
    
    for (const supplier of suppliers) {
        const exists = await db.collection('suppliers').findOne({ email: supplier.email });
        if (!exists) {
            await db.collection('suppliers').insertOne({
                ...supplier,
                address: 'Conakry, Guinée',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    }
    
    // Créer des produits de test
    const products = [
        {
            name: 'Paracétamol 500mg',
            brand: 'Doliprane',
            dosage: '500mg',
            form: 'Comprimé',
            sku: 'PARA500-001',
            barcode: '1234567890123',
            description: 'Antidouleur et antipyrétique',
            category: 'medicaments',
            priceHT: 500,
            taxRate: 0.18,
            stock: { onHand: 100, reserved: 0, threshold: 20 },
            prescription: false,
            expiryDate: new Date('2025-12-31')
        },
        {
            name: 'Vitamine C 1000mg',
            brand: 'Vitabio',
            dosage: '1000mg',
            form: 'Comprimé effervescent',
            sku: 'VITC1000-001',
            barcode: '1234567890124',
            description: 'Complément alimentaire riche en vitamine C',
            category: 'nutrition',
            priceHT: 1500,
            taxRate: 0.18,
            stock: { onHand: 50, reserved: 0, threshold: 10 },
            prescription: false,
            expiryDate: new Date('2025-06-30')
        },
        {
            name: 'Gel douche hydratant',
            brand: 'Nivea',
            dosage: '250ml',
            form: 'Gel',
            sku: 'GEL250-001',
            barcode: '1234567890125',
            description: 'Gel douche hydratant pour tous types de peau',
            category: 'parapharmacie',
            priceHT: 2500,
            taxRate: 0.18,
            stock: { onHand: 75, reserved: 0, threshold: 15 },
            prescription: false,
            expiryDate: new Date('2026-03-31')
        }
    ];
    
    for (const product of products) {
        const exists = await db.collection('products').findOne({ sku: product.sku });
        if (!exists) {
            await db.collection('products').insertOne({
                ...product,
                priceTTC: product.priceHT * (1 + product.taxRate),
                images: [],
                tags: [],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    }
    
    console.log('✅ Données de test créées');
}

// Exécuter l'initialisation
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };
