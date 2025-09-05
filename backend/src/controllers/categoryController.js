const Category = require('../models/Category');
const Product = require('../models/Product');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// @desc    Récupérer toutes les catégories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc', tree = false } = req.query;

    if (tree) {
        const allCategories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
        const categoryMap = {};
        
        // Crée une map pour un accès rapide
        allCategories.forEach(category => {
            categoryMap[category._id] = { ...category, children: [] };
        });

        const tree = [];
        allCategories.forEach(category => {
            if (category.parentId) {
                if (categoryMap[category.parentId]) {
                    categoryMap[category.parentId].children.push(categoryMap[category._id]);
                }
            } else {
                tree.push(categoryMap[category._id]);
            }
        });

        return res.status(200).json({ success: true, data: tree });
    }

    const query = {};
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const categories = await Category.find(query)
        .populate('parent', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    const total = await Category.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
        success: true,
        data: categories,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
        }
    });
});

// @desc    Récupérer une catégorie par ID
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).populate('parent').populate('children');

    if (!category) {
        throw new AppError('Catégorie non trouvée', 404);
    }

    res.status(200).json({
        success: true,
        data: category
    });
});

// @desc    Créer une nouvelle catégorie
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = asyncHandler(async (req, res) => {
    // La validation est maintenant gérée par le middleware Joi.
    const { name, parentId } = req.body;

    // 1. Vérifier si le parentId, s'il est fourni, est valide
    if (parentId) {
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
            throw new AppError('La catégorie parente spécifiée n\'existe pas', 404);
        }
    }

    // 2. Vérifier si une catégorie avec le même nom existe déjà au même niveau hiérarchique
    const existingCategory = await Category.findOne({
        name,
        parentId: parentId || null // Recherche avec le même parent (ou à la racine si pas de parentId)
    });

    if (existingCategory) {
        throw new AppError('Une catégorie avec ce nom existe déjà sous ce parent', 400);
    }

    // Préparer les données pour la création en ajoutant l'ID de l'utilisateur
    const categoryData = {
        ...req.body,
        createdBy: req.user.id // Assurez-vous que req.user est bien défini par votre authGuard
    };

    const category = await Category.create(categoryData);

    logger.info(`Catégorie créée: ${category.name} par ${req.user.email}`);

    res.status(201).json({
        success: true,
        data: category
    });
});

// @desc    Mettre à jour une catégorie
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = asyncHandler(async (req, res) => {
    // req.body est déjà validé et nettoyé par le middleware Joi
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findById(id);

    if (!category) {
        throw new AppError('Catégorie non trouvée', 404);
    }

    // Si le nom est modifié, vérifier son unicité par rapport aux autres catégories
    if (updateData.name && updateData.name !== category.name) { 
        const existingCategory = await Category.findOne({
            name: updateData.name,
            parentId: category.parentId // Vérifie l'unicité au sein du même parent
        });
        if (existingCategory) {
            throw new AppError('Une catégorie avec ce nom existe déjà', 400);
        }
    }

    // Appliquer les mises à jour
    Object.assign(category, updateData);
    category.updatedBy = req.user.id;
    await category.save();

    logger.info(`Catégorie mise à jour: ${category.name} par ${req.user.email}`);

    res.status(200).json({
        success: true,
        data: category
    });
});

// @desc    Supprimer une catégorie
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        throw new AppError('Catégorie non trouvée', 404);
    }

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
        throw new AppError(`Impossible de supprimer la catégorie car elle est associée à ${productCount} produit(s).`, 400);
    }

    const childrenCount = await Category.countDocuments({ parentId: category._id });
    if (childrenCount > 0) {
        throw new AppError(`Impossible de supprimer la catégorie car elle a ${childrenCount} sous-catégorie(s).`, 400);
    }

    await category.deleteOne();

    logger.info(`Catégorie supprimée: ${category.name} par ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'Catégorie supprimée avec succès'
    });
});

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
