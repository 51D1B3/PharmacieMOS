import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/login - Connexion réelle
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Chercher l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role
        },
        accessToken: token,
        refreshToken: token
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion'
    });
  }
});

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      password,
      role: 'client'
    });

    // Générer le token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role
        },
        accessToken: token,
        refreshToken: token
      }
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription'
    });
  }
});

export default router;