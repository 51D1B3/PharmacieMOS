const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    getProductBySku,
    getProductByBarcode,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    getStockHistory,
    searchProducts,
    getOutOfStockProducts,
    getExpiringSoonProducts,
    getLowStockProducts
} = require('../controllers/productController');

const { authGuard, requireRole, requirePermission } = require('../middleware/authGuard');
const { validateBody, validateQuery } = require('../middleware/errorHandler');
const upload = require('../middleware/upload');
const Joi = require('joi');

// Schémas de validation
const createProductSchema = Joi.object({
    name: Joi.string().required().min(2).max(200),
    brand: Joi.string().required().max(100),
    dosage: Joi.string().required().max(50),
    form: Joi.string().required().valid('comprimé', 'sirop', 'gélule', 'crème', 'pommade', 'injection', 'suppositoire', 'collyre', 'spray', 'autre'),
    sku: Joi.string().required().max(50),
    barcode: Joi.string().max(50),
    description: Joi.string().max(1000),
    category: Joi.string().hex().length(24).required(),
    supplierId: Joi.string().hex().length(24).required(),
    priceHT: Joi.number().required().min(0),
    taxRate: Joi.number().min(0).max(100).default(0),
    stock: Joi.object({
        onHand: Joi.number().min(0).default(0),
        reserved: Joi.number().min(0).default(0),
        thresholdAlert: Joi.number().min(0).default(10)
    }),
    isPrescriptionRequired: Joi.boolean().default(false),
    expiryDate: Joi.date().min('now'),
    tags: Joi.array().items(Joi.string()),
    image: Joi.string().optional() // Permet de passer le chemin de l'image dans le corps
});

const updateProductSchema = Joi.object({
    name: Joi.string().min(2).max(200),
    brand: Joi.string().max(100),
    dosage: Joi.string().max(50),
    form: Joi.string().valid('comprimé', 'sirop', 'gélule', 'crème', 'pommade', 'injection', 'suppositoire', 'collyre', 'spray', 'autre'),
    sku: Joi.string().max(50),
    barcode: Joi.string().max(50),
    description: Joi.string().max(1000),
    category: Joi.string().hex().length(24),
    supplierId: Joi.string().hex().length(24),
    priceHT: Joi.number().min(0),
    taxRate: Joi.number().min(0).max(100),
    stock: Joi.object({
        onHand: Joi.number().min(0),
        reserved: Joi.number().min(0),
        thresholdAlert: Joi.number().min(0)
    }),
    isPrescriptionRequired: Joi.boolean(),
    expiryDate: Joi.date().min('now'),
    tags: Joi.array().items(Joi.string()),
    image: Joi.string().optional() // Permet de passer le chemin de l'image dans le corps
});

const adjustStockSchema = Joi.object({
    quantity: Joi.number().required(),
    reason: Joi.string().valid(
        'purchase', 'sale', 'return', 'damage', 'expiry', 'theft', 'adjustment',
        'transfer_in', 'transfer_out', 'inventory_correction', 'quality_control'
    ),
    notes: Joi.string().max(500),
    batchNumber: Joi.string().max(100),
    expiryDate: Joi.date()
});

const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().min(2),
    category: Joi.string(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    inStock: Joi.boolean(),
    prescription: Joi.boolean(),
    sortBy: Joi.string().valid('name', 'priceTTC', 'createdAt', 'stock.onHand').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

// Routes publiques
router.get('/', validateQuery(querySchema), getProducts);
router.get('/search', searchProducts);
router.get('/sku/:sku', getProductBySku);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProduct);

// Routes protégées - Admin uniquement
router.post('/', 
    authGuard, 
    requireRole(['admin']), 
    upload.single('image'),
    validateBody(createProductSchema), 
    createProduct
);

router.put('/:id', 
    authGuard, 
    requireRole(['admin']), 
    upload.single('image'),
    validateBody(updateProductSchema), 
    updateProduct
);

router.post('/:id/stock', 
    authGuard, 
    requireRole(['admin']), 
    validateBody(adjustStockSchema), 
    adjustStock
);

router.get('/:id/stock-history', 
    authGuard, 
    requireRole(['admin']), 
    getStockHistory
);

// Routes protégées - Admin seulement
router.delete('/:id', 
    authGuard, 
    requireRole(['admin']), 
    deleteProduct
);

// Routes pour les alertes de stock
router.get('/alerts/out-of-stock', 
    authGuard, 
    requireRole(['admin']), 
    getOutOfStockProducts
);

router.get('/alerts/expiring-soon', 
    authGuard, 
    requireRole(['admin']), 
    getExpiringSoonProducts
);

router.get('/alerts/low-stock', 
    authGuard, 
    requireRole(['admin']), 
    getLowStockProducts
);

module.exports = router;
