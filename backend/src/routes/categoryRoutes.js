import express from 'express';
const router = express.Router();
import Joi from 'joi';
import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import { authGuard, requireRole } from '../middleware/authGuard.js';
import { validateBody } from '../middleware/errorHandler.js';

// Schéma de validation pour un ObjectId de MongoDB
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId');

// Schéma de validation pour la création d'une catégorie
const createCategorySchema = Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
        'string.empty': 'Le nom de la catégorie est requis',
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 100 caractères'
    }),
    description: Joi.string().max(500).allow('', null),
    parentId: objectId.allow(null).messages({
        'string.pattern.base': 'L\'ID du parent doit être un ObjectId valide'
    })
});

// Schéma de validation pour la mise à jour d'une catégorie
const updateCategorySchema = Joi.object({
    name: Joi.string().min(2).max(100).messages({
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 100 caractères'
    }),
    description: Joi.string().max(500).allow('', null),
    parentId: objectId.allow(null).messages({
        'string.pattern.base': 'L\'ID du parent doit être un ObjectId valide'
    })
}).min(1).messages({
    'object.min': 'Vous devez fournir au moins un champ à mettre à jour'
});


router.route('/')
    .get(getCategories)
    .post(authGuard, requireRole(['admin']), validateBody(createCategorySchema), createCategory);

router.route('/:id')
    .get(getCategory)
    .put(authGuard, requireRole(['admin']), validateBody(updateCategorySchema), updateCategory)
    .delete(authGuard, requireRole(['admin']), deleteCategory);

export default router;
