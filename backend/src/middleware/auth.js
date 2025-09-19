export const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  
  // Simulation d'authentification pour les tests
  req.user = { _id: 'test-user', role: 'pharmacien' };
  next();
};

// Alias pour compatibilité
export const authenticateToken = auth;