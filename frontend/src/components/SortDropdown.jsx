import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SortDropdown = ({ products, onProductsChange, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const dropdownRef = useRef(null);

  // L'URL de base de votre API, à mettre dans un fichier de config (.env) idéalement
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const sortOptions = [
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'name_asc', label: 'Nom A-Z' },
    { value: 'name_desc', label: 'Nom Z-A' },
    { value: 'popularity', label: 'Popularité' },
    { value: 'newest', label: 'Plus récents' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (sortValue) => {
    setSelectedSort(sortValue);
    let sortedProducts = [...products];

    switch (sortValue) {
      case 'price_asc':
        sortedProducts.sort((a, b) => (a.discountedPrice ?? a.priceTTC) - (b.discountedPrice ?? b.priceTTC));
        break;
      case 'price_desc':
        sortedProducts.sort((a, b) => (b.discountedPrice ?? b.priceTTC) - (a.discountedPrice ?? a.priceTTC));
        break;
      case 'name_asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popularity':
        sortedProducts.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
        break;
      case 'newest':
        sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        break;
    }

    onProductsChange(sortedProducts);
    setIsOpen(false);
  };

  const getSelectedLabel = () => {
    const option = sortOptions.find(opt => opt.value === selectedSort);
    return option ? option.label : 'Trier par';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 flex items-center space-x-2 bg-white hover:bg-gray-50 transition-colors"
      >
        <span>{getSelectedLabel()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="grid grid-cols-2 gap-0">
            {/* Options de tri */}
            <div className="p-2 border-r border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2 px-2">Options de tri</h4>
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                      selectedSort === option.value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aperçu des produits */}
            <div className="p-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu produits</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {products.slice(0, 6).map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                    onMouseEnter={() => setHoveredProduct(product)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      <img 
                        src={product.image ? `${API_URL}${product.image}` : `https://via.placeholder.com/150?text=${encodeURIComponent(product.name)}`} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=No+Image" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                    <p className="text-xs text-primary-600 font-medium">
                      {((product.discountedPrice ?? product.priceTTC) || 0).toFixed(2)} GNF
                      </p>
                    </div>
                  </div>
                ))}
                {products.length > 6 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    +{products.length - 6} autres produits
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Produit survolé en détail */}
          {hoveredProduct && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={hoveredProduct.image ? `${API_URL}${hoveredProduct.image}` : `https://via.placeholder.com/150?text=${encodeURIComponent(hoveredProduct.name)}`} 
                    alt={hoveredProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=No+Image" }}
                  />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">{hoveredProduct.name}</h5>
                  <p className="text-sm text-primary-600 font-medium">{((hoveredProduct.discountedPrice ?? hoveredProduct.priceTTC) || 0).toFixed(2)} GNF</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {hoveredProduct.description?.substring(0, 60)}...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
