import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

// @desc    Récupérer tous les fournisseurs
// @route   GET /api/suppliers
// @access  Private (Admin)
export const getSuppliers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const query = { isActive: true };
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const suppliers = await Supplier.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    const total = await Supplier.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
        success: true,
        data: suppliers,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
        }
    });
});

// @desc    Récupérer un fournisseur par ID
// @route   GET /api/suppliers/:id
// @access  Private (Admin)
export const getSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier || !supplier.isActive) {
        throw new AppError('Fournisseur non trouvé', 404);
    }

    res.status(200).json({
        success: true,
        data: supplier
    });
});

// @desc    Créer un nouveau fournisseur
// @route   POST /api/suppliers
// @access  Private (Admin)
export const createSupplier = asyncHandler(async (req, res) => {
    const { name, contactPerson, email, phone, address, notes } = req.body;

    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
        throw new AppError('Un fournisseur avec cet email existe déjà', 400);
    }

    const supplier = await Supplier.create({
        name,
        contactPerson,
        email,
        phone,
        address,
        notes,
        createdBy: req.user.id
    });

    logger.info(`Fournisseur créé: ${supplier.name} par ${req.user.email}`);

    res.status(201).json({
        success: true,
        data: supplier
    });
});

// @desc    Mettre à jour un fournisseur
// @route   PUT /api/suppliers/:id
// @access  Private (Admin)
export const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier || !supplier.isActive) {
        throw new AppError('Fournisseur non trouvé', 404);
    }

    if (req.body.email && req.body.email !== supplier.email) {
        const existingSupplier = await Supplier.findOne({ email: req.body.email });
        if (existingSupplier) {
            throw new AppError('Un fournisseur avec cet email existe déjà', 400);
        }
    }

    const updateData = { ...req.body, updatedBy: req.user.id };
    
    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });

    logger.info(`Fournisseur mis à jour: ${updatedSupplier.name} par ${req.user.email}`);

    res.status(200).json({
        success: true,
        data: updatedSupplier
    });
});

// @desc    Supprimer un fournisseur (soft delete)
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
export const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
        throw new AppError('Fournisseur non trouvé', 404);
    }

    // Vérifier si le fournisseur est lié à des produits
    const productCount = await Product.countDocuments({ supplierId: supplier._id, isActive: true });
    if (productCount > 0) {
        throw new AppError(`Impossible de supprimer le fournisseur car il est associé à ${productCount} produit(s) actif(s).`, 400);
    }

    // Soft delete
    supplier.isActive = false;
    supplier.updatedBy = req.user.id;
    await supplier.save();

    logger.info(`Fournisseur supprimé: ${supplier.name} par ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'Fournisseur supprimé avec succès'
    });
});
