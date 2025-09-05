import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Package } from 'lucide-react';

const CategoryDropdown = ({ categories, products, onProductSelect }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (selectedCategory) {
      const categoryProducts = products.filter(product => 
        product.category === selectedCategory._id || 
        product.category?._id === selectedCategory._id
      );
      setFilteredProducts(categoryProducts);
    }
  }, [selectedCategory, products]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setSelectedCategory(null);
    }, 300);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleProductClick = (product) => {
    onProductSelect(product);
    setIsOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div 
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        <Package className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Trier par catégorie</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex">
            {/* Categories List */}
            <div className="w-1/2 border-r border-gray-200">
              <div className="p-3 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">Catégories</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                      selectedCategory?._id === category._id ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {category.icon && <span className="text-sm">{category.icon}</span>}
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Products List */}
            <div className="w-1/2">
              <div className="p-3 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">
                  {selectedCategory ? `Produits - ${selectedCategory.name}` : 'Produits'}
                </h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {selectedCategory ? (
                  filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product)}
                        className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          {product.image ? (
                            <img
                              src={`${process.env.REACT_APP_API_URL}${product.image}`}
                              alt={product.name || 'Product image'}
                              className="w-10 h-10 object-cover rounded-md"
                              onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=No+Image" }} // Fallback for broken images
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {product.brand} - {product.dosage}
                            </p>
                            <p className="text-sm font-medium text-primary-600">
                              {product.priceTTC?.toFixed(2) || '0.00'} €
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Aucun produit dans cette catégorie</p>
                    </div>
                  )
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">Sélectionnez une catégorie</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
