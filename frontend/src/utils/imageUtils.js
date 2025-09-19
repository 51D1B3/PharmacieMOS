import { API_BASE_URL } from '../config/api.js';

/**
 * Utilitaire pour gérer les URLs d'images des produits
 * Supporte les images Cloudinary et les images locales
 */

/**
 * Génère l'URL complète d'une image de produit
 * @param {string} imageUrl - URL de l'image (peut être Cloudinary ou locale)
 * @param {string} fallbackText - Texte pour l'image de fallback
 * @returns {string} URL complète de l'image
 */
export const getProductImageUrl = (imageUrl, fallbackText = 'Produit') => {
  // Si pas d'image
  if (!imageUrl) {
    return `https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(fallbackText)}`;
  }
  
  // Si l'image est déjà une URL complète (Cloudinary ou autre)
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Fallback pour les autres cas
  return `https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(fallbackText)}`;
};

/**
 * Génère une URL de placeholder pour une image
 * @param {string} text - Texte à afficher
 * @param {string} size - Taille de l'image (ex: "400x400")
 * @returns {string} URL du placeholder
 */
export const getPlaceholderImageUrl = (text = 'Produit', size = '400x400') => {
  return `https://via.placeholder.com/${size}.png/f3f4f6/9ca3af?text=${encodeURIComponent(text)}`;
};

/**
 * Vérifie si une URL d'image est valide
 * @param {string} imageUrl - URL à vérifier
 * @returns {boolean} True si l'URL semble valide
 */
export const isValidImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return false;
  return imageUrl.startsWith('http') || imageUrl.startsWith('/uploads/');
};