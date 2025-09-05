const express = require('express');
const router = express.Router();
const { authGuard, requireRole } = require('../middleware/authGuard');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getMyOrders,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController');

router.get('/', authGuard, requireRole(['admin']), getOrders);
router.get('/stats', authGuard, requireRole(['admin']), getOrderStats);
router.get('/my-orders', authGuard, getMyOrders);
router.get('/:id', authGuard, getOrder);
router.post('/', authGuard, createOrder);
router.patch('/:id/status', authGuard, requireRole(['admin']), updateOrderStatus);
router.post('/:id/cancel', authGuard, cancelOrder);

module.exports = router;


