const express = require('express');
const router = express.Router();
const {
    createSupplier,
    getSuppliers,
    getSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controllers/supplierController');
const { authGuard, requireRole } = require('../middleware/authGuard');

// Routes publiques
router.get('/', getSuppliers);
router.get('/:id', getSupplier);

// Routes protégées (Admin)
router.post('/', authGuard, requireRole('admin'), createSupplier);
router.put('/:id', authGuard, requireRole('admin'), updateSupplier);
router.delete('/:id', authGuard, requireRole('admin'), deleteSupplier);

module.exports = router;

