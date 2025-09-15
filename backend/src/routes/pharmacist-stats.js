import express from 'express';
import Order from '../models/Order.js';
import Prescription from '../models/Prescription.js';
import Product from '../models/Product.js';
import { authGuard } from '../middleware/authGuard.js';

const router = express.Router();

// Statistiques du pharmacien
router.get('/stats', authGuard, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ordonnances en attente
    const pendingPrescriptions = await Prescription.countDocuments({
      status: 'pending'
    });

    // Ventes du jour
    const todaySales = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled', 'failed'] }
    });

    // Revenus du jour
    const todayRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $nin: ['cancelled', 'failed'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalTTC' }
        }
      }
    ]);
    const todayRevenue = todayRevenueResult[0]?.total || 0;

    // Alertes stock faible
    const lowStockAlerts = await Product.countDocuments({
      $expr: { $lte: ['$stock.onHand', '$stock.thresholdAlert'] },
      isActive: true
    });

    // Ordonnances traitées aujourd'hui
    const processedPrescriptions = await Prescription.countDocuments({
      validatedAt: { $gte: today, $lt: tomorrow }
    });

    res.json({
      pendingPrescriptions,
      todaySales,
      todayRevenue,
      lowStockAlerts,
      processedPrescriptions
    });
  } catch (error) {
    console.error('Erreur stats pharmacien:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ordonnances récentes
router.get('/recent-prescriptions', authGuard, async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate('clientId', 'nom prenom');

    const formattedPrescriptions = prescriptions.map(p => ({
      id: p._id,
      patient: p.clientId ? `${p.clientId.prenom} ${p.clientId.nom}` : p.clientName,
      time: getTimeAgo(p.submittedAt),
      status: p.status
    }));

    res.json(formattedPrescriptions);
  } catch (error) {
    console.error('Erreur ordonnances récentes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ventes récentes
router.get('/recent-sales', authGuard, async (req, res) => {
  try {
    const sales = await Order.find({
      status: { $nin: ['cancelled', 'failed'] }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'nom prenom');

    const formattedSales = sales.map(s => ({
      id: s._id,
      client: s.customer ? `${s.customer.prenom} ${s.customer.nom}` : 'Client anonyme',
      amount: s.totalTTC,
      time: getTimeAgo(s.createdAt)
    }));

    res.json(formattedSales);
  } catch (error) {
    console.error('Erreur ventes récentes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}j`;
}

export default router;