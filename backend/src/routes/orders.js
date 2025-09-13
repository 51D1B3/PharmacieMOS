import express from 'express';
const router = express.Router();
import { authGuard, requireRole } from '../middleware/authGuard.js';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getMyOrders,
  cancelOrder,
  getOrderStats
} from '../controllers/orderController.js';

router.get('/', authGuard, requireRole(['admin']), getOrders);
router.get('/stats', authGuard, requireRole(['admin']), getOrderStats);
router.get('/my-orders', authGuard, getMyOrders);
router.get('/:id', authGuard, getOrder);
router.post('/', authGuard, createOrder);
router.patch('/:id/status', authGuard, requireRole(['admin']), updateOrderStatus);
router.post('/:id/cancel', authGuard, cancelOrder);

export default router;