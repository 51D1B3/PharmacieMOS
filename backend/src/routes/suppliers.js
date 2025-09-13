import express from 'express';
const router = express.Router();
import Joi from 'joi';
import {
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier
} from '../controllers/supplierController.js';
import { authGuard, requireRole } from '../middleware/authGuard.js';
import { validateBody } from '../middleware/errorHandler.js';

// Seul l'admin peut tout gérer
const canManage = requireRole('admin');

// Validation Schemas
const createSupplierSchema = Joi.object({
    name: Joi.string().required().min(2).max(150),
    contactPerson: Joi.string().max(100).allow('', null),
    email: Joi.string().email().required(),
    phone: Joi.string().max(20).allow('', null),
    address: Joi.object({
        street: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        zipCode: Joi.string().allow('', null),
        country: Joi.string().allow('', null)
    }).allow(null),
    notes: Joi.string().max(1000).allow('', null)
});

const updateSupplierSchema = Joi.object({
    name: Joi.string().min(2).max(150),
    contactPerson: Joi.string().max(100).allow('', null),
    email: Joi.string().email(),
    phone: Joi.string().max(20).allow('', null),
    address: Joi.object({
        street: Joi.string().allow('', null),
        city: Joi.string().allow('', null),
        zipCode: Joi.string().allow('', null),
        country: Joi.string().allow('', null)
    }).allow(null),
    notes: Joi.string().max(1000).allow('', null),
    isActive: Joi.boolean()
}).min(1); // Au moins un champ à mettre à jour

router.use(authGuard, canManage);

router.route('/')
    .get(getSuppliers)
    .post(validateBody(createSupplierSchema), createSupplier);

router.route('/:id')
    .get(getSupplier)
    .put(validateBody(updateSupplierSchema), updateSupplier)
    .delete(deleteSupplier);

export default router;
