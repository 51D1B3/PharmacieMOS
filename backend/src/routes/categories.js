import express from 'express';
const router = express.Router();
import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import { authGuard, requireRole } from '../middleware/authGuard.js';
import { validate } from '../middleware/validator.js';
import {
    createCategorySchema,
    updateCategorySchema,
    getCategoriesQuerySchema
} from '../validators/categoryValidator.js';

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

export default router;