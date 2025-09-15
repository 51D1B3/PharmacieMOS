import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Package, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Filter, 
  ChevronDown, 
  X, 
  ArrowUpDown,
  Star,
  Tag,
  BarChart2,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
      const response = await fetch('http://localhost:5005/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      const fetchedProducts = data?.data && Array.isArray(data.data) ? data.data : [];
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* En-tête avec actions */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des produits</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez l'ensemble de votre catalogue produits
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={loadProducts}
              className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Actualiser</span>
            </button>
            
            <div className="relative group">
              <button className="flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                <span>Exporter</span>
                <ChevronDown className="h-4 w-4 ml-1.5 text-gray-400" />
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <span>CSV</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <span>Excel</span>
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <span>PDF</span>
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setShowNewProductModal(true)}
              className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Ajouter un produit</span>
            </button>
          </div>
        </div>
        
        {/* Barre de statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-700 font-medium mb-1">Total produits</div>
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <div className="text-xs text-blue-600 mt-1">
              {products.length > 0 ? 'Mise à jour aujourd\'hui' : 'Aucun produit'}
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-700 font-medium mb-1">En stock</div>
            <div className="text-2xl font-bold text-gray-900">
              {products.filter(p => (p.stock?.onHand || 0) > 0).length}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {products.length > 0 ? `${Math.round((products.filter(p => (p.stock?.onHand || 0) > 0).length / products.length) * 100)}% du stock` : '--'}
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm text-yellow-700 font-medium mb-1">Stock faible</div>
            <div className="text-2xl font-bold text-gray-900">
              {products.filter(p => {
                const stock = p.stock?.onHand || 0;
                const threshold = p.stock?.thresholdAlert || 5;
                return stock > 0 && stock <= threshold;
              }).length}
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              À réapprovisionner
            </div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm text-red-700 font-medium mb-1">Rupture</div>
            <div className="text-2xl font-bold text-gray-900">
              {products.filter(p => (p.stock?.onHand || 0) === 0).length}
            </div>
            <div className="text-xs text-red-600 mt-1">
              {products.length > 0 ? `${Math.round((products.filter(p => (p.stock?.onHand || 0) === 0).length / products.length) * 100)}% du stock` : '--'}
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-purple-700 font-medium mb-1">En promotion</div>
            <div className="text-2xl font-bold text-gray-900">
              {products.filter(p => p.discount > 0).length}
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {products.length > 0 ? `${Math.round((products.filter(p => p.discount > 0).length / products.length) * 100)}% des produits` : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un produit par nom, référence, code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          
          {/* Filtres rapides */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            >
              <option value="all">Toutes catégories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            >
              <option value="all">Tous les stocks</option>
              <option value="available">En stock</option>
              <option value="low">Stock faible</option>
              <option value="out">Rupture</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            >
              <option value="name">Trier par</option>
              <option value="name_asc">Nom (A-Z)</option>
              <option value="name_desc">Nom (Z-A)</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="stock_asc">Stock croissant</option>
              <option value="stock_desc">Stock décroissant</option>
              <option value="date_desc">Plus récent</option>
              <option value="date_asc">Plus ancien</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Aucun produit ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou ajoutez un nouveau produit.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStockFilter('all');
                loadProducts();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <span>Produit</span>
                    <button 
                      onClick={() => setSortBy(prev => prev === 'name_asc' ? 'name_desc' : 'name_asc')}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <span>Catégorie</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <span>Prix</span>
                    <button 
                      onClick={() => setSortBy(prev => prev === 'price_asc' ? 'price_desc' : 'price_asc')}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <span>Stock</span>
                    <button 
                      onClick={() => setSortBy(prev => prev === 'stock_asc' ? 'stock_desc' : 'stock_asc')}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <img
                            className="h-10 w-10 rounded-lg object-cover border border-gray-200 bg-white p-0.5"
                            src={getProductImageUrl(product.image || product.images?.[0], product.name)}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/100x100.png/f3f4f6/9ca3af?text=${encodeURIComponent(product.name?.substring(0, 2).toUpperCase() || 'PR')}`;
                            }}
                          />
                          {product.discount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              %
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate max-w-[200px]">
                            {product.name || 'Nom non défini'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <span className="truncate max-w-[180px]">
                              {product.brand || 'Marque non définie'}
                            </span>
                            {product.sku && (
                              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">
                                {product.sku}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category || 'Non catégorisé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {formatPrice(product.priceTTC || 0)}
                          {product.discount > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-medium rounded">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                        {product.discount > 0 && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice((product.priceTTC || 0) * (1 + (product.discount / 100)))}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">HT: {formatPrice(product.priceHT || 0)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                            (product.stock?.onHand || 0) === 0 ? 'bg-red-500' : 
                            (product.stock?.onHand || 0) <= (product.stock?.thresholdAlert || 5) ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></span>
                          <span className="font-semibold text-gray-900">{product.stock?.onHand || 0} unités</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                (product.stock?.onHand || 0) === 0 ? 'bg-red-500' : 
                                (product.stock?.onHand || 0) <= (product.stock?.thresholdAlert || 5) ? 'bg-yellow-500' : 'bg-green-500'
                              }`} 
                              style={{
                                width: `${Math.min(100, ((product.stock?.onHand || 0) / ((product.stock?.onHand || 0) + 10)) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                            <span>Seuil: {product.stock?.thresholdAlert || 5}</span>
                            <span>Max: {Math.max((product.stock?.onHand || 0) + 10, 20)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stockStatus.status === 'out' 
                          ? 'bg-red-100 text-red-800' 
                          : stockStatus.status === 'low' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {stockStatus.status === 'out' ? (
                          <>
                            <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
                            Rupture
                          </>
                        ) : stockStatus.status === 'low' ? (
                          <>
                            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 mr-1.5"></span>
                            Stock faible
                          </>
                        ) : (
                          <>
                            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                            En stock
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => {
                            // Action pour voir les détails
                            console.log('Voir détails du produit:', product._id);
                          }}
                          className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-gray-400 hover:text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="h-5 w-px bg-gray-200 mx-1"></div>
                        <button 
                          onClick={() => {
                            // Action pour dupliquer le produit
                            console.log('Dupliquer le produit:', product._id);
                          }}
                          className="text-gray-400 hover:text-purple-600 p-1.5 rounded-full hover:bg-purple-50 transition-colors"
                          title="Dupliquer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
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

      {/* Pied de tableau avec pagination */}
      <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Précédent
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de <span className="font-medium">1</span> à <span className="font-medium">10</span> sur{' '}
              <span className="font-medium">{filteredProducts.length}</span> résultats
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Précédent</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                1
              </button>
              <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                2
              </button>
              <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                3
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Suivant</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
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
