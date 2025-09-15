import express from 'express';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { authGuard } from '../middleware/authGuard.js';

const router = express.Router();

// Récupérer les messages
router.get('/messages', authGuard, async (req, res) => {
  try {
    const messages = await Chat.find()
      .populate('sender', 'nom prenom role email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Envoyer un message
router.post('/messages', authGuard, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Trouver le pharmacien Algassimou Sow
    const pharmacist = await User.findOne({ email: 'algassimesow0@gmail.com' });
    
    const newMessage = new Chat({
      sender: req.user.id,
      message,
      recipient: pharmacist?._id,
      timestamp: new Date()
    });
    
    await newMessage.save();
    await newMessage.populate('sender', 'nom prenom role email');
    
    // Émettre le message via Socket.IO
    req.app.get('io').emit('new-message', newMessage);
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un message
router.put('/messages/:id', authGuard, async (req, res) => {
  try {
    const { message } = req.body;
    const messageDoc = await Chat.findById(req.params.id);
    
    if (!messageDoc || messageDoc.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    messageDoc.message = message;
    messageDoc.edited = true;
    await messageDoc.save();
    await messageDoc.populate('sender', 'nom prenom role email');
    
    req.app.get('io').emit('message-updated', messageDoc);
    res.json(messageDoc);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un message
router.delete('/messages/:id', authGuard, async (req, res) => {
  try {
    const messageDoc = await Chat.findById(req.params.id);
    
    if (!messageDoc || messageDoc.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    await Chat.findByIdAndDelete(req.params.id);
    req.app.get('io').emit('message-deleted', req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;