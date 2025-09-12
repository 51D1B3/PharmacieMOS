const Product = (await import('../models/Product.js')).default;
const Category = require('../models/Category.js');
const Supplier = require('../models/Supplier.js');
const StockMovement = require('../models/StockMovement.js');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const logger = { info: console.log, error: console.error };

// @desc    Récupérer tous les produits avec pagination et filtres
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        search,
        category,
        minPrice,
        maxPrice,
        inStock,
        prescription,
        sortBy = 'name',
        sortOrder = 'asc'
    } = req.query;

    const query = { isActive: true };

    if (search) {
        query.$text = { $search: search };
    }

    if (category) {
        query.category = category;
    }

    if (prescription !== undefined) {
        query.isPrescriptionRequired = prescription === 'true';
    }

    if (inStock !== undefined) {
        query['stock.onHand'] = inStock === 'true' ? { $gt: 0 } : { $lte: 0 };
    }

    if (minPrice || maxPrice) {
        query.priceTTC = {};
        if (minPrice) query.priceTTC.$gte = parseFloat(minPrice);
        if (maxPrice) query.priceTTC.$lte = parseFloat(maxPrice);
    }

    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const products = await Product.find(query)
        .populate('category', 'name slug')
        .populate('supplierId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean();

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit, 10));

    res.status(200).json({
        success: true,
        data: products,
        pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total,
            totalPages,
            hasNextPage: parseInt(page, 10) < totalPages,
            hasPrevPage: parseInt(page, 10) > 1
        }
    });
});

// @desc    Récupérer un produit par ID
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('supplierId', 'name email phone')
        .populate('category', 'name slug')
        .populate('createdBy', 'nom prenom')
        .lean();

    if (!product) {
        throw new AppError('Produit non trouvé avec cet ID', 404);
    }

    Product.updateOne({ _id: product._id }, { $inc: { 'statistics.views': 1 } }).exec();

    if (product.statistics) {
        product.statistics.views += 1;
    } else {
        product.statistics = { views: 1 };
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Récupérer un produit par SKU
// @route   GET /api/products/sku/:sku
// @access  Public
const getProductBySku = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ sku: req.params.sku, isActive: true })
        .populate('supplierId', 'name')
        .populate('category', 'name slug');

    if (!product) {
        throw new AppError('Produit non trouvé avec ce SKU', 404);
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Récupérer un produit par code-barres
// @route   GET /api/products/barcode/:barcode
// @access  Public
const getProductByBarcode = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ barcode: req.params.barcode, isActive: true })
        .populate('supplierId', 'name')
        .populate('category', 'name slug');

    if (!product) {
        throw new AppError('Produit non trouvé avec ce code-barres', 404);
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Créer un nouveau produit
// @route   POST /api/products
// @access  Private (Admin, Pharmacist)
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        brand,
        dosage,
        form,
        sku,
        barcode,
        description,
        category,
        supplierId,
        priceHT,
        taxRate,
        stock,
        isPrescriptionRequired,
        expiryDate,
        tags,
        discount,
        image
    } = req.body;

    let imagePath = image;
    if (req.file) {
        imagePath = `/uploads/products/${req.file.filename}`;
    }

    if (!imagePath) {
        throw new AppError("L'image du produit est requise.", 400);
    }

    if (await Product.findOne({ sku })) {
        throw new AppError('Un produit avec ce SKU existe déjà', 400);
    }

    if (barcode && await Product.findOne({ barcode })) {
        throw new AppError('Un produit avec ce code-barres existe déjà', 400);
    }

    if (!await Category.findById(category)) {
        throw new AppError('La catégorie spécifiée n\'existe pas', 400);
    }

    if (!await Supplier.findById(supplierId)) {
        throw new AppError('Le fournisseur spécifié n\'existe pas', 400);
    }

    const product = await Product.create({
        ...req.body,
        image: imagePath,
        createdBy: req.user.id
    });

    if (stock && stock.onHand > 0) {
        await StockMovement.create({
            productId: product._id,
            type: 'in',
            quantity: stock.onHand,
            reference: `Initial stock for ${product.sku}`,
            stockBefore: 0,
            stockAfter: stock.onHand,
            reason: 'initial_stock',
            createdBy: req.user.id
        });
    }

    await product.populate('supplierId', 'name');
    await product.populate('category', 'name slug');

    logger.info(`Produit créé: ${product.sku} par ${req.user.email}`);

    res.status(201).json({
        success: true,
        data: product
    });
});

// @desc    Mettre à jour un produit
// @route   PUT /api/products/:id
// @access  Private (Admin, Pharmacist)
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new AppError('Produit non trouvé', 404);
    }

    if (req.body.sku && req.body.sku !== product.sku && await Product.findOne({ sku: req.body.sku })) {
        throw new AppError('Un produit avec ce SKU existe déjà', 400);
    }

    if (req.body.barcode && req.body.barcode !== product.barcode && await Product.findOne({ barcode: req.body.barcode })) {
        throw new AppError('Un produit avec ce code-barres existe déjà', 400);
    }

    if (req.body.category && !await Category.findById(req.body.category)) {
        throw new AppError('La catégorie spécifiée n\'existe pas', 400);
    }

    if (req.body.supplierId && !await Supplier.findById(req.body.supplierId)) {
        throw new AppError('Le fournisseur spécifié n\'existe pas', 400);
    }

    const oldStock = product.stock.onHand;
    const updateData = { ...req.body };

    if (req.file) {
        updateData.image = `/uploads/products/${req.file.filename}`;
    }

    Object.assign(product, updateData);
    product.updatedBy = req.user.id;
    await product.save();

    const newStock = product.stock.onHand;
    if (newStock !== oldStock) {
        await StockMovement.create({
            productId: product._id,
            type: newStock > oldStock ? 'in' : 'out',
            quantity: Math.abs(newStock - oldStock),
            stockBefore: oldStock,
            stockAfter: newStock,
            reason: 'adjustment',
            createdBy: req.user.id
        });
    }

    await product.populate('supplierId', 'name');
    await product.populate('category', 'name slug');

    logger.info(`Produit mis à jour: ${product.sku} par ${req.user.email}`);

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Supprimer un produit (soft delete)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new AppError('Produit non trouvé', 404);
    }

    const { default: Order } = await import('../models/Order.js');
    const activeOrders = await Order.countDocuments({
        'items.product': product._id,
        status: { $in: ['pending', 'confirmed', 'preparing'] }
    });

    if (activeOrders > 0) {
        throw new AppError(`Impossible de désactiver le produit, ${activeOrders} commande(s) en cours.`, 400);
    }

    product.isActive = false;
    product.isAvailable = false;
    product.updatedBy = req.user.id;
    await product.save();

    logger.info(`Produit désactivé: ${product.sku} par ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'Produit désactivé avec succès'
    });
});

// @desc    Ajuster le stock d'un produit
// @route   POST /api/products/:id/stock
// @access  Private (Admin, Pharmacist)
const adjustStock = asyncHandler(async (req, res) => {
    const { quantity, reason, notes, batchNumber, expiryDate } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new AppError('Produit non trouvé', 404);
    }

    const oldStock = product.stock.onHand;
    const newStock = oldStock + quantity;

    if (newStock < 0) {
        throw new AppError('Le stock ne peut pas être négatif', 400);
    }

    product.stock.onHand = newStock;
    await product.save();

    const stockMovement = await StockMovement.create({
        productId: product._id,
        type: quantity > 0 ? 'in' : 'out',
        quantity: Math.abs(quantity),
        stockBefore: oldStock,
        stockAfter: newStock,
        reason: reason || 'adjustment',
        notes,
        batchNumber,
        expiryDate,
        createdBy: req.user.id
    });

    logger.info(`Stock ajusté pour ${product.sku}: ${oldStock} → ${newStock} par ${req.user.email}`);

    res.status(200).json({
        success: true,
        data: {
            product,
            stockMovement
        }
    });
});

// @desc    Récupérer l'historique des mouvements de stock
// @route   GET /api/products/:id/stock-history
// @access  Private (Admin, Pharmacist)
const getStockHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type } = req.query;

    if (!await Product.findById(req.params.id)) {
        throw new AppError('Produit non trouvé', 404);
    }

    const query = { productId: req.params.id };
    if (type) query.type = type;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const movements = await StockMovement.find(query)
        .populate('createdBy', 'nom prenom')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean();

    const total = await StockMovement.countDocuments(query);

    res.status(200).json({
        success: true,
        data: movements,
        pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total,
            totalPages: Math.ceil(total / parseInt(limit, 10))
        }
    });
});

// @desc    Rechercher des produits
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
        return res.status(200).json({ success: true, data: [] });
    }

    const products = await Product.find(
        { $text: { $search: q }, isActive: true },
        { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit, 10))
    .select('name sku priceTTC image')
    .lean();

    res.status(200).json({
        success: true,
        data: products
    });
});

// @desc    Récupérer les produits en rupture de stock
// @route   GET /api/products/out-of-stock
// @access  Private (Admin, Pharmacist)
const getOutOfStockProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const query = { 'stock.onHand': { $lte: 0 }, isActive: true };
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const products = await Product.find(query)
        .populate('supplierId', 'name')
        .populate('category', 'name')
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean();

    const total = await Product.countDocuments(query);

    res.status(200).json({
        success: true,
        data: products,
        pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total,
            totalPages: Math.ceil(total / parseInt(limit, 10))
        }
    });
});

// @desc    Récupérer les produits expirant bientôt
// @route   GET /api/products/expiring-soon
// @access  Private (Admin, Pharmacist)
const getExpiringSoonProducts = asyncHandler(async (req, res) => {
    const { days = 30, page = 1, limit = 20 } = req.query;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days, 10));

    const query = {
        expiryDate: { $lte: expiryDate, $gte: new Date() },
        'stock.onHand': { $gt: 0 },
        isActive: true
    };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const products = await Product.find(query)
        .populate('supplierId', 'name')
        .populate('category', 'name')
        .sort({ expiryDate: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean();

    const total = await Product.countDocuments(query);

    res.status(200).json({
        success: true,
        data: products,
        pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total,
            totalPages: Math.ceil(total / parseInt(limit, 10))
        }
    });
});

// @desc    Récupérer les produits avec stock faible
// @route   GET /api/products/alerts/low-stock
// @access  Private (Admin, Pharmacist)
const getLowStockProducts = asyncHandler(async (req, res) => {
    const { threshold = 50, page = 1, limit = 20 } = req.query;

    const query = {
        $expr: {
            $lte: [
                { $subtract: ['$stock.onHand', '$stock.reserved'] },
                parseInt(threshold, 10)
            ]
        },
        isActive: true
    };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const products = await Product.find(query)
        .populate('supplierId', 'name')
        .populate('category', 'name')
        .sort({ 'stock.onHand': 1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean();

    const total = await Product.countDocuments(query);

    res.status(200).json({
        success: true,
        data: products,
        pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total,
            totalPages: Math.ceil(total / parseInt(limit, 10))
        }
    });
});

export {
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
};
