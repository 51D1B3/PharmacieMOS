import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.jsx';
import connectionTracker from '../services/connectionTracker.js';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    // Clear session when window is closed
    const handleBeforeUnload = () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    initializeAuth();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { user, accessToken, refreshToken } = await apiService.login(email, password);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      // Marquer l'utilisateur comme connecté
      await connectionTracker.markUserConnected();
      
      return user; // Return user for role-based routing
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Gestion spécifique des erreurs réseau
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré.');
      }
      
      // Gestion des erreurs de connexion refusée
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Connexion refusée. Le serveur backend n\'est pas accessible.');
      }
      
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { user, accessToken, refreshToken } = await apiService.register(userData);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      
      // Gestion spécifique des erreurs 400
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || error.response.data?.error;
        if (errorMessage) {
          throw new Error(errorMessage);
        }
        throw new Error('Données invalides. Vérifiez vos informations.');
      }
      
      // Gestion des erreurs réseau
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Impossible de se connecter au serveur.');
      }
      
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du compte');
    }
  };

  const logout = async () => {
    // Marquer l'utilisateur comme déconnecté
    await connectionTracker.markUserDisconnected();
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = await apiService.updateProfile(userData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
