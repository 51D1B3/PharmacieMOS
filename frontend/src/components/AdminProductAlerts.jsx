import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Package, Calendar, Eye, Edit, Trash2, 
  Search, Filter, RefreshCw, Download, Bell, Clock
} from 'lucide-react';
import { apiService as api } from '../services/api';

const AdminProductAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadProductAlerts();
  }, []);

  const loadProductAlerts = async () => {
    try {
      setLoading(true);
      // Récupérer les produits avec stock faible (≤ 50 unités)
      const response = await api.get('/products/alerts/low-stock');
      const lowStockProducts = response.data.data;
      
      // Transformer les données pour les adapter au format d'alerte
      const productAlerts = lowStockProducts.map(product => {
        const stockAvailable = product.stock.onHand - (product.stock.reserved || 0);
        let alertType = 'low_stock';
        let priority = 'medium';
        
        // Déterminer le type d'alerte et la priorité basé sur le stock disponible
        if (stockAvailable <= 10) {
          alertType = 'critical_stock';
          priority = 'high';
        } else if (stockAvailable <= 25) {
          alertType = 'low_stock';
          priority = 'medium';
        } else if (stockAvailable <= 50) {
          alertType = 'stock_alert_50';
          priority = 'low';
        }
        
        return {
          id: product._id,
          name: product.name,
          currentStock: stockAvailable,
          minThreshold: product.stock.thresholdAlert || 10,
          maxThreshold: product.stock.maxStock || 100,
          alertType: alertType,
          expiryDate: product.expiryDate,
          supplier: product.supplierId?.name || 'Inconnu',
          lastRestocked: product.updatedAt,
          priority: priority,
          category: product.category?.name || 'Non catégorisé',
          sku: product.sku
        };
      });
      
      setAlerts(productAlerts);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'low_stock': return 'Stock faible';
      case 'critical_stock': return 'Stock critique';
      case 'stock_alert_50': return 'Stock tend à finir (≤50)';
      case 'expiry_soon': return 'Péremption proche';
      case 'expired': return 'Expiré';
      default: return 'Inconnu';
    }
  };

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'low_stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical_stock': return 'bg-red-100 text-red-800 border-red-200';
      case 'stock_alert_50': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expiry_soon': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || alert.alertType === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleRestock = (productId) => {
    console.log('Réapprovisionner le produit:', productId);
    // Implement restock logic
  };

  const handleMarkAsHandled = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Produits en alerte</h2>
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
            {filteredAlerts.length} alertes
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadProductAlerts}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit ou fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="critical_stock">Stock critique</option>
              <option value="low_stock">Stock faible</option>
              <option value="stock_alert_50">Stock tend à finir (≤50)</option>
              <option value="expiry_soon">Péremption proche</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  alert.priority === 'high' ? 'bg-red-100' : 
                  alert.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <Package className={`h-5 w-5 ${getPriorityColor(alert.priority)}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{alert.name}</h3>
                  <p className="text-sm text-gray-600">ID: {alert.id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAlertTypeColor(alert.alertType)}`}>
                {getAlertTypeLabel(alert.alertType)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Stock actuel</p>
                <p className={`font-semibold ${
                  alert.currentStock <= alert.minThreshold / 2 ? 'text-red-600' : 
                  alert.currentStock <= alert.minThreshold ? 'text-yellow-600' : 
                  alert.currentStock <= 50 ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {alert.currentStock} unités
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Seuil minimum</p>
                <p className="font-semibold text-gray-900">{alert.minThreshold} unités</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fournisseur</p>
                <p className="font-medium text-gray-900">{alert.supplier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Catégorie</p>
                <p className="font-medium text-gray-900">{alert.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">SKU</p>
                <p className="font-medium text-gray-900">{alert.sku}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expiration</p>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <p className={`text-sm font-medium ${
                    alert.expiryDate && new Date(alert.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
                      ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {alert.expiryDate ? new Date(alert.expiryDate).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Dernier réassort: {new Date(alert.lastRestocked).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleRestock(alert.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Réapprovisionner
                </button>
                <button 
                  onClick={() => handleMarkAsHandled(alert.id)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                >
                  Traité
                </button>
                <button className="p-1 text-blue-600 hover:text-blue-700">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte trouvée</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' 
              ? 'Aucun produit ne correspond à vos critères de recherche.' 
              : 'Tous vos produits sont bien approvisionnés !'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminProductAlerts;
