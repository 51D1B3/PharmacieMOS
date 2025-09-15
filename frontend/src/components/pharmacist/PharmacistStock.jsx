import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Search, Eye, 
  TrendingDown, TrendingUp, Clock, Phone
} from 'lucide-react';

const PharmacistStock = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedProducts = data.map(p => ({
          id: p._id,
          name: p.name,
          category: p.category,
          currentStock: p.stock?.onHand || 0,
          minStock: p.stock?.thresholdAlert || 10,
          maxStock: (p.stock?.thresholdAlert || 10) * 10,
          price: p.priceTTC,
          lastUpdated: p.updatedAt,
          supplier: 'Fournisseur principal'
        }));
        setProducts(formattedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setProducts([]);
    }
  };

  const getStockStatus = (product) => {
    if (product.currentStock === 0) {
      return { status: 'out', label: 'Rupture', color: 'red' };
    } else if (product.currentStock <= product.minStock) {
      return { status: 'low', label: 'Stock faible', color: 'orange' };
    } else if (product.currentStock >= product.maxStock * 0.8) {
      return { status: 'high', label: 'Stock élevé', color: 'green' };
    } else {
      return { status: 'normal', label: 'Stock normal', color: 'blue' };
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const status = getStockStatus(product).status;
    return matchesSearch && status === filterStatus;
  });

  const handleContactAdmin = (product) => {
    const adminPhone = '+224623841149';
    const message = encodeURIComponent(
      `Alerte stock - ${product.name}\n` +
      `Stock actuel: ${product.currentStock}\n` +
      `Stock minimum: ${product.minStock}\n` +
      `Fournisseur: ${product.supplier}\n` +
      `Merci de procéder au réapprovisionnement.`
    );
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStockPercentage = (product) => {
    return Math.round((product.currentStock / product.maxStock) * 100);
  };

  const lowStockProducts = products.filter(p => getStockStatus(p).status === 'low' || getStockStatus(p).status === 'out');

  return (
    <div className="space-y-6">
      {/* Alertes de stock */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  Alertes de Stock ({lowStockProducts.length})
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Produits nécessitant un réapprovisionnement
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowStockAlert(!showStockAlert)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              {showStockAlert ? 'Masquer' : 'Voir détails'}
            </button>
          </div>
          
          {showStockAlert && (
            <div className="mt-4 space-y-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Stock: {product.currentStock} / Min: {product.minStock}
                    </p>
                  </div>
                  <button
                    onClick={() => handleContactAdmin(product)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Alerter Admin</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contrôles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Suivi des Stocks</h3>
              <p className="text-gray-600 dark:text-gray-300">{filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Tous les statuts</option>
            <option value="out">Rupture de stock</option>
            <option value="low">Stock faible</option>
            <option value="normal">Stock normal</option>
            <option value="high">Stock élevé</option>
          </select>
        </div>

        {/* Liste des produits */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock Actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dernière MAJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const percentage = getStockPercentage(product);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category} - {product.price.toLocaleString()} GNF
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {product.currentStock} / {product.maxStock}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-${stockStatus.color}-500`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${stockStatus.color}-100 text-${stockStatus.color}-800 dark:bg-${stockStatus.color}-900/50 dark:text-${stockStatus.color}-200`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {product.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(product.lastUpdated).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setSelectedProduct(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {(stockStatus.status === 'low' || stockStatus.status === 'out') && (
                          <button 
                            onClick={() => handleContactAdmin(product)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Alerter l'admin"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Message si aucun produit */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Modifiez vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Modal de détails du produit */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Détails du Stock
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProduct.category}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Stock actuel</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProduct.currentStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Stock minimum</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProduct.minStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Stock maximum</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProduct.maxStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Prix unitaire</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProduct.price.toLocaleString()} GNF</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Fournisseur</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedProduct.supplier}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Fermer
              </button>
              {(getStockStatus(selectedProduct).status === 'low' || getStockStatus(selectedProduct).status === 'out') && (
                <button
                  onClick={() => {
                    handleContactAdmin(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>Alerter Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistStock;