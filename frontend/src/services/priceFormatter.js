/**
 * Utilitaire pour formater les prix en GNF (Francs Guinéens)
 */

/**
 * Formate un prix en GNF avec séparateurs de milliers
 * @param {number} price - Le prix à formater
 * @param {boolean} showCurrency - Afficher ou non la devise (défaut: true)
 * @returns {string} Prix formaté
 */
export const formatPrice = (price, showCurrency = true) => {
  if (price === null || price === undefined || isNaN(price)) {
    return showCurrency ? '0 GNF' : '0';
  }
  
  const formattedPrice = Math.round(price).toLocaleString('fr-FR');
  return showCurrency ? `${formattedPrice} GNF` : formattedPrice;
};

/**
 * Formate un prix avec remise
 * @param {number} originalPrice - Prix original
 * @param {number} discountedPrice - Prix avec remise
 * @returns {object} Objet contenant les prix formatés
 */
export const formatPriceWithDiscount = (originalPrice, discountedPrice) => {
  return {
    original: formatPrice(originalPrice),
    discounted: formatPrice(discountedPrice),
    savings: formatPrice(originalPrice - discountedPrice)
  };
};

/**
 * Calcule et formate le pourcentage de remise
 * @param {number} originalPrice - Prix original
 * @param {number} discountedPrice - Prix avec remise
 * @returns {string} Pourcentage de remise formaté
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) {
    return '0%';
  }
  
  const percentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  return `${percentage}%`;
};