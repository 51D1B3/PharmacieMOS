import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, ShoppingCart, Package, Heart, Eye, Star, AlertTriangle } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import apiService from '../services/api';

const ProductsModal = ({ isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const API_URL = process.env.REACT_APP_API_URL;
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const filterAndSortProducts = useCallback(() => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.dosage?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price_asc':
          return (a.priceTTC || 0) - (b.priceTTC || 0);
        case 'price_desc':
          return (b.priceTTC || 0) - (a.priceTTC || 0);
        case 'stock':
          return (b.stock?.onHand || 0) - (a.stock?.onHand || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, sortBy]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts({ limit: 200 });
      const fetchedProducts = response?.data && Array.isArray(response.data) ? response.data : [];
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav._id === product._id);
      if (isFavorite) {
        return prev.filter(fav => fav._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav._id === productId);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Tous nos Produits</h2>
                <p className="text-blue-100">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Barre de recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, marque, référence, catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtres */}
              <div className="flex gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Toutes catégories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Nom A-Z</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="stock">Stock disponible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des produits */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const stockOnHand = product.stock?.onHand || 0;
                  const isLowStock = stockOnHand <= (product.stock?.thresholdAlert || 5) && stockOnHand > 0;
                  const isOutOfStock = stockOnHand === 0;
                  const finalPrice = product.discountedPrice ?? product.priceTTC ?? product.prix;
                  const originalPrice = product.priceTTC ?? product.prix;
                  const hasDiscount = product.hasActiveDiscount && finalPrice < originalPrice;

                  return (
                    <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
                      {/* Image du produit */}
                      <div className="relative h-40 bg-gray-100 overflow-hidden">
                        {product.image ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL}${product.image}`}
                            alt={product.name || product.nom}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/300x300.png/f3f4f6/9ca3af?text=${encodeURIComponent(product.name || product.nom || 'Produit')}`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {hasDiscount && (
                            <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              PROMO
                            </div>
                          )}
                          {isOutOfStock && (
                            <div className="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              Rupture
                            </div>
                          )}
                          {isLowStock && !isOutOfStock && (
                            <div className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              Stock Faible
                            </div>
                          )}
                        </div>
                        
                        {/* Bouton favoris */}
                        <button
                          onClick={() => toggleFavorite(product)}
                          className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                            isFavorite(product._id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(product._id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Contenu */}
                      <div className="p-4">
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-medium">{product.brand}</p>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                            {product.name || product.nom}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {product.dosage} - {product.form}
                          </p>
                        </div>
                        
                        {/* Prix */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-bold text-blue-600">
                              {(finalPrice || 0).toLocaleString()} GNF
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-gray-500 line-through ml-2">
                                {(originalPrice || 0).toLocaleString()} GNF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 mb-3">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Ajouter</span>
                          </button>
                          
                          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Informations de stock et évaluation */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {isOutOfStock ? (
                            <div className="flex items-center text-red-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Indisponible
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-600">
                              <div className={`w-2 h-2 rounded-full mr-2 ${isLowStock ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                              {stockOnHand} en stock
                            </div>
                          )}
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="ml-1">{product.statistics?.averageRating?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          Réf: {product.sku}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsModal;
