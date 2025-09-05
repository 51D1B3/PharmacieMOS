import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Heart, Eye, Star, AlertTriangle, Filter, ChevronDown, X, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import apiService from '../services/api';
import { formatPrice, calculateDiscountPercentage } from '../services/priceFormatter';

const ProductsGrid = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filterProducts = React.useCallback(() => {
    let filtered = [...allProducts];
    
    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      if (selectedSubCategory) {
        // Filtrer par sous-catégorie
        filtered = filtered.filter(product => 
          product.category === selectedSubCategory ||
          product.categoryId === selectedSubCategory
        );
      } else {
        // Filtrer par catégorie principale et ses sous-catégories
        const categoryWithChildren = categories.find(cat => cat._id === selectedCategory);
        const categoryIds = [selectedCategory];
        if (categoryWithChildren?.children) {
          categoryIds.push(...categoryWithChildren.children.map(child => child._id));
        }
        
        filtered = filtered.filter(product => 
          categoryIds.includes(product.category) ||
          categoryIds.includes(product.categoryId)
        );
      }
    }
    
    setProducts(filtered);
  }, [allProducts, selectedCategory, selectedSubCategory, categories, searchTerm]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts({ limit: 50 });
      const fetchedProducts = response?.data && Array.isArray(response.data) ? response.data : [];
      setAllProducts(fetchedProducts);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      const fetchedCategories = Array.isArray(response) ? response : [];
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setCategories([]);
    }
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setShowCategoryFilter(false);
    setSearchTerm('');
  };

  const getSelectedCategoryName = () => {
    if (selectedSubCategory) {
      const parentCategory = categories.find(cat => 
        cat.children?.some(child => child._id === selectedSubCategory)
      );
      const subCategory = parentCategory?.children?.find(child => child._id === selectedSubCategory);
      return `${parentCategory?.name} > ${subCategory?.name}`;
    }
    if (selectedCategory) {
      const category = categories.find(cat => cat._id === selectedCategory);
      return category?.name;
    }
    return 'Toutes les catégories';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Nos Produits</h2>
        <p className="text-gray-600">{products.length} produits disponibles</p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {searchTerm && (
            <div className="text-sm text-gray-600">
              {products.length} résultat{products.length > 1 ? 's' : ''} pour "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* Filtres par catégories */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-primary-600" />
            Filtrer par catégorie
          </h3>
          {(selectedCategory || selectedSubCategory || searchTerm) && (
            <button
              onClick={resetFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sélection de catégorie principale */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie principale
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <span className="text-gray-900">
                  {selectedCategory ? 
                    categories.find(cat => cat._id === selectedCategory)?.name : 
                    'Sélectionner une catégorie'
                  }
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showCategoryFilter ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryFilter && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedSubCategory('');
                      setShowCategoryFilter(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                  >
                    Toutes les catégories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        setSelectedCategory(category._id);
                        setSelectedSubCategory('');
                        setShowCategoryFilter(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                        selectedCategory === category._id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      {category.name}
                      {category.children && category.children.length > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({category.children.length} sous-catégories)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sélection de sous-catégorie */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-catégorie
              </label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Toutes les sous-catégories</option>
                {categories
                  .find(cat => cat._id === selectedCategory)
                  ?.children?.map((subCategory) => (
                    <option key={subCategory._id} value={subCategory._id}>
                      {subCategory.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Affichage du filtre actuel */}
        {(selectedCategory || selectedSubCategory) && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700">
              <strong>Filtre actuel:</strong> {getSelectedCategoryName()}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const stockOnHand = product.stock?.onHand || 0;
          const isLowStock = stockOnHand <= (product.stock?.thresholdAlert || 5) && stockOnHand > 0;
          const isOutOfStock = stockOnHand === 0;
          const finalPrice = product.discountedPrice ?? product.priceTTC ?? product.prix;
          const originalPrice = product.priceTTC ?? product.prix;
          const hasDiscount = product.hasActiveDiscount && finalPrice < originalPrice;

          return (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
              {/* Image du produit */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
                    alt={product.name || product.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/400x400/e5e7eb/6b7280?text=${encodeURIComponent((product.name || product.nom || 'Produit').substring(0, 10))}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
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
                  className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                    isFavorite(product._id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite(product._id) ? 'fill-current' : ''}`} />
                </button>

                {/* Actions rapides */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                    <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                      <Eye className="h-5 w-5 text-gray-700" />
                    </button>
                    {!isOutOfStock && (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {product.name || product.nom}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {product.dosage} - {product.form}
                  </p>
                </div>
                
                {/* Prix */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <div className="flex flex-col mt-1">
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                        <span className="text-xs text-red-600 font-medium">
                          -{calculateDiscountPercentage(originalPrice, finalPrice)} d'économie
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => {
                      handleAddToCart(product);
                      // Feedback visuel temporaire
                      const btn = event.target.closest('button');
                      const originalText = btn.innerHTML;
                      btn.innerHTML = '<span class="text-sm">✓ Ajouté</span>';
                      btn.classList.add('bg-green-600');
                      setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('bg-green-600');
                      }, 1000);
                    }}
                    disabled={isOutOfStock}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                  
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Informations d'évaluation */}
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
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

      {/* Message si aucun produit */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit disponible</h3>
          <p className="text-gray-600">
            Les produits seront bientôt disponibles
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
