import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Plus, Package } from 'lucide-react';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  searchResults, 
  onAddToCart, 
  onClearSearch,
  filters,
  onFiltersChange,
  categories = []
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onSearchChange(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  const handleResultClick = (product) => {
    onAddToCart(product);
    onClearSearch();
    setShowResults(false);
  };

  const renderCategoryOptions = (categories, level = 0) => {
    return categories.flatMap(category => {
      const prefix = '\u00A0\u00A0'.repeat(level);
      const option = (
        <option key={category._id} value={category._id}>
          {prefix}{category.name}
        </option>
      );
      if (category.children && category.children.length > 0) {
        return [option, ...renderCategoryOptions(category.children, level + 1)];
      }
      return option;
    });
  };

  return (
    <div className="relative flex-1 max-w-2xl mx-8" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setShowResults(searchQuery.length > 0)}
          className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Rechercher des médicaments par nom, marque ou catégorie..."
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="p-1 text-gray-400 hover:text-gray-500"
              title="Effacer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded ${showFilters ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-500'}`}
            title="Filtres"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">Toutes les catégories</option>
              {renderCategoryOptions(categories)}
            </select>
            
            <select
              value={filters.priceRange}
              onChange={(e) => onFiltersChange({ ...filters, priceRange: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">Tous les prix</option>
              <option value="0-10">0 - 10€</option>
              <option value="10-25">10 - 25€</option>
              <option value="25-50">25 - 50€</option>
              <option value="50-100">50 - 100€</option>
              <option value="100+">100€+</option>
            </select>
            
            <select
              value={filters.prescription}
              onChange={(e) => onFiltersChange({ ...filters, prescription: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">Tous les types</option>
              <option value="false">Sans ordonnance</option>
              <option value="true">Avec ordonnance</option>
            </select>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFiltersChange({ ...filters, inStock: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">En stock</span>
            </label>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-40">
          {searchResults.map((product) => (
            <div
              key={product._id}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleResultClick(product)}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {product.image ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}${product.image}`}
                    alt={product.name || 'Product image'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=No+Image" }} // Fallback for broken images
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.brand}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-medium text-primary-600">{product.priceTTC.toFixed(2)} €</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    (product.stock?.onHand || 0) > 10 ? 'bg-green-100 text-green-800' :
                    (product.stock?.onHand || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(product.stock?.onHand || 0) > 0 ? `${product.stock?.onHand || 0} en stock` : 'Rupture'}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Plus className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchQuery && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40">
          <p className="text-gray-500 text-center">Aucun produit trouvé pour "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
