const express = require('express');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { authGuard, requireRole } = require('../middleware/authGuard');
const { validate } = require('../middleware/validator');
const { createCategorySchema, updateCategorySchema } = require('../validators/categoryValidator');

const router = express.Router();

// Routes publiques
router.route('/')
    .get(getCategories);

router.route('/:id')
    .get(getCategory);

// Routes protégées (admin) - Applique l'authentification et la vérification du rôle
router.use(authGuard, requireRole('admin'));

router.route('/')
    .post(validate(createCategorySchema), createCategory);

router.route('/:id')
    .put(validate(updateCategorySchema), updateCategory)
    .delete(deleteCategory);

module.exports = router;