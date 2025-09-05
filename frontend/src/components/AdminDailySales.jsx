import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Clock, CreditCard, Smartphone, Banknote, 
  RefreshCw, Calendar, TrendingUp, Eye, Filter
} from 'lucide-react';
import apiService from '../services/api.jsx';
import { formatPrice } from '../services/priceFormatter';

const AdminDailySales = () => {
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    cashSales: 0,
    mobileMoneySales: 0,
    cardSales: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    loadDailySales();
    // Actualiser toutes les 30 secondes pour les ventes en temps réel
    const interval = setInterval(loadDailySales, 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadDailySales = async () => {
    try {
      setLoading(true);
      const ordersData = await apiService.getOrders();
      const orders = Array.isArray(ordersData) ? ordersData : ordersData?.orders || [];
      
      // Filtrer les ventes du jour sélectionné
      const selectedDateStr = selectedDate;
      const todaySales = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === selectedDateStr && 
               (order.orderType === 'vente_pos' || order.status === 'completed');
      });

      // Trier par heure (plus récent en premier)
      const sortedSales = todaySales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Calculer les statistiques
      const totalAmount = sortedSales.reduce((sum, sale) => sum + (sale.totalTTC || sale.total || 0), 0);
      const cashSales = sortedSales.filter(sale => sale.payment?.method === 'cash').length;
      const mobileMoneySales = sortedSales.filter(sale => 
        sale.payment?.method === 'orange_money' || 
        sale.payment?.method === 'mtn_money' ||
        sale.payment?.method === 'mobile_money'
      ).length;
      const orangeMoneySales = sortedSales.filter(sale => sale.payment?.method === 'orange_money').length;

      setDailySales(sortedSales);
      setStats({
        totalSales: sortedSales.length,
        totalAmount,
        cashSales,
        mobileMoneySales,
        orangeMoneySales
      });
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'orange_money': return 'Orange Money';
      case 'mtn_money': return 'MTN Money';
      case 'mobile_money': return 'Mobile Money';
      case 'card': return 'Carte bancaire';
      case 'orange_money': return 'Orange Money';
      default: return 'Non spécifié';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4 text-green-600" />;
      case 'orange_money': return <Smartphone className="h-4 w-4 text-orange-600" />;
      case 'mtn_money': return <Smartphone className="h-4 w-4 text-yellow-600" />;
      case 'mobile_money': return <Smartphone className="h-4 w-4 text-blue-600" />;
      case 'card': return <CreditCard className="h-4 w-4 text-purple-600" />;
      case 'orange_money': return <Smartphone className="h-4 w-4 text-orange-600" />;
      default: return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return formatPrice(amount);
  };

  const filteredSales = dailySales.filter(sale => {
    if (paymentFilter === 'all') return true;
    return sale.payment?.method === paymentFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Ventes du Jour</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Mise à jour automatique</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button 
            onClick={loadDailySales}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Ventes</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalSales}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Montant Total</span>
          </div>
          <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(stats.totalAmount)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <Banknote className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Espèces</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.cashSales}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Mobile Money</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.mobileMoneySales}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Orange Money</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.orangeMoneySales}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Tous les paiements</option>
            <option value="cash">Espèces</option>
            <option value="orange_money">Orange Money</option>
            <option value="mtn_money">MTN Money</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Carte bancaire</option>
          </select>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Détail des Ventes ({filteredSales.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune vente</h3>
              <p className="text-gray-600">
                Aucune vente enregistrée pour cette date.
              </p>
            </div>
          ) : (
            filteredSales.map((sale) => (
              <div key={sale._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(sale.payment?.method)}
                      <div>
                        <p className="font-medium text-gray-900">
                          Vente #{sale.orderNumber || sale._id.slice(-6)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(sale.createdAt)}</span>
                          </div>
                          <span>•</span>
                          <span>{getPaymentMethodLabel(sale.payment?.method)}</span>
                          {sale.payment?.status === 'paid' && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-medium">Payé</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(sale.totalTTC || sale.total || 0)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {sale.items?.length || 0} article{(sale.items?.length || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {sale.items && sale.items.length > 0 && (
                  <div className="mt-3 pl-6">
                    <div className="text-sm text-gray-600">
                      <strong>Produits:</strong> {sale.items.map(item => 
                        `${item.product?.name || 'Produit'} (x${item.quantity})`
                      ).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDailySales;
