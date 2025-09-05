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
const {
    createCategorySchema,
    updateCategorySchema,
    getCategoriesQuerySchema
} = require('../validators/categoryValidator');

const router = express.Router();

// Routes publiques
router.route('/')
    .get(validate(getCategoriesQuerySchema, 'query'), getCategories);

router.route('/:id')
    .get(getCategory);

// Routes protégées - Admin uniquement
router.use(authGuard, requireRole('admin'));

router.route('/')
    .post(validate(createCategorySchema, 'body'), createCategory);

router.route('/:id')
    .put(validate(updateCategorySchema, 'body'), updateCategory)
    .delete(deleteCategory);

module.exports = router;
