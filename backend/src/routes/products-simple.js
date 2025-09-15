import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/products - Récupérer tous les produits depuis MongoDB
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Erreur produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des produits'
    });
  }
});

export default router;