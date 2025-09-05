import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShoppingCart, Package, Heart, Eye, Filter, SortAsc, Search, X, Star, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import apiService from '../services/api';
import ProductCard from './ProductCard.jsx';

const ProductsPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    priceRange: '',
    prescription: '',
    inStock: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    loadProductsData();
  }, []);

  const loadProductsData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts({ limit: 100 }),
        apiService.getCategories()
      ]);

      const fetchedProducts = productsData?.data && Array.isArray(productsData.data) ? productsData.data : [];
      setProducts(fetchedProducts);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.trim()) {
      try {
        const result = await apiService.getProducts({ 
          search: query,
          ...searchFilters
        });
        setSearchResults(result?.data || []);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchInput = (query) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
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

  const sortProducts = (productsToSort) => {
    return [...productsToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.nom?.toLowerCase() || '';
          bValue = b.nom?.toLowerCase() || '';
          break;
        case 'price':
          aValue = a.prix || 0;
          bValue = b.prix || 0;
          break;
        case 'category':
          aValue = a.categorie?.toLowerCase() || '';
          bValue = b.categorie?.toLowerCase() || '';
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const filterProducts = (productsToFilter) => {
    return productsToFilter.filter(product => {
      if (selectedCategory && product.categorie !== selectedCategory) {
        return false;
      }
      if (searchFilters.inStock && product.stock <= 0) {
        return false;
      }
      if (searchFilters.prescription && product.prescription !== (searchFilters.prescription === 'true')) {
        return false;
      }
      return true;
    });
  };

  const displayProducts = searchQuery ? searchResults : products;
  const filteredProducts = filterProducts(displayProducts);
  const sortedProducts = sortProducts(filteredProducts);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Nos Produits</h1>
          
          {/* Barre de recherche */}
          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des médicaments..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtres et tri */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex flex-wrap gap-4">
              {/* Catégories */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.nom}>
                      {category.nom}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtres */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filtrer</span>
              </button>
            </div>

            {/* Tri */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">Nom</option>
                <option value="price">Prix</option>
                <option value="category">Catégorie</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SortAsc className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
              </button>
            </div>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gamme de prix
                  </label>
                  <select
                    value={searchFilters.priceRange}
                    onChange={(e) => setSearchFilters({...searchFilters, priceRange: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Tous les prix</option>
                    <option value="0-1000">0 - 1000 GNF</option>
                    <option value="1000-5000">1000 - 5000 GNF</option>
                    <option value="5000-10000">5000 - 10000 GNF</option>
                    <option value="10000+">10000+ GNF</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription
                  </label>
                  <select
                    value={searchFilters.prescription}
                    onChange={(e) => setSearchFilters({...searchFilters, prescription: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Tous</option>
                    <option value="true">Avec prescription</option>
                    <option value="false">Sans prescription</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={searchFilters.inStock}
                    onChange={(e) => setSearchFilters({...searchFilters, inStock: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                    En stock seulement
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Résultats */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              {sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}
            </p>
            {searchQuery && (
              <p className="text-sm text-gray-500">
                Résultats pour "{searchQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Grille de produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image du produit */}
              <div className="relative h-48 bg-gray-100">
                {product.image ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}${product.image}`}
                    alt={product.nom || product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x400.png/f3f4f6/9ca3af?text=${encodeURIComponent(product.nom || product.name || 'Produit')}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Badge de stock */}
                {product.stock <= 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Rupture
                  </div>
                )}
                
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
              </div>

              {/* Contenu */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.nom || product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.categorie || product.category}</p>
                
                {/* Prix */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-primary-600">
                    {(product.prix || product.price || 0).toLocaleString()} GNF
                  </span>
                  {product.discount > 0 && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                  
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun produit */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? "Essayez de modifier votre recherche ou vos filtres"
                : "Aucun produit disponible pour le moment"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
