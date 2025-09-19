import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Récupérer tous les pharmaciens
router.get('/pharmacists', async (req, res) => {
  try {
    const pharmacists = await User.find({ role: 'pharmacien' }).select('-password');
    res.json({ success: true, data: pharmacists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer tous les clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password');
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;