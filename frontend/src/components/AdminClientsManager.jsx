import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Eye, Search, Download, RefreshCw, Mail, Phone,
  MapPin, Calendar, DollarSign, TrendingUp, UserCheck,
  Star, Clock, Edit, Wifi
} from 'lucide-react';
import apiService from '../services/api.jsx';
import connectionTracker from '../services/connectionTracker.js';

const AdminClientsManager = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [connectedClients, setConnectedClients] = useState([]);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger les vraies données des clients et commandes
      const [usersData, ordersData] = await Promise.all([
        apiService.getUsers(),
        apiService.getOrders()
      ]);
      
      const users = Array.isArray(usersData) ? usersData : usersData?.users || [];
      const orders = Array.isArray(ordersData) ? ordersData : ordersData?.orders || [];
      
      // Filtrer seulement les clients
      const clientUsers = users.filter(user => user.role === 'client');
      
      // Calculer les statistiques pour chaque client
      const realClients = clientUsers.map(user => {
        const userOrders = orders.filter(order => order.customer === user._id || order.clientId === user._id);
        const totalSpent = userOrders.reduce((sum, order) => sum + (order.totalTTC || order.total || 0), 0);
        const totalOrders = userOrders.length;
        const averageOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
        
        // Déterminer le statut du client
        const lastOrderDate = userOrders.length > 0 
          ? new Date(Math.max(...userOrders.map(o => new Date(o.createdAt || o.orderDate))))
          : new Date(user.createdAt);
        
        const daysSinceLastOrder = Math.floor((new Date() - lastOrderDate) / (1000 * 60 * 60 * 24));
        let status = 'active';
        
        if (totalSpent > 500000) {
          status = 'vip';
        } else if (daysSinceLastOrder > 30 || totalOrders === 0) {
          status = 'inactive';
        }
        
        return {
          id: user._id,
          name: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.name || 'Client',
          email: user.email || 'N/A',
          phone: user.telephone || user.phone || 'N/A',
          address: user.address || 'N/A',
          registeredAt: user.createdAt || new Date().toISOString(),
          lastPurchase: userOrders.length > 0 ? lastOrderDate.toISOString() : user.createdAt,
          totalSpent,
          totalOrders,
          averageOrderValue,
          status,
          loyaltyPoints: Math.floor(totalSpent / 1000), // 1 point par 1000 GNF
          preferredCategories: ['Médicaments'], // Par défaut
          notes: `Client ${status === 'vip' ? 'VIP' : status === 'inactive' ? 'inactif' : 'actif'}`,
          isConnected: connectedClients.includes(user._id)
        };
      });
      
      setClients(realClients);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  }, [connectedClients]);

  useEffect(() => {
    loadClients();
    
    // Écouter les changements de connexions
    const unsubscribe = connectionTracker.addListener((connectedClientIds) => {
      setConnectedClients(connectedClientIds);
    });
    
    // Initialiser la liste des clients connectés
    setConnectedClients(connectionTracker.getConnectedClients());
    
    return unsubscribe;
  }, [loadClients]);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'vip': return 'VIP';
      case 'blocked': return 'Bloqué';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    
    let matchesFilter = true;
    if (filterType === 'connected') {
      matchesFilter = client.isConnected;
    } else if (filterType !== 'all') {
      matchesFilter = client.status === filterType;
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString() + ' GNF';
  };

  const getClientStats = () => {
    const activeClients = filteredClients.filter(c => c.status === 'active').length;
    const vipClients = filteredClients.filter(c => c.status === 'vip').length;
    const connectedClientsCount = filteredClients.filter(c => c.isConnected).length;
    const totalRevenue = filteredClients.reduce((sum, client) => sum + client.totalSpent, 0);
    const averageSpent = totalRevenue / filteredClients.length || 0;

    return { activeClients, vipClients, connectedClientsCount, totalRevenue, averageSpent };
  };

  const stats = getClientStats();

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
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestion des clients</h2>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {filteredClients.length} clients
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={loadClients}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <Wifi className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Connectés</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.connectedClientsCount}</p>
        </div>
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Clients actifs</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeClients}</p>
        </div>
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Clients VIP</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.vipClients}</p>
        </div>
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">CA total</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Panier moyen</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(Math.round(stats.averageSpent))}
          </p>
        </div>
      </div>

      {/* Filters */}
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
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
              <option value="all">Tous les clients</option>
              <option value="connected">Connectés maintenant</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="vip">VIP</option>
              <option value="blocked">Bloqués</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  client.status === 'vip' ? 'bg-purple-100' : 
                  client.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Users className={`h-5 w-5 ${
                    client.status === 'vip' ? 'text-purple-600' : 
                    client.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    {client.isConnected && (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        <Wifi className="h-3 w-3" />
                        <span>En ligne</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">ID: {client.id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(client.status)}`}>
                {getStatusLabel(client.status)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-3 w-3" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{client.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Total dépensé</p>
                <p className="font-semibold text-green-600">{formatCurrency(client.totalSpent)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Commandes</p>
                <p className="font-semibold text-gray-900">{client.totalOrders}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Panier moyen</p>
                <p className="font-semibold text-blue-600">{formatCurrency(client.averageOrderValue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Points fidélité</p>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <p className="font-semibold text-yellow-600">{client.loyaltyPoints}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Dernier achat: {formatDate(client.lastPurchase)}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewDetails(client)}
                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                  title="Voir détails"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' 
              ? 'Aucun client ne correspond à vos critères de recherche.' 
              : 'Aucun client enregistré pour le moment.'}
          </p>
        </div>
      )}

      {/* Client Details Modal */}
      {showDetails && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Profil client - {selectedClient.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedClient.status)}`}>
                    {getStatusLabel(selectedClient.status)}
                  </span>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Informations personnelles</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedClient.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Inscrit le {formatDate(selectedClient.registeredAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Statistiques d'achat</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total dépensé:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(selectedClient.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre de commandes:</span>
                      <span className="font-semibold">{selectedClient.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Panier moyen:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(selectedClient.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Points fidélité:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-yellow-600">{selectedClient.loyaltyPoints}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dernier achat:</span>
                      <span className="font-semibold">{formatDate(selectedClient.lastPurchase)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferred Categories */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Catégories préférées</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.preferredCategories.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Notes</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-200">{selectedClient.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button 
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Modifier
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Historique des commandes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientsManager;
