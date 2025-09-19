import React, { useState, useEffect } from 'react';
import { Package, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';

const AdminProductsGrid = () => {
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
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath.startsWith('/') ? `${API_BASE_URL}${imagePath}` : `${API_BASE_URL}/uploads/products/${imagePath}`;
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Produits ({products?.length || 0})
        </h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Ajouter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.isArray(products) && products.map((product) => (
          <div key={product._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="relative h-32 bg-gray-100 dark:bg-gray-600 rounded-lg mb-3 overflow-hidden">
              {product.image ? (
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center" style={{display: product.image ? 'none' : 'flex'}}>
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 truncate">
              {product.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.category}</p>
            <p className="text-sm font-semibold text-blue-600 mb-3">
              {product.priceTTC?.toLocaleString()} GNF
            </p>
            
            <div className="flex space-x-1">
              <button className="flex-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 p-1 rounded text-xs">
                <Edit className="h-3 w-3 mx-auto" />
              </button>
              <button className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 p-1 rounded text-xs">
                <Eye className="h-3 w-3 mx-auto" />
              </button>
              <button className="flex-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-1 rounded text-xs">
                <Trash2 className="h-3 w-3 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductsGrid;