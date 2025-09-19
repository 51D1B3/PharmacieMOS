import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    // Données de test
    const products = [
      {
        _id: '1',
        name: 'Paracétamol 500mg',
        category: 'Antalgiques',
        priceTTC: 2500,
        stock: { onHand: 50, thresholdAlert: 10 },
        image: '/uploads/products/paracetamol_products.png'
      },
      {
        _id: '2', 
        name: 'Amoxicilline 250mg',
        category: 'Antibiotiques',
        priceTTC: 5000,
        stock: { onHand: 25, thresholdAlert: 5 },
        image: '/uploads/products/Amoxicilline_products.jpg'
      },
      {
        _id: '3',
        name: 'Aspirine 100mg',
        category: 'Antalgiques',
        priceTTC: 1500,
        stock: { onHand: 75, thresholdAlert: 15 },
        image: '/uploads/products/Aspirine_products.jpg'
      },
      {
        _id: '4',
        name: 'Ibuprofène 400mg',
        category: 'Anti-inflammatoires',
        priceTTC: 3000,
        stock: { onHand: 30, thresholdAlert: 8 },
        image: '/uploads/products/Ibuprofène_products.png'
      }
    ];
    
    res.json({ data: products });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;