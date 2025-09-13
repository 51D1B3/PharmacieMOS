import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, AlertTriangle, Eye, Edit, Trash2, Plus, Filter } from 'lucide-react';
import apiService from '../services/api.jsx';
import { formatPrice } from '../services/priceFormatter';
import { getProductImageUrl } from '../utils/imageUtils';
import NewProductModal from './NewProductModal.jsx';

const AdminProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const filterAndSortProducts = useCallback(() => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = (product.stock?.onHand || 0) <= (product.stock?.thresholdAlert || 5);
      } else if (stockFilter === 'out') {
        matchesStock = (product.stock?.onHand || 0) === 0;
      } else if (stockFilter === 'available') {
        matchesStock = (product.stock?.onHand || 0) > 0;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
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
        case 'stock_asc':
          return (a.stock?.onHand || 0) - (b.stock?.onHand || 0);
        case 'stock_desc':
          return (b.stock?.onHand || 0) - (a.stock?.onHand || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts({ limit: 500 });
      const fetchedProducts = response?.data && Array.isArray(response.data) ? response.data : [];
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories;
  };

  const getStockStatus = (product) => {
    const stock = product.stock?.onHand || 0;
    const threshold = product.stock?.thresholdAlert || 5;
    
    if (stock === 0) return { status: 'out', label: 'Rupture', color: 'bg-red-100 text-red-800' };
    if (stock <= threshold) return { status: 'low', label: 'Stock faible', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'good', label: 'En stock', color: 'bg-green-100 text-green-800' };
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowNewProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await apiService.deleteProduct(productId);
        await loadProducts();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleProductCreated = () => {
    setShowNewProductModal(false);
    setEditingProduct(null);
    loadProducts();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Gestion des Produits</h3>
            <p className="text-gray-600">{filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} affiché{filteredProducts.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowNewProductModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau produit</span>
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Barre de recherche */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, marque, référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtre catégorie */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Toutes catégories</option>
          {getUniqueCategories().map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        {/* Filtre stock */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les stocks</option>
          <option value="available">En stock</option>
          <option value="low">Stock faible</option>
          <option value="out">Rupture</option>
        </select>
      </div>

      {/* Options de tri */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Trier par:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Nom A-Z</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="stock_desc">Stock décroissant</option>
            <option value="stock_asc">Stock croissant</option>
          </select>
        </div>
        <button
          onClick={loadProducts}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
        >
          <Package className="h-4 w-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Liste des produits */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600">Modifiez vos critères de recherche ou ajoutez de nouveaux produits</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                            src={getProductImageUrl(product.image || product.images?.[0], product.name)}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/100x100.png/f3f4f6/9ca3af?text=${encodeURIComponent(product.name?.substring(0, 2) || 'PR')}`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                          <div className="text-xs text-gray-400">Réf: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {product.category || 'Non catégorisé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-semibold">{formatPrice(product.priceTTC)}</div>
                        <div className="text-xs text-gray-500">HT: {formatPrice(product.priceHT)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">{product.stock?.onHand || 0} unités</div>
                        <div className="text-xs text-gray-500">Seuil: {product.stock?.thresholdAlert || 5}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert('Fonctionnalité de visualisation à implémenter')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Produits</p>
              <p className="text-2xl font-bold text-blue-700">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Stock</p>
              <p className="text-2xl font-bold text-purple-700">
                {products.reduce((total, p) => total + (p.stock?.onHand || 0), 0)}
              </p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">En Stock</p>
              <p className="text-2xl font-bold text-green-700">
                {products.filter(p => (p.stock?.onHand || 0) > 0).length}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Stock Faible</p>
              <p className="text-2xl font-bold text-yellow-700">
                {products.filter(p => {
                  const stock = p.stock?.onHand || 0;
                  const threshold = p.stock?.thresholdAlert || 5;
                  return stock > 0 && stock <= threshold;
                }).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Rupture</p>
              <p className="text-2xl font-bold text-red-700">
                {products.filter(p => (p.stock?.onHand || 0) === 0).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Modal de création/modification de produit */}
      {showNewProductModal && (
        <NewProductModal 
          onClose={() => {
            setShowNewProductModal(false);
            setEditingProduct(null);
          }}
          onProductCreated={handleProductCreated}
          editingProduct={editingProduct}
        />
      )}
    </div>
  );
};

export default AdminProductsManager;
