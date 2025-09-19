import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';

const PharmacistProductsGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return `https://via.placeholder.com/200x200/e5e7eb/6b7280?text=Produit`;
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath.startsWith('/') ? `${API_BASE_URL}${imagePath}` : `${API_BASE_URL}/uploads/products/${imagePath}`;
  };

  const getStockStatus = (product) => {
    const stock = product.stock?.onHand || 0;
    const threshold = product.stock?.thresholdAlert || 10;
    
    if (stock === 0) return { status: 'out', color: 'red', label: 'Rupture' };
    if (stock <= threshold) return { status: 'low', color: 'yellow', label: 'Stock faible' };
    return { status: 'ok', color: 'green', label: 'En stock' };
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Catalogue Produits ({products?.length || 0})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.isArray(products) && products.map((product) => {
          const stockStatus = getStockStatus(product);
          return (
            <div key={product._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="relative h-32 bg-gray-100 dark:bg-gray-600 rounded-lg mb-3 overflow-hidden">
                <img
                  src={getImageUrl(product.image || product.images?.[0])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/200x200/e5e7eb/6b7280?text=${encodeURIComponent((product.name || 'Produit').substring(0, 8))}`;
                  }}
                />
                
                {stockStatus.status !== 'ok' && (
                  <div className={`absolute top-2 left-2 bg-${stockStatus.color}-500 text-white text-xs px-2 py-1 rounded-full`}>
                    {stockStatus.label}
                  </div>
                )}
              </div>
              
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 truncate">
                {product.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                Stock: {product.stock?.onHand || 0}
              </p>
              <p className="text-sm font-semibold text-blue-600 mb-3">
                {product.priceTTC?.toLocaleString()} GNF
              </p>
              
              <button 
                disabled={stockStatus.status === 'out'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-xs flex items-center justify-center space-x-1"
              >
                <ShoppingCart className="h-3 w-3" />
                <span>Vendre</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PharmacistProductsGrid;