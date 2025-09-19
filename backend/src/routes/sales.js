import express from 'express';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

const router = express.Router();

// Enregistrer une nouvelle vente
router.post('/', async (req, res) => {
  try {
    const { productId, quantity, clientName } = req.body;

    // Récupérer le produit
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    // Vérifier le stock
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Stock insuffisant' });
    }

    // Calculer le prix total
    const totalPrice = product.price * quantity;

    // Créer la vente
    const sale = new Sale({
      productId,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice,
      clientName: clientName || 'Client anonyme'
    });

    await sale.save();

    // Mettre à jour le stock
    product.stock -= quantity;
    await product.save();

    // Envoyer notification WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('pharmacist').emit('new-sale', {
        sale: await sale.populate('productId'),
        remainingStock: product.stock
      });
    }

    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer les ventes du jour
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sales = await Sale.find({
      createdAt: { $gte: today }
    }).populate('productId').sort({ createdAt: -1 });

    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/sales/backup - Sauvegarder les ventes du jour
router.post('/backup', async (req, res) => {
  try {
    const { date } = req.body;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const sales = await Sale.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    
    res.json({
      success: true,
      salesCount: sales.length,
      totalRevenue,
      date,
      message: 'Sauvegarde effectuée avec succès'
    });
  } catch (error) {
    console.error('Erreur sauvegarde ventes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;